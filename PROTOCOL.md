# PROTOCOL

Frozen at v0.2. Implementations may add platforms. They may not add curiosity.

## 1. Mapping

A mapping is a markdown document: YAML front matter + one table. It is the only config.

Source: a filesystem path **or** an `https://` URL. The agent does not fetch anything else.

Required front matter: `workspace`, `platform` (`slack` | `discord`), `scope`, `agent`.
Optional: `collect_seconds` (default `45`).

Required columns: `id`, `name`, `role`, `direction`.

`name` is documentation. Routing uses `id` only.

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

1. Event arrives from a management channel.
2. Guard checks the source id.
3. Fan-out to every `room` in the map, excluding the source.
4. Collect window gathers replies from those rooms only.
5. One report, posted to every `reports` channel.

Report shape (v0.2):

```
# report from {agent}
scope: {scope}
broadcast: {id}
rooms: {n}
replies: {n}
window: {seconds}s
filed: {n} reports channel(s)
```

## 5. Reload

`SIGHUP` re-reads the mapping source and rebuilds the wall. No restart. No drain of in-flight collect windows — they finish against the map they started with.

## 6. Failure

Fail closed. A parse error, a missing token, an unknown platform — exit non-zero. Do not run half a map.
