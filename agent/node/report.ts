import type { Mapping } from "./mapping.ts";
import type { ScopeGuard } from "./scope.ts";
import { plan } from "./mapping.ts";

export function formatReport(opts: {
  mapping: Mapping;
  guard: ScopeGuard;
  broadcastId: string;
  replyCount: number;
  collectSeconds: number;
}): string {
  if (opts.mapping.work.length) return formatWorkReport(opts.mapping, opts.guard);
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

function formatWorkReport(mapping: Mapping, guard: ScopeGuard): string {
  const rows = plan(mapping);
  const posts = rows.filter((r) => r.action === "post").length;
  const skips = rows.filter((r) => r.action === "skip").length;
  const gaps = rows.filter((r) => r.action === "gap").length;
  const lines = [
    `# report from ${mapping.agent}`,
    `scope: ${mapping.scope}`,
    `work: ${rows.length}  post: ${posts}  skip: ${skips}  gaps: ${gaps}`,
  ];
  for (const { work: w, action } of rows) {
    lines.push("");
    lines.push(`## ${w.id} — ${w.state || "active"}`);
    if (action === "gap") {
      lines.push("gaps: room not in map");
      continue;
    }
    lines.push(`room: ${guard.redact(w.room)}`);
    if (w.owner) lines.push(`owner: ${w.owner}`);
    if (action === "skip") {
      lines.push(`anchor: ${w.anchor}`);
      lines.push(`skip: ${w.anchor ? "already posted" : "closed"}`);
    } else {
      lines.push("anchor: (none — would post)");
    }
  }
  lines.push("");
  return lines.join("\n");
}
