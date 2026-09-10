import { createFileRoute } from "@tanstack/react-router";
import { RepoShell } from "@/components/repo-shell";
import { AskPanel } from "@/components/ask-panel";

export const Route = createFileRoute("/ask")({ component: AskPage });

function AskPage() {
  return (
    <RepoShell tab="ask">
      <AskPanel />
    </RepoShell>
  );
}
