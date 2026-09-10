import type { RepoFile } from "./types";

const MAPPING = [
  "---",
  "workspace: growth-chef",
  "platform: slack",
  "scope: team.growth",
  "agent: relay-prime",
  "collect_seconds: 45",
  "---",
  "",
  "# growth-chef / team.growth",
  "",
  "Fictional IDs. Replace with your own. Names are documentation; routing uses `id` only.",
  "",
  "| id | name | role | direction |",
  "|----|------|------|-----------|",
  "| C0MGMT01 | #mgmt | management | in |",
  "| C0REPT02 | #reports | reports | out |",
  "| C0OPS03 | #ops | room | both |",
  "| C0LAUNCH | #launch | room | both |",
].join("\n");

const DISCORD = [
  "---",
  "workspace: growth-chef",
  "platform: discord",
  "scope: team.growth",
  "agent: relay-prime",
  "collect_seconds: 45",
  "---",
  "",
  "# growth-chef / team.growth  (Discord)",
  "",
  "Same topology as `mapping.md`. Different snowflakes. Same wall.",
  "",
  "| id | name | role | direction |",
  "|----|------|------|-----------|",
  "| 140000000000000001 | mgmt | management | in |",
  "| 140000000000000002 | reports | reports | out |",
  "| 140000000000000003 | ops | room | both |",
  "| 140000000000000004 | launch | room | both |",
].join("\n");

const LOCAL = [
  "mapping: examples/mapping.md",
  "platform: slack",
  "dry_run: true",
  "collect_seconds: 45",
].join("\n");

export const EXAMPLE_FILES: RepoFile[] = [
  { path: "examples/mapping.md", language: "markdown", content: MAPPING + "\n" },
  { path: "examples/discord.md", language: "markdown", content: DISCORD + "\n" },
  { path: "examples/local.yaml", language: "yaml", content: LOCAL + "\n" },
];
