# Three axioms

Human–agent communication fails in the same place every time: the agent is asked to *figure out* where it belongs. Axiom inverts that. Belonging is data.

## 01 — Map, don't prompt

Slack or Discord channel mappings are simple IDs. They live in a markdown file. A cloud or local agent reads this file. The file is the permission set, the topology, and the documentation.

If a channel is not a row, it does not exist.

## 02 — Relay, then report

Management channels broadcast. The agent relays that broadcast into every room inside the same scope, waits, collects what comes back, and files a report. It does not chat. It does not opine. It does not join a new room because a message *mentioned* one.

## 03 — Scope is a wall

Scope is not a suggestion and not a system prompt. It is enforced in code before any adapter call. An event for a channel outside the mapping is dropped, logged without the raw id, and never named in a report. Crossing the wall is a bug, not a feature.

---

That is the whole protocol. The rest of this repository is a faithful implementation.
