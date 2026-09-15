"""Broadcast plan. With a work table, each row is one project broadcast."""

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
    if mapping.work:
        return _format_work_report(mapping, guard)
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


def _format_work_report(mapping: Mapping, guard: ScopeGuard) -> str:
    plan = mapping.plan()
    posts = sum(1 for _, a in plan if a == "post")
    skips = sum(1 for _, a in plan if a == "skip")
    gaps = sum(1 for _, a in plan if a == "gap")
    lines = [
        f"# report from {mapping.agent}",
        f"scope: {mapping.scope}",
        f"work: {len(plan)}  post: {posts}  skip: {skips}  gaps: {gaps}",
    ]
    for w, action in plan:
        lines.append("")
        lines.append("## " + w.id + " — " + (w.state or "active"))
        if action == "gap":
            lines.append("gaps: room not in map")
            continue
        lines.append(f"room: {guard.redact(w.room)}")
        if w.owner:
            lines.append(f"owner: {w.owner}")
        if action == "skip":
            reason = "already posted" if w.anchor else "closed"
            lines.append(f"anchor: {w.anchor}")
            lines.append(f"skip: {reason}")
        else:
            lines.append("anchor: (none — would post)")
    return "\n".join(lines) + "\n"
