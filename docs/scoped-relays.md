# Scoped relays

A scoped relay has a single mapping, a single scope string, and zero curiosity.

## The wall

`ScopeGuard.allow(channel_id)` is called before every read and every write. Adapters do not get a chance to be clever. If you need a second workspace, you run a second process with a second markdown file.

Unknown ids are not logged. `redact()` returns `<outside-scope>`. Exceptions do not echo the raw id.

## Broadcast plan

1. Event arrives from a `management` channel with `direction` `in` or `both`.
2. Guard checks the source id.
3. Fan-out targets every `room` in the same mapping, excluding the source.
4. Collect window (default 45s) gathers replies from those rooms only.
5. A single report is posted to every `reports` channel.

Unknown ids are dropped before step 2.

## Reload

`SIGHUP` rebuilds the mapping and the wall. In-flight collect windows finish against the map they started with.
