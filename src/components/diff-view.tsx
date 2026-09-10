import { cn } from "@/lib/utils";
import type { CommitChange } from "@/lib/repo/types";

export function DiffView({ change }: { change: CommitChange }) {
  const lines = change.patch.split("\n");
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-panel">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="font-mono text-sm text-ink">{change.path}</span>
        <span className="ml-auto flex gap-3 font-mono text-xs tabular-nums">
          <span className="text-sage">+{change.additions}</span>
          <span className="text-rose">−{change.deletions}</span>
        </span>
      </header>
      <div className="overflow-x-auto font-mono text-xs leading-6">
        {lines.map((line, i) => {
          const isHunk = line.startsWith("@@");
          const isAdd = line.startsWith("+") && !line.startsWith("+++");
          const isDel = line.startsWith("-") && !line.startsWith("---");
          return (
            <div
              key={i}
              className={cn(
                "flex whitespace-pre px-4",
                isAdd && "bg-add text-ink",
                isDel && "bg-del text-ink",
                isHunk && "bg-raised text-ash",
              )}
            >
              {line || " "}
            </div>
          );
        })}
      </div>
    </section>
  );
}
