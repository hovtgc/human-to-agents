import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { RepoShell } from "@/components/repo-shell";
import { COMMITS } from "@/lib/repo/commits";

export const Route = createFileRoute("/commits")({ component: CommitsPage });

function CommitsPage() {
  return (
    <RepoShell tab="commits">
      <div className="mx-auto max-w-3xl">
        <header className="enter-1 mb-8">
          <p className="text-xs font-medium tracking-wide text-ash uppercase">History</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Commits on main</h1>
        </header>
        <ol className="relative border-l border-line pl-6">
          {COMMITS.map((c) => (
            <li key={c.hash} className="enter-2 relative pb-10 last:pb-0">
              <span className="commit-dot size-2 rounded-full bg-sage" />
              <Link to="/commit/$hash" params={{ hash: c.short }} className="group grid gap-1">
                <p className="text-base text-ink group-hover:underline">{c.message}</p>
                <p className="text-sm text-mist">
                  {c.author.name}
                  <span className="text-ash">
                    {" "}
                    committed {formatDistanceToNow(new Date(c.date), { addSuffix: true })} · {c.short}
                  </span>
                </p>
                <p className="text-xs tabular-nums text-ash">
                  {c.files.length} file{c.files.length === 1 ? "" : "s"} · +
                  {c.files.reduce((n, f) => n + f.additions, 0)} −
                  {c.files.reduce((n, f) => n + f.deletions, 0)}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </RepoShell>
  );
}
