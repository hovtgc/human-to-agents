import type { Mapping } from "./mapping.ts";

export class ScopeError extends Error {}

export class ScopeGuard {
  readonly scope: string;
  private ids: Set<string>;

  constructor(mapping: Mapping) {
    this.scope = mapping.scope;
    this.ids = new Set(mapping.channels.map((c) => c.id));
  }

  allow(channelId: string): boolean {
    return this.ids.has(channelId);
  }

  redact(channelId: string): string {
    return this.allow(channelId) ? channelId : "<outside-scope>";
  }

  require(channelId: string, action: string): void {
    if (!this.allow(channelId)) {
      throw new ScopeError(`blocked ${action}: outside scope ${this.scope}`);
    }
  }

  drop(_channelId: string, reason: string): void {
    console.info(`dropped event source=<outside-scope> reason=${reason}`);
  }
}
