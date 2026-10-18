"""Room messages. Four kinds, one shape. No labeled dumps."""

from __future__ import annotations

from dataclasses import dataclass

from mapping import Mapping, Work

KINDS = ("kickoff", "nudge", "blocked", "done")
STATES = ("active", "blocked", "closed")
EXPECT = {
    "kickoff": "active",
    "nudge": "active",
    "blocked": "blocked",
    "done": "closed",
}
CTA = {
    "kickoff": "Reply in this thread. One status is enough.",
    "nudge": "Still open. Reply in this thread.",
    "blocked": "Blocked. Reply here only if that changed.",
    "done": "Closed.",
}


class BroadcastError(ValueError):
    pass


@dataclass(frozen=True)
class Broadcast:
    kind: str
    work_id: str
    title: str
    state: str
    owner: str = ""
    assignee: str = ""
    quote: str = ""
    quote_from: str = ""
    platform: str = "slack"


def render(b: Broadcast) -> str:
    if b.kind not in KINDS:
        raise BroadcastError(f"unknown kind: {b.kind}")
    if b.state not in STATES:
        raise BroadcastError(f"unknown state: {b.state}")
    if b.state != EXPECT[b.kind]:
        raise BroadcastError(f"{b.kind} requires state {EXPECT[b.kind]}")
    title = _line(b.title)
    work_id = _line(b.work_id)
    if not title or not work_id:
        raise BroadcastError("title and work id are required")
    lines = [_bold(title, b.platform), f"`{work_id}`  ·  {b.state}"]
    who = _who(_line(b.owner), _line(b.assignee))
    if who:
        lines.append("")
        lines.extend(who)
    quote = _line(b.quote)
    if quote:
        lines.append("")
        lines.append("> " + quote)
        frm = _line(b.quote_from)
        if frm:
            lines.append("> — " + frm)
    lines.append("")
    lines.append(CTA[b.kind])
    text = "\n".join(lines) + "\n"
    for banned in ("broadcast:", "state:", "owner:", "in flight:", "context:"):
        if banned in text:
            raise BroadcastError(f"labeled dump leaked: {banned}")
    return text


def kickoff_for(
    work: Work,
    *,
    assignee: str = "",
    quote: str = "",
    quote_from: str = "",
    platform: str = "slack"
) -> str:
    return render(
        Broadcast(
            kind="kickoff",
            work_id=work.id,
            title=work.name or work.id,
            state=work.state,
            owner=work.owner,
            assignee=assignee,
            quote=quote,
            quote_from=quote_from,
            platform=platform,
        )
    )


def preview_posts(mapping: Mapping, platform: str = "slack") -> str:
    """The kickoff each `post` row would drop in its room. Empty if nothing posts."""
    chunks = [
        kickoff_for(w, platform=platform)
        for w, action in mapping.plan()
        if action == "post"
    ]
    if not chunks:
        return ""
    return "# would post\n\n" + "\n".join(chunks)


def _who(owner: str, assignee: str) -> list[str]:
    lines: list[str] = []
    if owner:
        lines.append(f"{owner} owns it")
    if assignee:
        lines.append(f"{assignee} is on it")
    return lines


def _bold(text: str, platform: str) -> str:
    if platform == "discord":
        return f"**{text}**"
    return f"*{text}*"


def _line(text: str) -> str:
    return " ".join(text.split())
