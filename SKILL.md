---
name: scoped-relay
description: >
  Set up or run a scoped human-to-agent relay. On first load, walk the user
  through the stack before writing anything: Slack or Discord, Python or Node,
  Notion or a markdown work table. Channel maps in markdown are the wall.
  Triggers on scoped relay, channel map, broadcast, breadcrumb, fan-out,
  human-to-agent, Notion work ledger, axiom relay.
---

# Scoped relay

One agent. One map. It only speaks in rooms you listed.

If you just loaded this, do not write a file yet. Read the outline, then walk the user through [Pick your stack](#pick-your-stack). Wait for their answers.

## Outline

1. **What it is** — a relay with a wall, not a chatbot.
2. **How a message moves** — one room, one thread, then a report.
3. **Where the data lives** — channels in markdown, projects in Notion or a table.
4. **Pick your stack** — ask, then give them the one command.
5. **Rules** — what you must not do.
6. **The room message** — a card, never a labeled dump.

## What it is

People do not prompt the agent into the right room. A markdown file lists the channel ids. The agent reads that file and refuses everything else.

Three roles, no more:

| role | direction | job |
|------|-----------|-----|
| `management` | in | where a broadcast starts |
| `room` | both | the only places it may speak |
| `reports` | out | where the gathered trail is filed |

## How a message moves

```
you (or Notion)          the agent                 one room
work row, no thread  →   posts one kickoff card →  people reply in that thread
work row, has thread →   reads that thread only →  does not open a second
                              ↓
                    report channel  +  Notion, if you use it
```

A row with no thread is a **post**. A row that already has a thread id is a **gather**. A room that is not in the map is a **gap** — reported, never guessed. A closed row is a **skip**.

## Where the data lives

Two stores. Do not mix them up.

| | Channels (the wall) | Projects (the work) |
|---|---|---|
| What | channel id, name, role | one broadcast: room, state, owner, thread |
| Lives in | markdown. Always. A path or an `https://` URL. | **Notion** Projects database, live. Or a `work` table in that same markdown file if you are not on Notion yet. |
| Who writes | you | the agent writes the thread id back after a post, and the trail after a gather |
| Token | `SLACK_BOT_TOKEN` or `DISCORD_BOT_TOKEN` | `NOTION_TOKEN` plus `--notion-db` |

Notion is not the wall. A project's Admin Channel still has to be a `room` row in the markdown, or the agent will not speak there.

Thread id comes back from Slack or Discord. The agent stores that, not a blank. No thread id, no Notion write.

## Pick your stack

Ask these three questions. One message. Wait. Do not default, and do not start a mapping until they answer.

1. **Where do people talk?** Slack or Discord.
2. **What runs the relay?** Python 3.11+ or Node 22.
3. **Where do projects live?** Notion, or a markdown `work` table for now.

Channels are markdown either way. That is not a choice.

Then hand them the matching command and a blank map. Fill `platform` with their answer.

```md
---
workspace: your-team
platform: slack
scope: team.your-team
agent: relay-prime
---

| id | name | role | direction |
|----|------|------|-----------|
| C0MGMT01 | #mgmt | management | in |
| C0REPT02 | #reports | reports | out |
| C0ROOM01 | #room | room | both |
```

Replace the ids with theirs. Inventing a channel is the bug this skill exists to stop.

**Python, markdown work table**

```bash
python agent/python/relay.py --mapping path/to/map.md --dry-run
```

**Node, markdown work table**

```bash
npx tsx agent/node/relay.ts --mapping path/to/map.md --dry-run
```

**Python, Notion**

```bash
export NOTION_TOKEN=ntn_...
python agent/python/relay.py --mapping path/to/map.md --notion-db <database-id> --dry-run
```

**Node, Notion**

```bash
export NOTION_TOKEN=ntn_...
npx tsx agent/node/relay.ts --mapping path/to/map.md --notion-db <database-id> --dry-run
```

Dry-run prints the wall and the card it would post. It does not post, and it does not write Notion.

Discord is the same commands with `platform: discord` in the map. Notion property names are in [docs/notion.md](docs/notion.md).

A `work` table, if they are not on Notion yet, goes under the channels table:

```md
| id | name | room | state | anchor | owner |
|----|------|------|-------|--------|-------|
| north-star | North Star launch | C0ROOM01 | active | | U08AAAA |
```

Empty `anchor` posts once. After a real post, that cell (or the Notion `Broadcast TS` field) holds the thread id and the next run gathers.

## Rules

1. Never name, log, or route a channel id that is not in the map. Use `<outside-scope>`.
2. One work row, one room, one thread. If `anchor` is set, gather. Do not open a second.
3. A crumb without a permalink does not render. Do not invent a person's name.
4. On post, persist the thread ts the platform returned. No ts means no Notion write.
5. Examples stay fiction. No real names, user ids, channel ids, or brands.
6. Dry-run never writes Notion and never posts.

The contract is [PROTOCOL.md](PROTOCOL.md). This file is how you behave. Do not widen it.

## The room message

Call `render` in `agent/python/broadcast.py` or `agent/node/broadcast.ts`. Do not write the message yourself.

Banned — a labeled dump:

```
broadcast: [id] some title
state: active
owner: @someone
in flight: @someone-else
context: ask …
```

Shipped — a card. Empty fields drop out.

```
*North Star launch*
`north-star`  ·  active

Jordan Lee owns it
Ada Chen is on it

> Default to the single, then the pair, then the set.
> — Jordan Lee

Reply in this thread. One status is enough.
```

Kinds: `kickoff` (active, opens the thread), `nudge` (same thread), `blocked`, `done` (closed, no ask).

## More

- [docs/broadcasts.md](docs/broadcasts.md) — the four cards
- [docs/breadcrumb.md](docs/breadcrumb.md) — gather, permalinks, unresolved ids
- [docs/notion.md](docs/notion.md) — Projects database, what gets written back
- [docs/setup.md](docs/setup.md) — tokens
- [examples/](examples/) — fictional maps only
