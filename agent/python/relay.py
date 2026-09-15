"""Axiom scoped relay.

Reads a channel-mapping markdown file (path or https URL), then:
  1. Listens on management channels (direction: in)
  2. Fans broadcasts into scoped rooms
  3. Collects replies and posts a report

Scope is a wall. Channels not listed in the mapping are invisible.
SIGHUP reloads the map without a restart.
"""

from __future__ import annotations

import argparse
import logging
import signal
import sys
from pathlib import Path

if __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from discord_adapter import DiscordAdapter
from mapping import load_mapping_from
from notion import NotionError, apply_writes, client_from_env, load_work_from_notion
from report import format_report
from scope import ScopeGuard
from slack_adapter import SlackAdapter

ADAPTERS = {
    "slack": SlackAdapter,
    "discord": DiscordAdapter,
}


class Runtime:
    def __init__(self, source: str, platform: str | None, notion_db: str | None = None) -> None:
        self.source = source
        self.platform_override = platform
        self.notion_db = notion_db
        self.reload()

    def reload(self) -> None:
        mapping = load_mapping_from(self.source)
        if self.notion_db:
            mapping = load_work_from_notion(mapping, self.notion_db, client_from_env())
        platform = self.platform_override or mapping.platform
        if platform not in ADAPTERS:
            raise SystemExit(f"unknown platform: {platform}")
        self.mapping = mapping
        self.platform = platform
        self.guard = ScopeGuard(mapping)
        self.adapter = ADAPTERS[platform](mapping, self.guard)
        logging.info("loaded scope=%s ids=%d work=%d", mapping.scope, len(mapping.ids()), len(mapping.work))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="axiom-relay")
    parser.add_argument("--mapping", required=True, help="path or https URL")
    parser.add_argument("--platform", choices=sorted(ADAPTERS))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--collect-seconds", type=int, default=None)
    parser.add_argument("--notion-db", default=None, help="Notion Projects database id")
    args = parser.parse_args(argv)

    try:
        runtime = Runtime(args.mapping, args.platform, args.notion_db)
    except NotionError as err:
        raise SystemExit(str(err)) from err
    collect = args.collect_seconds or runtime.mapping.collect_seconds

    if args.dry_run:
        runtime.adapter.describe(sys.stdout)
        sys.stdout.write(format_report(
            mapping=runtime.mapping,
            guard=runtime.guard,
            broadcast_id=runtime.mapping.by_role("management")[0].id,
            reply_count=0,
            collect_seconds=collect,
        ))
        if args.notion_db:
            for line in apply_writes(client_from_env(), runtime.mapping.plan(), {}, dry_run=True):
                sys.stdout.write(line + "\n")
        return 0

    if hasattr(signal, "SIGHUP"):
        signal.signal(signal.SIGHUP, lambda *_: runtime.reload())

    runtime.adapter.run(collect_seconds=collect)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
