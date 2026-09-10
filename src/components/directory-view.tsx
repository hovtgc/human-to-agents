import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { getFile } from "@/lib/repo/files";
import { listDir } from "@/lib/repo/tree";
import { latestCommitFor } from "@/lib/repo/commits";
import { Markdown } from "@/lib/repo/markdown";
import { FileGlyph } from "./file-icon";
import { Breadcrumbs } from "./breadcrumbs";

export function DirectoryView({ path }: { path: string }) {
  const entries = listDir(path);
  const readmePath = path ? `${path}/README.md` : "README.md";
  const readme = getFile(readmePath);

  return (
    <div className="grid min-w-0 gap-6">
      <div className="min-w-0 px-1">
        <Breadcrumbs path={path} />
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel">
        <div className="hidden grid-cols-[1fr_1.2fr_auto] gap-4 border-b border-line px-4 py-2 text-xs tracking-wide text-ash uppercase md:grid">
          <span>Name</span>
          <span>Last commit</span>
          <span className="text-right">When</span>
        </div>
        <ul>
          {entries.map((entry) => {
            const commit = latestCommitFor(entry.path);
            const to =
              entry.type === "dir"
                ? ({ to: "/tree/$" as const, params: { _splat: entry.path } })
                : ({ to: "/blob/$" as const, params: { _splat: entry.path } });
            return (
              <li key={entry.path} className="border-b border-line last:border-b-0">
                <Link
                  {...to}
                  className="grid grid-cols-1 items-center gap-1 px-4 py-3 hover:bg-raised md:grid-cols-[1fr_1.2fr_auto] md:gap-4 md:py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2.5 text-sm text-ink">
                    <FileGlyph type={entry.type} language={entry.language} open={false} />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="truncate pl-6 text-sm text-mist md:pl-0">
                    {commit?.message ?? "—"}
                  </span>
                  <span className="pl-6 text-xs tabular-nums text-ash md:pl-0 md:text-right">
                    {commit
                      ? formatDistanceToNow(new Date(commit.date), { addSuffix: true })
                      : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {readme ? (
        <article className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
          <p className="mb-6 text-xs font-medium tracking-wide text-ash uppercase">{readme.path}</p>
          <Markdown source={readme.content} />
        </article>
      ) : null}
    </div>
  );
}
