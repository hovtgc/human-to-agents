/** Notion is the live work ledger. Channels stay the markdown wall.
 *
 * Reads the Projects database and writes Broadcast TS, Broadcast Permalink,
 * and Last Status Update. Stdlib fetch. Token from NOTION_TOKEN.
 * Dry-run queries and prints writes; it does not PATCH.
 */
import type { Mapping, Work } from "./mapping.ts";
import { replaceWork } from "./mapping.ts";

const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const MAX_BLOCK = 2000;

export const PROPS = {
  name: "Name",
  id: "Scope key",
  room: "Admin Channel",
  state: "Status",
  anchor: "Broadcast TS",
  owner: "Owner",
  permalink: "Broadcast Permalink",
  statusUpdate: "Last Status Update",
} as const;

const STATES: Record<string, string> = {
  active: "active",
  aligning: "active",
  "in progress": "active",
  "in-progress": "active",
  blocked: "blocked",
  closed: "closed",
  done: "closed",
  parked: "closed",
};

export type Transport = (method: string, url: string, headers: Record<string, string>, body?: string) => Promise<any>;

export class NotionError extends Error {}

async function defaultTransport(method: string, url: string, headers: Record<string, string>, body?: string) {
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) throw new NotionError(`notion ${method} ${res.status}`);
  return await res.json();
}

export class NotionClient {
  constructor(
    private token: string,
    private transport: Transport = defaultTransport,
  ) {
    if (!token) throw new NotionError("NOTION_TOKEN is required");
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      "User-Agent": "axiom-relay/0.3",
    };
  }

  private call(method: string, path: string, payload?: unknown) {
    return this.transport(method, API + path, this.headers(), payload ? JSON.stringify(payload) : undefined);
  }

  async queryWork(databaseId: string): Promise<Work[]> {
    const rows: Work[] = [];
    let cursor: string | undefined;
    while (true) {
      const payload: Record<string, unknown> = { page_size: 100 };
      if (cursor) payload.start_cursor = cursor;
      const data = await this.call("POST", `/databases/${databaseId}/query`, payload);
      for (const page of data.results ?? []) {
        const w = workFromPage(page);
        if (w) rows.push(w);
      }
      if (!data.has_more) break;
      cursor = data.next_cursor;
    }
    return rows;
  }

  writeAnchor(pageId: string, ts: string, permalink: string) {
    if (!ts) throw new NotionError("refusing empty Broadcast TS");
    return this.call("PATCH", `/pages/${pageId}`, {
      properties: {
        [PROPS.anchor]: richText(ts),
        [PROPS.permalink]: richText(permalink),
      },
    });
  }

  writeTrail(pageId: string, trail: string) {
    return this.call("PATCH", `/pages/${pageId}`, {
      properties: { [PROPS.statusUpdate]: richText(clip(trail)) },
    });
  }
}

export function clip(text: string): string {
  if (text.length <= MAX_BLOCK) return text;
  const suffix = "\n(truncated)";
  return text.slice(0, MAX_BLOCK - suffix.length) + suffix;
}

function richText(content: string) {
  return { rich_text: [{ type: "text", text: { content } }] };
}

function plain(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title ?? []).map((t: any) => t.plain_text ?? "").join("");
  if (prop.type === "rich_text") return (prop.rich_text ?? []).map((t: any) => t.plain_text ?? "").join("");
  if (prop.type === "select" || prop.type === "status") return prop[prop.type]?.name ?? "";
  if (prop.type === "url") return prop.url ?? "";
  if (prop.type === "number" && prop.number != null) return String(prop.number);
  return "";
}

export function workFromPage(page: any): Work | null {
  const props = page.properties ?? {};
  const name = plain(props[PROPS.name]);
  const key = plain(props[PROPS.id]) || name.toLowerCase().replace(/ /g, "-");
  if (!key) return null;
  const raw = plain(props[PROPS.state]).trim().toLowerCase();
  return {
    id: key,
    name: name || key,
    room: plain(props[PROPS.room]),
    state: STATES[raw] ?? "active",
    anchor: plain(props[PROPS.anchor]),
    owner: plain(props[PROPS.owner]),
    pageId: page.id ?? "",
  };
}

export async function loadWorkFromNotion(mapping: Mapping, databaseId: string, client: NotionClient): Promise<Mapping> {
  return replaceWork(mapping, await client.queryWork(databaseId));
}

export async function applyWrites(
  client: NotionClient,
  plan: { work: Work; action: string }[],
  posts: Record<string, { ts: string; permalink: string }>,
  trails: Record<string, string>,
  dryRun: boolean,
): Promise<string[]> {
  const lines: string[] = [];
  for (const { work: w, action } of plan) {
    if (!w.pageId) {
      lines.push(`notion  ${w.id.padEnd(16)}  skip  no page id`);
      continue;
    }
    if (action === "post") {
      const posted = posts[w.id];
      if (!posted?.ts) {
        lines.push(`notion  ${w.id.padEnd(16)}  POST    no ts — leave empty, retry next run`);
        continue;
      }
      lines.push(`notion  ${w.id.padEnd(16)}  POST    write Broadcast TS + Permalink`);
      if (!dryRun) await client.writeAnchor(w.pageId, posted.ts, posted.permalink);
    } else if (action === "gather") {
      lines.push(`notion  ${w.id.padEnd(16)}  GATHER  write Last Status Update`);
      if (!dryRun) await client.writeTrail(w.pageId, trails[w.id] ?? "silent");
    } else if (action === "gap") {
      lines.push(`notion  ${w.id.padEnd(16)}  GAP     no write`);
    } else {
      lines.push(`notion  ${w.id.padEnd(16)}  SKIP    closed`);
    }
  }
  return lines;
}

export function clientFromEnv(transport?: Transport): NotionClient {
  return new NotionClient(process.env.NOTION_TOKEN ?? "", transport);
}
