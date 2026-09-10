"""Discord adapter. Same wall, different transport."""

from __future__ import annotations

from typing import TextIO

from mapping import Mapping
from scope import ScopeGuard


class DiscordAdapter:
    def __init__(self, mapping: Mapping, guard: ScopeGuard) -> None:
        self.mapping = mapping
        self.guard = guard

    def describe(self, out: TextIO) -> None:
        m = self.mapping
        out.write(f"axiom {m.agent}  scope={m.scope}  platform=discord\n")
        for ch in m.channels:
            out.write(f"  {ch.role:12} {ch.direction:4}  {ch.id}  {ch.name}\n")
        out.write("unknown channel ids are dropped before on_message\n")

    def run(self, collect_seconds: int) -> None:
        for ch in self.mapping.channels:
            self.guard.require(ch.id, "listen")
        raise SystemExit("live Discord requires DISCORD_BOT_TOKEN and discord.py")
