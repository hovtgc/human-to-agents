import { createFileRoute } from "@tanstack/react-router";
import { CodeWorkspace } from "@/components/code-workspace";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CodeWorkspace kind="tree" path="" />;
}
