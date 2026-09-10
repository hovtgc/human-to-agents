import type { RepoFile } from "./types";
import { DOC_FILES } from "./files-docs";
import { SCHEMA_FILES } from "./files-schema";
import { PYTHON_FILES } from "./files-python";
import { NODE_FILES } from "./files-node";
import { EXAMPLE_FILES } from "./files-examples";

export const FILES: RepoFile[] = [
  ...DOC_FILES,
  ...SCHEMA_FILES,
  ...PYTHON_FILES,
  ...NODE_FILES,
  ...EXAMPLE_FILES,
].sort((a, b) => a.path.localeCompare(b.path));

export const FILE_MAP = new Map(FILES.map((f) => [f.path, f]));

export function getFile(path: string): RepoFile | undefined {
  return FILE_MAP.get(path);
}

export function byteSize(file: RepoFile): number {
  return new TextEncoder().encode(file.content).length;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

export function languageStats(): { language: string; bytes: number; pct: number }[] {
  const tally = new Map<string, number>();
  let total = 0;
  for (const f of FILES) {
    const n = byteSize(f);
    total += n;
    tally.set(f.language, (tally.get(f.language) ?? 0) + n);
  }
  return [...tally.entries()]
    .map(([language, bytes]) => ({
      language,
      bytes,
      pct: total === 0 ? 0 : (bytes / total) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}
