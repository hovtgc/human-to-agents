import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { RepoShell } from "@/components/repo-shell";
import { DiffView } from "@/components/diff-view";
import { commitByHash } from "@/lib/repo/commits";

export const Route = createFileRoute("/commit/$hash")({ component: CommitPage });

function CommitPage() {
  const { hash } = Route.useParams();
  const commit = commitByHash(hash);

  if (!commit) {
    return (
      <RepoShell tab="commits">
        <div className="mx-auto max-w-xl py-16 text-center">
          <p className="font-display text-3xl">Unknown object</p>
          <p className="mt-2 text-sm text-mist">{hash} is not on main.</p>
          <Link to="/commits" className="mt-6 inline-block text-sm underline">
            Back to history
          </Link>
        </div>
      </RepoShell>
    );
  }

  const adds = commit.files.reduce((n, f) => n + f.additions, 0);
  const dels = commit.files.reduce((n, f) => n + f.deletions, 0);

  return (
    <RepoShell tab="commits">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header>
          <p className="font-mono text-xs text-ash">{commit.hash}</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{commit.message}</h1>
          {commit.body ? <p className="mt-3 text-sm leading-relaxed text-mist">{commit.body}</p> : null}
          <p className="mt-4 text-sm text-mist">
            {commit.author.name} · {format(new Date(commit.date), "d MMM yyyy, HH:mm")} ·{" "}
            <span className="text-sage">+{adds}</span>{" "}
            <span className="text-rose">−{dels}</span>
          </p>
        </header>
        {commit.files.map((f) => (
          <DiffView key={f.path} change={f} />
        ))}
      </div>
    </RepoShell>
  );
}
