# Notion

Notion is the live work ledger. Markdown is still the wall.

The agent **talks to Notion**. It does not wait for a dumped file.

## What it reads

The Projects database. One row per unit of work.

| Notion property | Work field |
|-----------------|------------|
| Name | `name` |
| Scope key | `id` (falls back to a slug of Name) |
| Admin Channel | `room` — must already be a `room` row in the markdown map |
| Status | `state` (`In Progress`/`Aligning` → active, `Blocked` → blocked, `Done`/`Parked` → closed) |
| Broadcast TS | `anchor` |
| Owner | `owner` |

## What it writes

| After | Notion properties |
|-------|-------------------|
| **post** | `Broadcast TS` (the ts Slack returned), `Broadcast Permalink`. No ts → no PATCH. |
| **gather** | `Last Status Update` (the breadcrumb trail, clipped at 2000 chars with `(truncated)`) |
| **gap** / **skip** | nothing |

Dry-run GETs the database and prints the write plan. It does not PATCH.

## Run

```bash
export NOTION_TOKEN=ntn_...
python agent/python/relay.py --mapping examples/mapping.md --notion-db <database-id> --dry-run
```

Share the integration with the Projects database. Channel ids still have to be in the markdown map — Notion cannot invent a room.
