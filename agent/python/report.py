"""Single report shape. Filed to every reports channel, never to a room."""

from __future__ import annotations

from mapping import Mapping
from scope import ScopeGuard


def format_report(
    *,
    mapping: Mapping,
    guard: ScopeGuard,
    broadcast_id: str,
    reply_count: int,
    collect_seconds: int,
) -> str:
    guard.require(broadcast_id, "report")
    rooms = mapping.by_role("room")
    reports = mapping.by_role("reports")
    lines = [
        f"# report from {mapping.agent}",
        f"scope: {mapping.scope}",
        f"broadcast: {guard.redact(broadcast_id)}",
        f"rooms: {len(rooms)}",
        f"replies: {reply_count}",
        f"window: {collect_seconds}s",
        f"filed: {len(reports)} reports channel(s)",
    ]
    return "\n".join(lines) + "\n"
