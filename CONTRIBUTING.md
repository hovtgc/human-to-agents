# Contributing

The mapping schema is frozen at v0.2. New platforms are welcome if they implement the same three roles (`management`, `room`, `reports`) and fail closed on unknown channel IDs.

1. Add an adapter next to `slack` / `discord`.
2. Keep dry-run working without extra packages.
3. Put a row in `examples/` only if it is fictional.
4. Never log, report, or raise a channel id that is not in the mapping. Use `<outside-scope>`.
5. `SIGHUP` must reload the map. Do not require a restart to add a channel.
