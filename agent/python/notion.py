"""Notion is the live work ledger. Channels stay the markdown wall.

The agent reads the Projects database and writes back:
  - Broadcast TS + Broadcast Permalink after a post
  - Last Status Update after a gather (the breadcrumb trail)

Stdlib HTTP only. Token from NOTION_TOKEN. Dry-run queries and prints
writes; it does not PATCH.
"""

from __future__ import annotations

import json
import os
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from mapping import Mapping, Work

API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"
MAX_BLOCK = 2000

PROPS = {
    "name": "Name",
    "id": "Scope key",
    "room": "Admin Channel",
    "state": "Status",
    "anchor": "Broadcast TS",
    "owner": "Owner",
    "permalink": "Broadcast Permalink",
    "status_update": "Last Status Update",
}

STATES = {
    "active": "active",
    "aligning": "active",
    "in progress": "active",
    "in-progress": "active",
    "blocked": "blocked",
    "closed": "closed",
    "done": "closed",
    "parked": "closed",
}

Transport = Callable[[str, str, dict[str, str], bytes | None], dict[str, Any]]


class NotionError(RuntimeError):
    pass


def default_transport(method: str, url: str, headers: dict[str, str], body: bytes | None) -> dict[str, Any]:
    req = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as err:
        raise NotionError(f"notion {method} {err.code}") from err
    except URLError as err:
        raise NotionError("notion unreachable") from err


class NotionClient:
    def __init__(self, token: str, transport: Transport | None = None) -> None:
        if not token:
            raise NotionError("NOTION_TOKEN is required")
        self.token = token
        self.transport = transport or default_transport

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": "Bearer " + self.token,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
            "User-Agent": "axiom-relay/0.3",
        }

    def _call(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        return self.transport(method, API + path, self._headers(), body)

    def query_work(self, database_id: str) -> tuple[Work, ...]:
        rows: list[Work] = []
        cursor: str | None = None
        while True:
            payload: dict[str, Any] = {"page_size": 100}
            if cursor:
                payload["start_cursor"] = cursor
            data = self._call("POST", "/databases/" + database_id + "/query", payload)
            for page in data.get("results", []):
                w = work_from_page(page)
                if w:
                    rows.append(w)
            if not data.get("has_more"):
                break
            cursor = data.get("next_cursor")
        return tuple(rows)

    def write_anchor(self, page_id: str, ts: str, permalink: str) -> None:
        self._call(
            "PATCH",
            "/pages/" + page_id,
            {
                "properties": {
                    PROPS["anchor"]: rich_text(ts),
                    PROPS["permalink"]: rich_text(permalink),
                }
            },
        )

    def write_trail(self, page_id: str, trail: str) -> None:
        self._call(
            "PATCH",
            "/pages/" + page_id,
            {"properties": {PROPS["status_update"]: rich_text(clip(trail))}},
        )


def clip(text: str) -> str:
    if len(text) <= MAX_BLOCK:
        return text
    suffix = "\n(truncated)"
    return text[: MAX_BLOCK - len(suffix)] + suffix


def rich_text(content: str) -> dict[str, Any]:
    return {"rich_text": [{"type": "text", "text": {"content": content}}]}


def _plain(prop: dict[str, Any] | None) -> str:
    if not prop:
        return ""
    kind = prop.get("type")
    if kind == "title":
        return "".join(t.get("plain_text", "") for t in prop.get("title", []))
    if kind == "rich_text":
        return "".join(t.get("plain_text", "") for t in prop.get("rich_text", []))
    if kind in {"select", "status"}:
        node = prop.get(kind) or {}
        return str(node.get("name") or "")
    if kind == "url":
        return str(prop.get("url") or "")
    if kind == "number" and prop.get("number") is not None:
        return str(prop["number"])
    return ""


def normalize_state(raw: str) -> str:
    return STATES.get(raw.strip().lower(), "active" if raw else "active")


def work_from_page(page: dict[str, Any]) -> Work | None:
    props = page.get("properties") or {}
    name = _plain(props.get(PROPS["name"]))
    key = _plain(props.get(PROPS["id"])) or name.lower().replace(" ", "-")
    if not key:
        return None
    return Work(
        id=key,
        name=name or key,
        room=_plain(props.get(PROPS["room"])),
        state=normalize_state(_plain(props.get(PROPS["state"]))),
        anchor=_plain(props.get(PROPS["anchor"])),
        owner=_plain(props.get(PROPS["owner"])),
        page_id=str(page.get("id") or ""),
    )


def load_work_from_notion(mapping: Mapping, database_id: str, client: NotionClient) -> Mapping:
    return mapping.replace_work(client.query_work(database_id))


def apply_writes(
    client: NotionClient,
    plan: tuple[tuple[Work, str], ...],
    trails: dict[str, str],
    *,
    dry_run: bool,
) -> list[str]:
    """Write anchors and trails back to Notion. Dry-run returns the plan, no PATCH."""
    lines: list[str] = []
    for w, action in plan:
        if not w.page_id:
            lines.append(f"notion  {w.id:16}  skip  no page id")
            continue
        if action == "post":
            lines.append(f"notion  {w.id:16}  POST    write Broadcast TS + Permalink")
            if not dry_run:
                client.write_anchor(w.page_id, w.anchor, trails.get(w.id, ""))
        elif action == "gather":
            lines.append(f"notion  {w.id:16}  GATHER  write Last Status Update")
            if not dry_run:
                client.write_trail(w.page_id, trails.get(w.id, "silent"))
        elif action == "gap":
            lines.append(f"notion  {w.id:16}  GAP     no write")
        else:
            lines.append(f"notion  {w.id:16}  SKIP    closed")
    return lines


def client_from_env(transport: Transport | None = None) -> NotionClient:
    return NotionClient(os.environ.get("NOTION_TOKEN", ""), transport)
