"""Slack adapter. Dry-run needs no SDK. Live import is deferred."""

from __future__ import annotations

from typing import TextIO

from mapping import Mapping
from scope import ScopeGuard


class SlackAdapter:
    def __init__(self, mapping: Mapping, guard: ScopeGuard) -> None:
        self.mapping = mapping
        self.guard = guard

    def describe(self, out: TextIO) -> None:
        m = self.mapping
        out.write(f"axiom {m.agent}  scope={m.scope}  platform=slack\n")
        for ch in m.channels:
            out.write(f"  {ch.role:12} {ch.direction:4}  {ch.id}  {ch.name}\n")
        rooms = m.by_role("room")
        out.write(f"fan-out: {len(rooms)} room(s)  wall: {len(self.guard._ids)} id(s)\n")

    def run(self, collect_seconds: int) -> None:
        for ch in self.mapping.channels:
            self.guard.require(ch.id, "listen")
        # Live path: slack_sdk WebClient + Socket Mode, filtered by guard.
        raise SystemExit("live Slack requires SLACK_BOT_TOKEN and slack-sdk")
