#!/usr/bin/env npx tsx
/** Axiom scoped relay — TypeScript runtime. Same contract as the Python agent. */

import { parseArgs } from "node:util";
import { loadMappingFrom, plan } from "./mapping.ts";
import { formatReport } from "./report.ts";
import { ScopeGuard } from "./scope.ts";
import { SlackAdapter } from "./slack.ts";
import { DiscordAdapter } from "./discord.ts";
import { applyWrites, clientFromEnv, loadWorkFromNotion, NotionError } from "./notion.ts";

const adapters = { slack: SlackAdapter, discord: DiscordAdapter } as const;

class Runtime {
  mapping!: Awaited<ReturnType<typeof loadMappingFrom>>;
  guard!: ScopeGuard;
  adapter!: SlackAdapter | DiscordAdapter;
  platform!: keyof typeof adapters;

  constructor(
    private source: string,
    private platformOverride?: string,
    private notionDb?: string,
  ) {}

  async reload(): Promise<void> {
    let mapping = await loadMappingFrom(this.source);
    if (this.notionDb) mapping = await loadWorkFromNotion(mapping, this.notionDb, clientFromEnv());
    const platform = (this.platformOverride ?? mapping.platform) as keyof typeof adapters;
    const Adapter = adapters[platform];
    if (!Adapter) {
      console.error(`unknown platform: ${platform}`);
      process.exit(2);
    }
    this.mapping = mapping;
    this.platform = platform;
    this.guard = new ScopeGuard(mapping);
    this.adapter = new Adapter(mapping, this.guard);
  }
}

const { values } = parseArgs({
  options: {
    mapping: { type: "string" },
    platform: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "collect-seconds": { type: "string" },
    "notion-db": { type: "string" },
  },
});

if (!values.mapping) {
  console.error("usage: axiom-relay --mapping <file|url> [--platform slack|discord] [--dry-run]");
  process.exit(2);
}

const runtime = new Runtime(values.mapping, values.platform, values["notion-db"]);
try {
  await runtime.reload();
} catch (err) {
  if (err instanceof NotionError) {
    console.error(err.message);
    process.exit(2);
  }
  throw err;
}

const collect = Number(values["collect-seconds"] ?? runtime.mapping.collectSeconds);

if (values["dry-run"]) {
  runtime.adapter.describe();
  process.stdout.write(
    formatReport({
      mapping: runtime.mapping,
      guard: runtime.guard,
      broadcastId: runtime.mapping.channels.find((c) => c.role === "management")!.id,
      replyCount: 0,
      collectSeconds: collect,
    }),
  );
  if (values["notion-db"]) {
    const lines = await applyWrites(clientFromEnv(), plan(runtime.mapping), {}, {}, true);
    for (const line of lines) console.log(line);
  }
  process.exit(0);
}

if (process.platform !== "win32") {
  process.on("SIGHUP", () => {
    void runtime.reload();
  });
}

runtime.adapter.run(collect);
