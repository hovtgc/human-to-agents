# Contributing

The mapping schema is frozen at v0.3. v0.2 maps remain valid. New platforms are welcome if they implement the same three roles (`management`, `room`, `reports`) and fail closed on unknown channel IDs.

1. Add an adapter next to `slack` / `discord`.
2. Keep dry-run working without extra packages.
3. Put a row in `examples/` only if it is fictional. No real names, user ids, channel ids, or brand names.
4. Never log, report, or raise a channel id that is not in the mapping. Use `<outside-scope>`.
5. `SIGHUP` must reload the map. Do not require a restart to add a channel.
6. A work row may only broadcast into a mapped `room`. A missing room is a gap, never a guess.
7. If `anchor` is set, do not open a second thread. Gather that thread instead.
8. A breadcrumb crumb without a permalink does not render. Do not invent a name.
