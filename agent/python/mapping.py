"""Parse an Axiom mapping markdown file (front matter + table)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.request import Request, urlopen

ROLES = {"management", "room", "reports"}
DIRECTIONS = {"in", "out", "both"}
PLATFORMS = {"slack", "discord"}


@dataclass(frozen=True)
class Channel:
    id: str
    name: str
    role: str
    direction: str


@dataclass(frozen=True)
class Mapping:
    workspace: str
    platform: str
    scope: str
    agent: str
    collect_seconds: int
    channels: tuple[Channel, ...]

    def ids(self) -> set[str]:
        return {c.id for c in self.channels}

    def by_role(self, role: str) -> tuple[Channel, ...]:
        return tuple(c for c in self.channels if c.role == role)


class MappingError(ValueError):
    pass


def read_source(source: str) -> str:
    if source.startswith(("http://", "https://")):
        req = Request(source, headers={"User-Agent": "axiom-relay/0.2"})
        with urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8")
    return Path(source).read_text(encoding="utf-8")


def load_mapping_from(source: str) -> Mapping:
    return load_mapping(read_source(source))


def load_mapping(text: str) -> Mapping:
    meta, table = _split_front_matter(text)
    channels = _parse_table(table)
    _validate(meta, channels)
    return Mapping(
        workspace=meta["workspace"],
        platform=meta["platform"],
        scope=meta["scope"],
        agent=meta["agent"],
        collect_seconds=int(meta.get("collect_seconds", 45)),
        channels=channels,
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


def _parse_table(body: str) -> tuple[Channel, ...]:
    rows: list[Channel] = []
    header: list[str] | None = None
    for raw in body.splitlines():
        line = raw.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if header is None:
            header = [c.lower() for c in cells]
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        data = dict(zip(header, cells))
        rows.append(
            Channel(
                id=data["id"],
                name=data.get("name", ""),
                role=data["role"],
                direction=data["direction"],
            )
        )
    return tuple(rows)


def _validate(meta: dict[str, str], channels: tuple[Channel, ...]) -> None:
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
