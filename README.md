# axiom / scoped-relay

Scoped human–agent relays. **The page is the git.**

Live: [human-to-agents.grok.me](https://human-to-agents.grok.me)

```bash
git clone https://github.com/hovtgc/human-to-agents.git
```

## Axioms

1. **Map, don't prompt.** Channel IDs live in a markdown file. A cloud or local agent reads that file as the only source of truth for where it may speak.
2. **Relay, then report.** Management channels broadcast. The agent fans the message into scoped rooms, collects replies, and reports back. Nothing else.
3. **Scope is a wall.** An agent bound to `team.growth` cannot read, write, or even name a channel outside that scope.

## Issues

Mobile UI bugs tracked here:

- [#1](https://github.com/hovtgc/human-to-agents/issues/1) Viewport not optimized — horizontal overflow on README and code
- [#2](https://github.com/hovtgc/human-to-agents/issues/2) Green GitHub-style Code button with copyable clone URL
