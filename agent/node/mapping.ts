import { readFileSync } from "node:fs";

export type Role = "management" | "room" | "reports";
export type Direction = "in" | "out" | "both";
export type Platform = "slack" | "discord";

export type Channel = {
  id: string;
  name: string;
  role: Role;
  direction: Direction;
};

export type Work = {
  id: string;
  name: string;
  room: string;
  state: string;
  anchor: string;
  owner: string;
  pageId?: string;
};

export type Mapping = {
  workspace: string;
  platform: Platform;
  scope: string;
  agent: string;
  collectSeconds: number;
  channels: Channel[];
  work: Work[];
};

export class MappingError extends Error {}

export async function readSource(source: string): Promise<string> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source, { headers: { "User-Agent": "axiom-relay/0.3" } });
    if (!res.ok) throw new MappingError(`mapping fetch ${res.status}`);
    return await res.text();
  }
  return readFileSync(source, "utf8");
}

export async function loadMappingFrom(source: string): Promise<Mapping> {
  return loadMapping(await readSource(source));
}

export function loadMapping(text: string): Mapping {
  const { meta, body } = splitFrontMatter(text);
  const { channels, work } = parseTables(body);
  validate(meta, channels, work);
  return {
    workspace: meta.workspace,
    platform: meta.platform as Platform,
    scope: meta.scope,
    agent: meta.agent,
    collectSeconds: Number(meta.collect_seconds ?? 45),
    channels,
    work,
  };
}

function splitFrontMatter(text: string): { meta: Record<string, string>; body: string } {
  if (!text.startsWith("---")) throw new MappingError("mapping must start with YAML front matter");
  const end = text.indexOf("\n---", 3);
  if (end < 0) throw new MappingError("unterminated front matter");
  const raw = text.slice(3, end);
  const body = text.slice(end + 4);
  const meta: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (!line.trim() || !line.includes(":")) continue;
    const i = line.indexOf(":");
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body };
}

function parseTables(body: string): { channels: Channel[]; work: Work[] } {
  const channels: Channel[] = [];
  const work: Work[] = [];
  let header: string[] | null = null;
  let rows: Record<string, string>[] = [];

  const flush = () => {
    if (!header) return;
    const cols = new Set(header);
    if (cols.has("role") && cols.has("direction")) {
      for (const data of rows) {
        channels.push({
          id: data.id ?? "",
          name: data.name ?? "",
          role: (data.role ?? "") as Role,
          direction: (data.direction ?? "") as Direction,
        });
      }
    } else if (cols.has("room") && cols.has("state")) {
      for (const data of rows) {
        work.push({
          id: data.id ?? "",
          name: data.name ?? "",
          room: data.room ?? "",
          state: data.state ?? "",
          anchor: data.anchor ?? "",
          owner: data.owner ?? "",
          pageId: data.page_id ?? "",
        });
      }
    }
    header = null;
    rows = [];
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) {
      flush();
      continue;
    }
    const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (/^[-:\s|]+$/.test(line)) continue;
    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      continue;
    }
    const data: Record<string, string> = {};
    header.forEach((key, i) => {
      data[key] = cells[i] ?? "";
    });
    rows.push(data);
  }
  flush();
  return { channels, work };
}

export function plan(mapping: Mapping): { work: Work; action: "post" | "gather" | "skip" | "gap" }[] {
  const rooms = new Set(mapping.channels.filter((c) => c.role === "room").map((c) => c.id));
  return mapping.work.map((w) => {
    if (!w.room || !rooms.has(w.room)) return { work: w, action: "gap" as const };
    if (w.state === "closed") return { work: w, action: "skip" as const };
    if (w.anchor) return { work: w, action: "gather" as const };
    return { work: w, action: "post" as const };
  });
}

export function replaceWork(mapping: Mapping, work: Work[]): Mapping {
  return { ...mapping, work };
}

function validate(meta: Record<string, string>, channels: Channel[], work: Work[]) {
  for (const key of ["workspace", "platform", "scope", "agent"]) {
    if (!meta[key]) throw new MappingError(`missing ${key}`);
  }
  if (meta.platform !== "slack" && meta.platform !== "discord") {
    throw new MappingError(`unknown platform ${meta.platform}`);
  }
  const ids = channels.map((c) => c.id);
  if (new Set(ids).size !== ids.length) throw new MappingError("duplicate channel id");
  const hasMgmt = channels.some((c) => c.role === "management" && c.direction !== "out");
  const hasReport = channels.some((c) => c.role === "reports" && c.direction !== "in");
  if (!hasMgmt) throw new MappingError("need a management channel with direction in/both");
  if (!hasReport) throw new MappingError("need a reports channel with direction out/both");
  const workIds = work.map((w) => w.id);
  if (new Set(workIds).size !== workIds.length) throw new MappingError("duplicate work id");
}
