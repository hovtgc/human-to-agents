import type { Mapping } from "./mapping.ts";
import type { ScopeGuard } from "./scope.ts";
import { plan } from "./mapping.ts";

export type Crumb = {
  authorId: string;
  authorName: string;
  claim: string;
  permalink: string;
};

export function formatCrumb(crumb: Crumb): string | null {
  if (!crumb.permalink || !crumb.claim) return null;
  const who = crumb.authorName || `<unresolved:${crumb.authorId}>`;
  return `  - ${who}: ${crumb.claim}  [${crumb.permalink}]`;
}

export function formatReport(opts: {
  mapping: Mapping;
  guard: ScopeGuard;
  broadcastId: string;
  replyCount: number;
  collectSeconds: number;
  trails?: Record<string, Crumb[]>;
}): string {
  if (opts.mapping.work.length) return formatWorkReport(opts.mapping, opts.guard, opts.trails ?? {});
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

function formatWorkReport(
  mapping: Mapping,
  guard: ScopeGuard,
  trails: Record<string, Crumb[]>,
): string {
  const rows = plan(mapping);
  const posts = rows.filter((r) => r.action === "post").length;
  const gathers = rows.filter((r) => r.action === "gather").length;
  const skips = rows.filter((r) => r.action === "skip").length;
  const gaps = rows.filter((r) => r.action === "gap").length;
  const lines = [
    `# report from ${mapping.agent}`,
    `scope: ${mapping.scope}`,
    `work: ${rows.length}  post: ${posts}  gather: ${gathers}  skip: ${skips}  gaps: ${gaps}`,
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
    if (action === "post") {
      lines.push("anchor: (none — post, then gather next run)");
      lines.push("trail: (empty until the thread exists)");
    } else if (action === "skip") {
      lines.push("skip: closed");
    } else {
      lines.push(`anchor: ${w.anchor}`);
      lines.push("action: gather");
      const crumbs = (trails[w.id] ?? []).map(formatCrumb).filter((c): c is string => c !== null);
      if (crumbs.length) {
        lines.push("trail:");
        lines.push(...crumbs);
      } else {
        lines.push("trail: silent (read this thread; do not open another)");
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}
