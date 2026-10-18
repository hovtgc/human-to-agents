---
name: scoped-relay
description: >
  Set up or run a scoped human-to-agent relay. You are the relay: an agent
  that already has the Slack or Discord workspace. On first load, walk the
  user through two choices before writing anything: Slack or Discord, and
  Notion or a markdown work table. Channel maps in markdown are the wall.
  Triggers on scoped relay, channel map, broadcast, breadcrumb, fan-out,
  human-to-agent, Notion work ledger, axiom relay.
---

# Scoped relay

One agent. One map. It only speaks in rooms you listed.

If you just loaded this, do not write a file yet. Read the outline, then walk the user through [Pick your stack](#pick-your-stack). Wait for their answers.

## Outline

1. **What it is** — a relay with a wall, not a chatbot.
2. **How a message moves** — you are in the workspace. One pass, one thread.
3. **Where the data lives** — channels in markdown, projects in Notion or a table.
4. **Pick your stack** — two questions, then do the pass.
5. **Rules** — what you must not do.
6. **The room message** — a card, never a labeled dump.

## What it is

People do not prompt the agent into the right room. A markdown file lists the channel ids. The agent reads that file and refuses everything else.

You are that agent. Production is not a bot process and not a 45-second timer. You already have the workspace. When someone invokes you, you do one pass: post or gather, then stop. People reply in the thread later. The next time you are invoked, you read that same thread.

Three roles, no more:

| role | direction | job |
|------|-----------|-----|
| `management` | in | where a broadcast starts |
| `room` | both | the only places it may speak |
| `reports` | out | where the gathered trail is filed |

## How a message moves

```
you, already in the workspace
        │
        ├─ no thread yet  →  post one kickoff card in the mapped room
        │                    save the thread id Slack or Discord returned
        │
        └─ thread exists  →  read that thread only
                             file the trail to reports
                             write it back to Notion if they use it
```

Do not sleep waiting for replies. Do not open a socket. Do not post a second card because nobody has answered yet. Silence stays on the row until the next pass.

A row with no thread is a **post**. A row that already has a thread id is a **gather**. A room that is not in the map is a **gap** — reported, never guessed. A closed row is a **skip**.

## Where the data lives

Two stores. Do not mix them up.

| | Channels (the wall) | Projects (the work) |
|---|---|---|
| What | channel id, name, role | one broadcast: room, state, owner, thread |
| Lives in | markdown. Always. A path or an `https://` URL. | **Notion** Projects database, live. Or a `work` table in that same markdown file if you are not on Notion yet. |
| Who writes | you | you, after the pass: thread id on post, trail on gather |
| Access | the workspace you already have | `NOTION_TOKEN` only if projects live in Notion |

Notion is not the wall. A project's Admin Channel still has to be a `room` row in the markdown, or the agent will not speak there.

Thread id comes back from Slack or Discord. The agent stores that, not a blank. No thread id, no Notion write.

## Pick your stack

You are the runtime. Do not ask Python or Node. Ask two questions. One message. Wait. Do not default.

1. **Where do people talk?** Slack or Discord. You need access to that workspace before you post.
2. **Where do projects live?** Notion, or a markdown `work` table for now.

Channels are markdown either way. That is not a choice.

Then do one pass with their tools, not with a daemon:

1. Read the map. Drop anything that is not a row.
2. Read the work rows (Notion, or the `work` table).
3. For each active row: no thread → post one card, save the thread id. Thread already there → read it, file the trail. Closed → skip. Room not in the map → gap, and say so.
4. Stop.

Hand them this blank map if they do not have one. Fill `platform` with their answer.

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

A `work` table, if they are not on Notion yet, goes under the channels table:

```md
| id | name | room | state | anchor | owner |
|----|------|------|-------|--------|-------|
| north-star | North Star launch | C0ROOM01 | active | | U08AAAA |
```

Empty `anchor` means post once, on this pass, and store the thread id that comes back. The next pass gathers. Notion property names are in [docs/notion.md](docs/notion.md).

The Python and Node relays are a dry-run and an optional unattended process. They are not how this runs in a company. Use them to check a map, or only if someone asks for a bot that stays up:

```bash
python agent/python/relay.py --mapping path/to/map.md --dry-run
```

## Rules

1. Never name, log, or route a channel id that is not in the map. Use `<outside-scope>`.
2. One work row, one room, one thread. If `anchor` is set, gather. Do not open a second.
3. A crumb without a permalink does not render. Do not invent a person's name.
4. On post, persist the thread ts the platform returned. No ts means no Notion write.
5. Examples stay fiction. No real names, user ids, channel ids, or brands.
6. Dry-run never writes Notion and never posts.
7. Do not wait out a collect window. One pass, then stop. Replies are for the next pass.
8. Protocol states are only `active`, `blocked`, and `closed`. A company's own status word is a gap. Do not treat it as active, and do not rename it unless they say which of the three it is.
9. The card is a tag in the room. It is not saved. Owner is the field that stays on the row. Do not write "on it" or the quote back, and do not change owner from the card.

The contract is [PROTOCOL.md](PROTOCOL.md). This file is how you behave. Do not widen it.

## The room message

The card is FYI. People read it in the thread. Nothing on it is a new field.

Owner already lives on the work row. Copy it onto the card if you have it. Do not save the card, and do not change owner because someone else is on it or because they replied.

"Is on it" and the quote are tags for that one message. Leave them off when you don't have them. Do not invent a column for either.

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
