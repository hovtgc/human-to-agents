# Breadcrumb trail

A broadcast is a trail, not a blast. Info gathering follows one thread, in one room, for the life of the work.

## When to post vs gather

| `work.anchor` | action |
|---------------|--------|
| empty | **post** the ask once, persist the thread ts Slack actually returned |
| set | **gather** — read that thread. Do not open a second |
| row has no mapped `room` | **gap** — report it, do not guess a channel |
| `state: closed` | **skip** |

A second anchor is a bug, not a retry.

## How to gather

1. Guard every id. Unknown sources are `<outside-scope>` and never named.
2. Read replies **under the anchor only**. Sibling messages in the same room are not on this trail.
3. Each reply is a crumb, or it is omitted:

```
  - {resolved name}: {claim}  [{permalink}]
  - <unresolved:{id}>: {claim}  [{permalink}]
```

4. Hard rules:
   - No permalink → the line does not render. Do not paraphrase it in.
   - Name lookup failed or rate-limited → `<unresolved:{id}>`. Never guess from context, nickname, or "the team".
   - No new replies → `trail: silent`. Silence is data. Do not fill it.
5. File the trail to `reports`. Do not fan crumbs back into rooms.
6. Write the same trail to Notion `Last Status Update` on that project page. After a post, write `Broadcast TS` (the returned thread ts) and `Broadcast Permalink`. If the post yields no ts, do not PATCH — leave the anchor empty so the next run retries. Never write an empty ts.

## Live shape

See [examples/trail.md](/blob/examples/trail.md) for a filled report. Dry-run prints the plan with empty trails; it does not invent crumbs.

## What this is not

Not a summary. Not a ranking. Not sentiment. The relay moves cited text and counts silence.
