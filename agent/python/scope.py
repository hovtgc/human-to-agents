"""Scope is a wall. Adapters never see ids outside the mapping."""

from __future__ import annotations

import logging

from mapping import Mapping


class ScopeError(PermissionError):
    pass


class ScopeGuard:
    def __init__(self, mapping: Mapping) -> None:
        self.scope = mapping.scope
        self._ids = mapping.ids()

    def allow(self, channel_id: str) -> bool:
        return channel_id in self._ids

    def redact(self, channel_id: str) -> str:
        return channel_id if self.allow(channel_id) else "<outside-scope>"

    def require(self, channel_id: str, action: str) -> None:
        if not self.allow(channel_id):
            raise ScopeError(
                f"blocked {action}: outside scope {self.scope!r}"
            )

    def drop(self, channel_id: str, reason: str) -> None:
        # The raw id never leaves this function.
        logging.info("dropped event source=<outside-scope> reason=%s", reason)
