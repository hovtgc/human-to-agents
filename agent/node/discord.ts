import type { Mapping } from "./mapping.ts";
import type { ScopeGuard } from "./scope.ts";

export class DiscordAdapter {
  constructor(
    private mapping: Mapping,
    private guard: ScopeGuard,
  ) {}

  describe(): void {
    const m = this.mapping;
    console.log(`axiom ${m.agent}  scope=${m.scope}  platform=discord`);
    for (const ch of m.channels) {
      console.log(`  ${ch.role.padEnd(12)} ${ch.direction.padEnd(4)}  ${ch.id}  ${ch.name}`);
    }
  }

  run(_collectSeconds: number): never {
    for (const ch of this.mapping.channels) this.guard.require(ch.id, "listen");
    throw new Error("live Discord requires DISCORD_BOT_TOKEN");
  }
}
