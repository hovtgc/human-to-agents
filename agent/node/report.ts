import type { Mapping } from "./mapping.ts";
import type { ScopeGuard } from "./scope.ts";

export function formatReport(opts: {
  mapping: Mapping;
  guard: ScopeGuard;
  broadcastId: string;
  replyCount: number;
  collectSeconds: number;
}): string {
  opts.guard.require(opts.broadcastId, "report");
  const rooms = opts.mapping.channels.filter((c) => c.role === "room");
  const reports = opts.mapping.channels.filter((c) => c.role === "reports");
  return [
    `# report from ${opts.mapping.agent}`,
    `scope: ${opts.mapping.scope}`,
    `broadcast: ${opts.guard.redact(opts.broadcastId)}`,
    `rooms: ${rooms.length}`,
    `replies: ${opts.replyCount}`,
    `window: ${opts.collectSeconds}s`,
    `filed: ${reports.length} reports channel(s)`,
    "",
  ].join("\n");
}
