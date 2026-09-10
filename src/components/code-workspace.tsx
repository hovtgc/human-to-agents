import { FileTree } from "@/components/file-tree";
import { DirectoryView } from "@/components/directory-view";
import { FileView } from "@/components/file-view";
import { AboutPanel } from "@/components/about-panel";
import { RepoShell } from "@/components/repo-shell";

export function CodeWorkspace({
  kind,
  path,
}: {
  kind: "tree" | "blob";
  path: string;
}) {
  const showAbout = kind === "tree" && path === "";
  return (
    <RepoShell tab="code" showTree treePath={path}>
      <div className="flex min-w-0 gap-6">
        <aside className="hidden w-60 shrink-0 md:block lg:w-64">
          <div className="tree-pane sticky top-24 overflow-auto rounded-xl border border-line bg-panel">
            <FileTree current={path} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          {kind === "tree" ? <DirectoryView path={path} /> : <FileView path={path} />}
        </main>
        {showAbout ? <AboutPanel /> : null}
      </div>
    </RepoShell>
  );
}
