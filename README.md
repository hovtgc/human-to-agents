# axiom / scoped-relay

Scoped human–agent relays. **The page is the git.**

Live: [human-to-agents.grok.me](https://human-to-agents.grok.me)

```bash
git clone https://github.com/hovtgc/human-to-agents.git
```

Owner: [@hovinthenorth](https://x.com/hovinthenorth)

## Axioms

1. **Map, don't prompt.** Channel IDs live in a markdown file. A cloud or local agent reads that file as the only source of truth for where it may speak.
2. **Relay, then report.** Management channels broadcast. The agent fans the message into scoped rooms, collects replies, and reports back. Nothing else.
3. **Scope is a wall.** An agent bound to `team.growth` cannot read, write, or even name a channel outside that scope.

## Mobile viewport ([#1](https://github.com/hovtgc/human-to-agents/issues/1))

The git-as-page UI is phone-first:

- `viewport-fit=cover` and safe-area padding on sticky chrome
- README fences and mapping tables scroll inside the card — the page does not shift sideways at 390px
- 44px tap targets, 16px inputs (no iOS focus-zoom)

## Code button ([#2](https://github.com/hovtgc/human-to-agents/issues/2))

Green **Code** control copies this remote:

`https://github.com/hovtgc/human-to-agents.git`

MIT.
