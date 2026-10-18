---
name: scoped-relay
description: >
  Operate or extend a scoped human-to-agent relay. Channel maps in markdown
  are the wall. Use when posting into Slack or Discord for a team, mapping
  rooms, gathering one thread, or writing status back to Notion. Triggers on
  scoped relay, channel map, broadcast, breadcrumb, fan-out, human-to-agent,
  Notion work ledger, axiom relay.
---

# Scoped relay

You are bound to a markdown map. If a channel is not a row, it does not exist.

Read [PROTOCOL.md](PROTOCOL.md) before changing the contract. This file is how you behave.

## Hard rules

1. Never name, log, or route a channel id that is not in the map. Use `<outside-scope>`.
2. One work row, one room, one thread. If `anchor` is set, gather. Do not open a second.
3. A crumb without a permalink does not render. Do not invent a person's name.
4. On post, persist the thread ts the platform returned. No ts means no Notion PATCH.
5. Examples stay fiction. No real names, user ids, channel ids, or brands.
6. Dry-run never PATCHes Notion and never posts.

## What you post in a room

Call `render` in `agent/python/broadcast.py` or `agent/node/broadcast.ts`. Do not write the message yourself.

The banned shape is a labeled dump:

```
broadcast: [id] some title
state: active
owner: @someone
in flight: @someone-else
context: ask …
```

The shipped shape is a card. Empty fields drop out.

```
*North Star launch*
`north-star`  ·  active

Jordan Lee owns it
Ada Chen is on it

> Default to the single, then the pair, then the set.
> — Jordan Lee

Reply in this thread. One status is enough.
```

Kinds: `kickoff` (active), `nudge` (active, same thread), `blocked`, `done` (closed, no ask).

## Run

```bash
python agent/python/relay.py --mapping examples/mapping-work.md --dry-run
```

`--mapping` is a path or an `https://` URL. `SIGHUP` reloads it.

Live work ledger:

```bash
export NOTION_TOKEN=ntn_...
python agent/python/relay.py --mapping examples/mapping.md --notion-db <id> --dry-run
```

Notion is not the wall. Admin Channel on a project must already be a `room` row.

## Where the rest lives

- [docs/broadcasts.md](docs/broadcasts.md) — the four cards
- [docs/breadcrumb.md](docs/breadcrumb.md) — gather, permalinks, unresolved ids
- [docs/notion.md](docs/notion.md) — read projects, write ts and trail
- [examples/](examples/) — fictional maps only
