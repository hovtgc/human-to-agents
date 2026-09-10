import type { Mapping } from "./mapping.ts";
import type { ScopeGuard } from "./scope.ts";

export class SlackAdapter {
  constructor(
    private mapping: Mapping,
    private guard: ScopeGuard,
  ) {}

  describe(): void {
    const m = this.mapping;
    console.log(`axiom ${m.agent}  scope=${m.scope}  platform=slack`);
    for (const ch of m.channels) {
      console.log(`  ${ch.role.padEnd(12)} ${ch.direction.padEnd(4)}  ${ch.id}  ${ch.name}`);
    }
    console.log(`fan-out: ${m.channels.filter((c) => c.role === "room").length} room(s)`);
  }

  run(_collectSeconds: number): never {
    for (const ch of this.mapping.channels) this.guard.require(ch.id, "listen");
    throw new Error("live Slack requires SLACK_BOT_TOKEN");
  }
}
