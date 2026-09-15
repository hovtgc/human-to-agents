"""Parse an Axiom mapping markdown file (front matter + table)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.request import Request, urlopen

ROLES = {"management", "room", "reports"}
DIRECTIONS = {"in", "out", "both"}
PLATFORMS = {"slack", "discord"}
WORK_STATES = {"active", "blocked", "closed"}


@dataclass(frozen=True)
class Channel:
    id: str
    name: str
    role: str
    direction: str


@dataclass(frozen=True)
class Work:
    id: str
    name: str
    room: str
    state: str
    anchor: str
    owner: str
    page_id: str = ""


@dataclass(frozen=True)
class Mapping:
    workspace: str
    platform: str
    scope: str
    agent: str
    collect_seconds: int
    channels: tuple[Channel, ...]
    work: tuple[Work, ...]

    def ids(self) -> set[str]:
        return {c.id for c in self.channels}

    def by_role(self, role: str) -> tuple[Channel, ...]:
        return tuple(c for c in self.channels if c.role == role)

    def room_ids(self) -> set[str]:
        return {c.id for c in self.channels if c.role == "room"}

    def plan(self) -> tuple[tuple[Work, str], ...]:
        """Each work row is a broadcast. action is post, gather, skip, or gap."""
        rooms = self.room_ids()
        out: list[tuple[Work, str]] = []
        for w in self.work:
            if not w.room or w.room not in rooms:
                out.append((w, "gap"))
            elif w.state == "closed":
                out.append((w, "skip"))
            elif w.anchor:
                out.append((w, "gather"))
            else:
                out.append((w, "post"))
        return tuple(out)

    def replace_work(self, work: tuple[Work, ...]) -> Mapping:
        return Mapping(
            workspace=self.workspace,
            platform=self.platform,
            scope=self.scope,
            agent=self.agent,
            collect_seconds=self.collect_seconds,
            channels=self.channels,
            work=work,
        )


class MappingError(ValueError):
    pass


def read_source(source: str) -> str:
    if source.startswith(("http://", "https://")):
        req = Request(source, headers={"User-Agent": "axiom-relay/0.3"})
        with urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8")
    return Path(source).read_text(encoding="utf-8")


def load_mapping_from(source: str) -> Mapping:
    return load_mapping(read_source(source))


def load_mapping(text: str) -> Mapping:
    meta, table = _split_front_matter(text)
    channels, work = _parse_tables(table)
    _validate(meta, channels, work)
    return Mapping(
        workspace=meta["workspace"],
        platform=meta["platform"],
        scope=meta["scope"],
        agent=meta["agent"],
        collect_seconds=int(meta.get("collect_seconds", 45)),
        channels=channels,
        work=work,
    )


def _split_front_matter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        raise MappingError("mapping must start with YAML front matter")
    rest = text[3:]
    end = rest.find("\n---")
    if end < 0:
        raise MappingError("unterminated front matter")
    raw, body = rest[:end], rest[end + 4 :]
    meta: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()
    return meta, body


def _parse_tables(body: str) -> tuple[tuple[Channel, ...], tuple[Work, ...]]:
    channels: list[Channel] = []
    work: list[Work] = []
    header: list[str] | None = None
    rows: list[dict[str, str]] = []

    def flush() -> None:
        nonlocal header, rows
        if header:
            cols = set(header)
            if "role" in cols and "direction" in cols:
                for data in rows:
                    channels.append(
                        Channel(
                            id=data.get("id", ""),
                            name=data.get("name", ""),
                            role=data.get("role", ""),
                            direction=data.get("direction", ""),
                        )
                    )
            elif "room" in cols and "state" in cols:
                for data in rows:
                    work.append(
                        Work(
                            id=data.get("id", ""),
                            name=data.get("name", ""),
                            room=data.get("room", ""),
                            state=data.get("state", ""),
                            anchor=data.get("anchor", ""),
                            owner=data.get("owner", ""),
                            page_id=data.get("page_id", ""),
                        )
                    )
        header = None
        rows = []

    for raw in body.splitlines():
        line = raw.strip()
        if not line.startswith("|"):
            flush()
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if set("".join(cells)) <= set("-: "):
            continue
        if header is None:
            header = [c.lower() for c in cells]
            continue
        rows.append(dict(zip(header, cells)))
    flush()
    return tuple(channels), tuple(work)


def _validate(
    meta: dict[str, str],
    channels: tuple[Channel, ...],
    work: tuple[Work, ...],
) -> None:
    for key in ("workspace", "platform", "scope", "agent"):
        if not meta.get(key):
            raise MappingError(f"missing {key}")
    if meta["platform"] not in PLATFORMS:
        raise MappingError(f"unknown platform {meta['platform']!r}")
    ids = [c.id for c in channels]
    if len(ids) != len(set(ids)):
        raise MappingError("duplicate channel id")
    for ch in channels:
        if ch.role not in ROLES:
            raise MappingError(f"unknown role {ch.role!r}")
        if ch.direction not in DIRECTIONS:
            raise MappingError(f"unknown direction {ch.direction!r}")
    if not any(c.role == "management" and c.direction in {"in", "both"} for c in channels):
        raise MappingError("need a management channel with direction in/both")
    if not any(c.role == "reports" and c.direction in {"out", "both"} for c in channels):
        raise MappingError("need a reports channel with direction out/both")
    work_ids = [w.id for w in work]
    if len(work_ids) != len(set(work_ids)):
        raise MappingError("duplicate work id")
    for w in work:
        if w.state and w.state not in WORK_STATES:
            raise MappingError(f"unknown work state {w.state!r}")
