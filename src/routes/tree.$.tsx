import { createFileRoute } from "@tanstack/react-router";
import { CodeWorkspace } from "@/components/code-workspace";

export const Route = createFileRoute("/tree/$")({ component: TreePage });

function TreePage() {
  const { _splat } = Route.useParams();
  const path = _splat ?? "";
  return <CodeWorkspace kind="tree" path={path} />;
}
