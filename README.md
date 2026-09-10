# axiom

Scoped human–agent relays.

> The page is the git.

Agents should not be prompted into the right room. They should be **mapped** there.
Axiom is a tiny protocol: a markdown file of Slack or Discord channel IDs, a scoped
relay that reads it, and a wall that the agent cannot climb.

## Axioms

1. **Map, don't prompt.** Channel IDs live in a markdown file. A cloud or local agent reads that file as the only source of truth for where it may speak.
2. **Relay, then report.** Management channels broadcast. The agent fans the message into scoped rooms, collects replies, and reports back. Nothing else.
3. **Scope is a wall.** An agent bound to `team.growth` cannot read, write, or even name a channel outside that scope.

See [AXIOMS.md](/blob/AXIOMS.md) and [PROTOCOL.md](/blob/PROTOCOL.md).

## Tree

```
scoped-relay/
  PROTOCOL.md        # frozen contract
  agent/
    python/          # stdlib relay + Slack/Discord adapters
    node/            # TypeScript port, same contract
  schema/            # mapping markdown spec + JSON Schema
  examples/          # slack + discord mappings
  docs/
```

## Quick start

Local, no tokens — prove the map parses and the wall holds:

```bash
python agent/python/relay.py --mapping examples/mapping.md --dry-run
```

or

```bash
npx tsx agent/node/relay.ts --mapping examples/mapping.md --dry-run
```

The mapping may be a path or an `https://` URL. `SIGHUP` reloads it.

Live Slack:

```bash
export SLACK_BOT_TOKEN=xoxb-...
python agent/python/relay.py --mapping examples/mapping.md --platform slack
```

Live Discord:

```bash
export DISCORD_BOT_TOKEN=...
python agent/python/relay.py --mapping examples/mapping.md --platform discord
```

The same mapping file runs in the cloud. Point a long-lived process (systemd, Fly, a tiny VM) at the markdown. That is the whole deploy.

## Mapping

A mapping is YAML front matter plus one table. The agent reads it on boot and on every `SIGHUP`.

```md
---
workspace: growth-chef
platform: slack
scope: team.growth
agent: relay-prime
---

| id | name | role | direction |
|----|------|------|-----------|
| C0MGMT01 | #mgmt | management | in |
| C0REPT02 | #reports | reports | out |
| C0OPS03 | #ops | room | both |
```

- `management` / `in` — broadcasts originate here.
- `room` — scoped destinations. The agent may speak here only because the row exists.
- `reports` / `out` — collected replies are posted here.

Full contract: [schema/channels.md](/blob/schema/channels.md).

## License

MIT. Use it, fork it, host the git as a page.
