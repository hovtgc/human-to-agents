import { createFileRoute, Link } from "@tanstack/react-router";
import { RepoShell } from "@/components/repo-shell";

export const Route = createFileRoute("/axioms")({ component: AxiomsPage });

const AXIOMS = [
  {
    n: "01",
    title: "Map, don't prompt",
    body: "Slack or Discord channel mappings are simple IDs. They live in a markdown file. A cloud or local agent reads that file as the only source of truth for where it may speak. If a channel is not a row, it does not exist.",
  },
  {
    n: "02",
    title: "Relay, then report",
    body: "Management channels broadcast. The agent fans that broadcast into every room inside the same scope, waits, collects what comes back, and files a report. It does not chat. It does not join a new room because a message mentioned one.",
  },
  {
    n: "03",
    title: "Scope is a wall",
    body: "Scope is not a suggestion and not a system prompt. It is enforced in code before any adapter call. An event for a channel outside the mapping is dropped, logged, and never named in a report.",
  },
];

function AxiomsPage() {
  return (
    <RepoShell tab="axioms">
      <article className="mx-auto min-w-0 max-w-3xl">
        <header className="enter-1 mb-10 sm:mb-14">
          <p className="text-xs font-medium tracking-wide text-ash uppercase">Protocol</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl md:text-6xl">Three axioms.</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist">
            Human–agent communication fails in the same place every time: the agent is asked to figure out where it belongs. Axiom inverts that. Belonging is data.
          </p>
        </header>

        <div className="enter-2 mb-12 grid gap-3 sm:mb-16 md:grid-cols-3">
          <FlowCard step="1" title="Management" note="broadcast in" />
          <FlowCard step="2" title="Scoped rooms" note="fan-out · collect" />
          <FlowCard step="3" title="Reports" note="one write back" />
        </div>

        <ol className="grid gap-12">
          {AXIOMS.map((a, i) => (
            <li key={a.n} className={i === 0 ? "enter-3" : "enter-4"}>
              <p className="font-mono text-xs tabular-nums text-sage">{a.n}</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">{a.title}</h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-mist">{a.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-16 text-sm text-ash">
          That is the whole protocol. The rest is a faithful implementation — start at{" "}
          <Link to="/blob/$" params={{ _splat: "examples/mapping.md" }} className="text-ink underline">
            examples/mapping.md
          </Link>
          .
        </p>
      </article>
    </RepoShell>
  );
}

function FlowCard({ step, title, note }: { step: string; title: string; note: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-4">
      <p className="font-mono text-xs text-sage">{step}</p>
      <p className="mt-2 text-sm text-ink">{title}</p>
      <p className="mt-1 text-xs text-ash">{note}</p>
    </div>
  );
}
