# Channel mapping schema

A mapping is a markdown document. Agents must parse it, not invent a parallel config.
Contract: [PROTOCOL.md](/blob/PROTOCOL.md) (frozen v0.2).

## Front matter

| key | required | notes |
|-----|----------|-------|
| `workspace` | yes | Human label only. Never sent to the platform. |
| `platform` | yes | `slack` or `discord`. |
| `scope` | yes | Opaque string. The wall. |
| `agent` | yes | Process name, used in reports. |
| `collect_seconds` | no | Default `45`. |

The mapping source itself is a path or an `https://` URL, passed as `--mapping`.

## Table columns

| column | required | values |
|--------|----------|--------|
| `id` | yes | Platform snowflake / channel id. |
| `name` | yes | Documentation only. Never used for routing. |
| `role` | yes | `management` · `room` · `reports` |
| `direction` | yes | `in` · `out` · `both` |

## Invariants

1. At least one `management` row with `in` or `both`.
2. At least one `reports` row with `out` or `both`.
3. Duplicate `id` values are an error.
4. Names are not unique and not keys.
5. Unknown columns are ignored.
6. Unknown ids never appear in logs, exceptions, or reports. Substitute `<outside-scope>`.

Machine-readable copy: [mapping.schema.json](/blob/schema/mapping.schema.json).
