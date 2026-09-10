import type { RepoFile } from "./types";

const CHANNELS = [
  "# Channel mapping schema",
  "",
  "A mapping is a markdown document. Agents must parse it, not invent a parallel config.",
  "",
  "## Front matter",
  "",
  "| key | required | notes |",
  "|-----|----------|-------|",
  "| `workspace` | yes | Human label only. Never sent to the platform. |",
  "| `platform` | yes | `slack` or `discord`. |",
  "| `scope` | yes | Opaque string. The wall. |",
  "| `agent` | yes | Process name, used in reports. |",
  "| `collect_seconds` | no | Default `45`. |",
  "",
  "## Table columns",
  "",
  "| column | required | values |",
  "|--------|----------|--------|",
  "| `id` | yes | Platform snowflake / channel id. |",
  "| `name` | yes | Documentation only. Never used for routing. |",
  "| `role` | yes | `management` · `room` · `reports` |",
  "| `direction` | yes | `in` · `out` · `both` |",
  "",
  "## Invariants",
  "",
  "1. At least one `management` row with `in` or `both`.",
  "2. At least one `reports` row with `out` or `both`.",
  "3. Duplicate `id` values are an error.",
  "4. Names are not unique and not keys.",
  "5. Unknown columns are ignored.",
  "",
  "Machine-readable copy: [mapping.schema.json](/blob/schema/mapping.schema.json).",
].join("\n");

const SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://axiom.git/schema/mapping.json",
  "title": "Axiom channel mapping",
  "type": "object",
  "required": ["workspace", "platform", "scope", "agent", "channels"],
  "additionalProperties": false,
  "properties": {
    "workspace": { "type": "string", "minLength": 1 },
    "platform": { "enum": ["slack", "discord"] },
    "scope": { "type": "string", "minLength": 1 },
    "agent": { "type": "string", "minLength": 1 },
    "collect_seconds": { "type": "integer", "minimum": 5, "maximum": 600 },
    "channels": {
      "type": "array",
      "minItems": 2,
      "items": {
        "type": "object",
        "required": ["id", "name", "role", "direction"],
        "additionalProperties": false,
        "properties": {
          "id": { "type": "string", "minLength": 1 },
          "name": { "type": "string" },
          "role": { "enum": ["management", "room", "reports"] },
          "direction": { "enum": ["in", "out", "both"] }
        }
      }
    }
  }
}
`;

export const SCHEMA_FILES: RepoFile[] = [
  { path: "schema/channels.md", language: "markdown", content: CHANNELS },
  { path: "schema/mapping.schema.json", language: "json", content: SCHEMA.trim() + "\n" },
];
