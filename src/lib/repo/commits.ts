import type { Commit } from "./types";
import { FILES } from "./files";

export const COMMITS: Commit[] = [
  {
    hash: "a08f3d91c2b74e0aa1d6f4c8e9b23170",
    short: "a08f3d9",
    author: { name: "Hovhannes Mkhitaryan", handle: "hovinthenorth" },
    date: "2026-09-10T03:46:00Z",
    message: "Publish the git as the page",
    body: "The repository is the public surface. No separate landing.",
    files: [
      {
        path: "README.md",
        status: "modified",
        additions: 4,
        deletions: 1,
        patch: [
          "@@ README.md",
          " Scoped human–agent relays.",
          "-",
          "+> The page is the git.",
          "+",
          " Agents should not be prompted into the right room. They should be **mapped** there.",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "5e2c710b8a91d33f0c17aa42e6d90bf1",
    short: "5e2c710",
    author: { name: "Grok", handle: "grok" },
    date: "2026-09-09T22:11:00Z",
    message: "Add Node runtime with the same wall",
    files: [
      {
        path: "agent/node/scope.ts",
        status: "added",
        additions: 28,
        deletions: 0,
        patch: [
          "@@ agent/node/scope.ts",
          "+export class ScopeGuard {",
          "+  allow(channelId: string): boolean {",
          "+    return this.ids.has(channelId);",
          "+  }",
          "+  require(channelId: string, action: string): void {",
          "+    if (!this.allow(channelId)) {",
          "+      throw new ScopeError(`blocked ${action} on ${channelId}`);",
          "+    }",
          "+  }",
          "+}",
        ].join("\n"),
      },
      {
        path: "agent/node/relay.ts",
        status: "added",
        additions: 48,
        deletions: 0,
        patch: [
          "@@ agent/node/relay.ts",
          "+const mapping = loadMapping(readFileSync(values.mapping, \"utf8\"));",
          "+const guard = new ScopeGuard(mapping);",
          "+if (values[\"dry-run\"]) adapter.describe();",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "1b9aa47e0d2c88f16a3b9e4c71f0a255",
    short: "1b9aa47",
    author: { name: "Grok", handle: "grok" },
    date: "2026-09-09T18:40:00Z",
    message: "Slack and Discord adapters, dry-run first",
    files: [
      {
        path: "agent/python/slack_adapter.py",
        status: "added",
        additions: 36,
        deletions: 0,
        patch: [
          "@@ agent/python/slack_adapter.py",
          "+class SlackAdapter:",
          "+    def describe(self, out: TextIO) -> None:",
          "+        out.write(f\"axiom {m.agent}  scope={m.scope}  platform=slack\\n\")",
          "+    def run(self, collect_seconds: int) -> None:",
          "+        for ch in self.mapping.channels:",
          "+            self.guard.require(ch.id, \"listen\")",
        ].join("\n"),
      },
      {
        path: "agent/python/discord_adapter.py",
        status: "added",
        additions: 32,
        deletions: 0,
        patch: [
          "@@ agent/python/discord_adapter.py",
          "+class DiscordAdapter:",
          "+    def run(self, collect_seconds: int) -> None:",
          "+        for ch in self.mapping.channels:",
          "+            self.guard.require(ch.id, \"listen\")",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "d4f06e3a91bb2c70e15d8a44c0f3e812",
    short: "d4f06e3",
    author: { name: "Hovhannes Mkhitaryan", handle: "hovinthenorth" },
    date: "2026-09-08T16:05:00Z",
    message: "Scope is a wall",
    body: "Unknown channel IDs are invisible. Crossing the wall is a bug.",
    files: [
      {
        path: "agent/python/scope.py",
        status: "added",
        additions: 24,
        deletions: 0,
        patch: [
          "@@ agent/python/scope.py",
          "+class ScopeGuard:",
          "+    def allow(self, channel_id: str) -> bool:",
          "+        return channel_id in self._ids",
          "+    def require(self, channel_id: str, action: str) -> None:",
          "+        if not self.allow(channel_id):",
          "+            raise ScopeError(",
          "+                f\"blocked {action} on {channel_id}: outside scope {self.scope!r}\"",
          "+            )",
        ].join("\n"),
      },
      {
        path: "agent/python/test_scope.py",
        status: "added",
        additions: 22,
        deletions: 0,
        patch: [
          "@@ agent/python/test_scope.py",
          "+def test_unknown_channel_is_invisible():",
          "+    assert guard.allow(\"C0OPS03\")",
          "+    assert not guard.allow(\"C0SECRET\")",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "7a12c88d04e91bf3a6c2d1e09aa44710",
    short: "7a12c88",
    author: { name: "Grok", handle: "grok" },
    date: "2026-09-07T20:18:00Z",
    message: "Parse mapping markdown as the only config",
    files: [
      {
        path: "agent/python/mapping.py",
        status: "added",
        additions: 110,
        deletions: 0,
        patch: [
          "@@ agent/python/mapping.py",
          "+def load_mapping(text: str) -> Mapping:",
          "+    meta, table = _split_front_matter(text)",
          "+    channels = _parse_table(table)",
          "+    _validate(meta, channels)",
        ].join("\n"),
      },
      {
        path: "schema/channels.md",
        status: "added",
        additions: 40,
        deletions: 0,
        patch: [
          "@@ schema/channels.md",
          "+# Channel mapping schema",
          "+A mapping is a markdown document. Agents must parse it, not invent a parallel config.",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "9e4b0d1c77a2f09e4b18c6d3a1f02590",
    short: "9e4b0d1",
    author: { name: "Hovhannes Mkhitaryan", handle: "hovinthenorth" },
    date: "2026-09-06T14:22:00Z",
    message: "Write the three axioms",
    files: [
      {
        path: "AXIOMS.md",
        status: "added",
        additions: 28,
        deletions: 0,
        patch: [
          "@@ AXIOMS.md",
          "+# Three axioms",
          "+## 01 — Map, don't prompt",
          "+## 02 — Relay, then report",
          "+## 03 — Scope is a wall",
        ].join("\n"),
      },
    ],
  },
  {
    hash: "c3a91f2e18d04bb7a90c1e5f2d8a6713",
    short: "c3a91f2",
    author: { name: "Hovhannes Mkhitaryan", handle: "hovinthenorth" },
    date: "2026-09-03T11:00:00Z",
    message: "Initial commit",
    files: [
      {
        path: "LICENSE",
        status: "added",
        additions: 21,
        deletions: 0,
        patch: ["@@ LICENSE", "+MIT License", "+Copyright (c) 2026 Hovhannes Mkhitaryan"].join("\n"),
      },
      {
        path: "README.md",
        status: "added",
        additions: 40,
        deletions: 0,
        patch: ["@@ README.md", "+# axiom", "+Scoped human–agent relays."].join("\n"),
      },
    ],
  },
];

export function commitByHash(hash: string): Commit | undefined {
  return COMMITS.find((c) => c.hash === hash || c.short === hash);
}

export function latestCommitFor(path: string): Commit | undefined {
  return COMMITS.find((c) =>
    c.files.some((f) => f.path === path || f.path.startsWith(path + "/") || path.startsWith(f.path)),
  );
}

export function fileCount(): number {
  return FILES.length;
}
