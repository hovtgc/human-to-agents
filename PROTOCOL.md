# PROTOCOL

Frozen at v0.3. v0.2 maps load unchanged. Implementations may add platforms. They may not add curiosity.

## Changelog

- **v0.3** — optional `work` table. Each row is one broadcast, joined to a mapped room. Notion (or any PM) may *materialize* this table; the relay still only reads markdown. An existing `anchor` is a gather, not a skip: read that thread, cite permalinks, do not open a second.
- **v0.2** — path or `https://` mapping, SIGHUP reload, unknown ids redacted.

## 1. Mapping

A mapping is a markdown document: YAML front matter + **one or two tables**. It is the only config.

Source: a filesystem path **or** an `https://` URL. The agent does not fetch anything else.
A provider (Notion, a database) may write the file. It never becomes the parse target.

Required front matter: `workspace`, `platform` (`slack` | `discord`), `scope`, `agent`.
Optional: `collect_seconds` (default `45`).

The first table is `channels`. Required columns: `id`, `name`, `role`, `direction`.

`name` is documentation. Routing uses `id` only.

### Work (optional)

A second table, detected by columns `room` + `state`. Each row is a **broadcast** — one unit of work, one room.

| column | required | notes |
|--------|----------|-------|
| `id` | yes | Stable project key. Never reused. |
| `name` | yes | Documentation. |
| `room` | yes | Must be a `room`-role id in `channels`. Else: **gap**. |
| `state` | yes | `active` · `blocked` · `closed` |
| `anchor` | no | Platform thread id. Empty → **post** once and record it. Present → **gather** that thread. Never a second anchor. |
| `owner` | no | Human. Documentation. |

A v0.2 file with no work table is valid. The relay then fans out as before.

## 2. Roles

| role | speaks | listens |
|------|--------|---------|
| `management` | never, unless `both` | broadcasts (`in` / `both`) |
| `room` | fan-out of a broadcast | replies during the collect window |
| `reports` | the filed report (`out` / `both`) | never |

A map without a management `in`/`both` row, or without a reports `out`/`both` row, is invalid.

## 3. The wall

`ScopeGuard.allow(id)` is called before every read and every write.

- Unknown ids are dropped before the adapter sees the event.
- Logs and exceptions substitute `<outside-scope>`. The raw id is not interpolated.
- Reports may only name ids that `allow` returns true for.

A second workspace is a second process with a second file. Not a smarter prompt.

## 4. Relay, then report

1. Event arrives from a management channel — or a cadence reads the `work` table.
2. Guard checks every id involved.
3. Without a work table: fan-out to every `room` in the map, excluding the source.
   With a work table: one post per row with no `anchor`. Rows with an `anchor` **gather** that thread — they do not post again.
4. Collect is a breadcrumb trail: replies *under the anchor only*. See [docs/breadcrumb.md](/blob/docs/breadcrumb.md).
5. One report, posted to every `reports` channel.

Report shape (v0.2, no work table):

```
# report from {agent}
scope: {scope}
broadcast: {id}
rooms: {n}
replies: {n}
window: {seconds}s
filed: {n} reports channel(s)
```

Report shape (v0.3, work table):

```
# report from {agent}
scope: {scope}
work: {n}  post: {n}  gather: {n}  skip: {n}  gaps: {n}

## {work.id} — {state}
room: {id}
anchor: {ts}
action: gather
trail:
  - {name}: {claim}  [{permalink}]
  - <unresolved:{id}>: {claim}  [{permalink}]
```

A crumb without a permalink does not render. An unresolved author is never named.

## 5. Reload

`SIGHUP` re-reads the mapping source and rebuilds the wall. No restart. No drain of in-flight collect windows — they finish against the map they started with.

## 6. Failure

Fail closed. A parse error, a missing token, an unknown platform, a duplicate `work.id` — exit non-zero.
A work row whose room is not in `channels` is **not** fatal: it is a reported gap. Other rows still run.
