import { createFileRoute } from "@tanstack/react-router";
import { CodeWorkspace } from "@/components/code-workspace";

export const Route = createFileRoute("/blob/$")({ component: BlobPage });

function BlobPage() {
  const { _splat } = Route.useParams();
  return <CodeWorkspace kind="blob" path={_splat ?? ""} />;
}
