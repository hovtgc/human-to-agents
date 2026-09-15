"""Broadcast plan and breadcrumb trail. A crumb is a cited reply, or it is omitted."""

from __future__ import annotations

from dataclasses import dataclass

from mapping import Mapping
from scope import ScopeGuard


@dataclass(frozen=True)
class Crumb:
    author_id: str
    author_name: str
    claim: str
    permalink: str


def format_crumb(crumb: Crumb) -> str | None:
    if not crumb.permalink or not crumb.claim:
        return None
    who = crumb.author_name or ("<unresolved:" + crumb.author_id + ">")
    return f"  - {who}: {crumb.claim}  [{crumb.permalink}]"


def format_report(
    *,
    mapping: Mapping,
    guard: ScopeGuard,
    broadcast_id: str,
    reply_count: int,
    collect_seconds: int,
    trails: dict[str, tuple[Crumb, ...]] | None = None,
) -> str:
    if mapping.work:
        return _format_work_report(mapping, guard, trails or {})
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


def _format_work_report(
    mapping: Mapping,
    guard: ScopeGuard,
    trails: dict[str, tuple[Crumb, ...]],
) -> str:
    plan = mapping.plan()
    posts = sum(1 for _, a in plan if a == "post")
    gathers = sum(1 for _, a in plan if a == "gather")
    skips = sum(1 for _, a in plan if a == "skip")
    gaps = sum(1 for _, a in plan if a == "gap")
    lines = [
        f"# report from {mapping.agent}",
        f"scope: {mapping.scope}",
        f"work: {len(plan)}  post: {posts}  gather: {gathers}  skip: {skips}  gaps: {gaps}",
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
        if action == "post":
            lines.append("anchor: (none — post, then gather next run)")
            lines.append("trail: (empty until the thread exists)")
        elif action == "skip":
            lines.append("skip: closed")
        else:
            lines.append(f"anchor: {w.anchor}")
            lines.append("action: gather")
            crumbs = [c for c in (format_crumb(x) for x in trails.get(w.id, ())) if c]
            if crumbs:
                lines.append("trail:")
                lines.extend(crumbs)
            else:
                lines.append("trail: silent (read this thread; do not open another)")
    return "\n".join(lines) + "\n"
