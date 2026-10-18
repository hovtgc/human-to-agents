/** Room messages. Four kinds, one shape. No labeled dumps. */
import type { Mapping, Work } from "./mapping.ts";
import { plan } from "./mapping.ts";

export type Kind = "kickoff" | "nudge" | "blocked" | "done";
export type RoomState = "active" | "blocked" | "closed";
export type RoomPlatform = "slack" | "discord";

const EXPECT: Record<Kind, RoomState> = {
  kickoff: "active",
  nudge: "active",
  blocked: "blocked",
  done: "closed",
};

const CTA: Record<Kind, string> = {
  kickoff: "Reply in this thread. One status is enough.",
  nudge: "Still open. Reply in this thread.",
  blocked: "Blocked. Reply here only if that changed.",
  done: "Closed.",
};

export class BroadcastError extends Error {}

export type Broadcast = {
  kind: Kind;
  workId: string;
  title: string;
  state: RoomState;
  owner?: string;
  assignee?: string;
  quote?: string;
  quoteFrom?: string;
  platform?: RoomPlatform;
};

export function render(b: Broadcast): string {
  if (!(b.kind in EXPECT)) throw new BroadcastError(`unknown kind: ${b.kind}`);
  if (!(b.state === "active" || b.state === "blocked" || b.state === "closed")) {
    throw new BroadcastError(`unknown state: ${b.state}`);
  }
  if (b.state !== EXPECT[b.kind]) {
    throw new BroadcastError(`${b.kind} requires state ${EXPECT[b.kind]}`);
  }
  const title = line(b.title);
  const workId = line(b.workId);
  if (!title || !workId) throw new BroadcastError("title and work id are required");
  const lines = [bold(title, b.platform ?? "slack"), `\`${workId}\`  ·  ${b.state}`];
  const who = people(line(b.owner ?? ""), line(b.assignee ?? ""));
  if (who.length) lines.push("", ...who);
  const quote = line(b.quote ?? "");
  if (quote) {
    lines.push("", "> " + quote);
    const from = line(b.quoteFrom ?? "");
    if (from) lines.push("> — " + from);
  }
  lines.push("", CTA[b.kind]);
  const text = lines.join("\n") + "\n";
  for (const banned of ["broadcast:", "state:", "owner:", "in flight:", "context:"]) {
    if (text.includes(banned)) throw new BroadcastError(`labeled dump leaked: ${banned}`);
  }
  return text;
}

export function kickoffFor(
  work: Work,
  extra: { assignee?: string; quote?: string; quoteFrom?: string; platform?: RoomPlatform } = {},
): string {
  return render({
    kind: "kickoff",
    workId: work.id,
    title: work.name || work.id,
    state: work.state as RoomState,
    owner: work.owner,
    assignee: extra.assignee,
    quote: extra.quote,
    quoteFrom: extra.quoteFrom,
    platform: extra.platform,
  });
}

export function previewPosts(mapping: Mapping, platform: RoomPlatform = "slack"): string {
  const chunks = plan(mapping)
    .filter((row) => row.action === "post")
    .map((row) => kickoffFor(row.work, { platform }));
  if (!chunks.length) return "";
  return "# would post\n\n" + chunks.join("\n");
}

function people(owner: string, assignee: string): string[] {
  const lines: string[] = [];
  if (owner) lines.push(`${owner} owns it`);
  if (assignee) lines.push(`${assignee} is on it`);
  return lines;
}

function bold(text: string, platform: RoomPlatform): string {
  return platform === "discord" ? `**${text}**` : `*${text}*`;
}

function line(text: string): string {
  return text.split(/\s+/).filter(Boolean).join(" ");
}
