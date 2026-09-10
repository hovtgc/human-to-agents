import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { getFile, byteSize, formatBytes } from "@/lib/repo/files";
import { highlightLines } from "@/lib/repo/highlight";
import { Markdown } from "@/lib/repo/markdown";
import { latestCommitFor } from "@/lib/repo/commits";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "./breadcrumbs";
import { cn } from "@/lib/utils";

export function FileView({ path }: { path: string }) {
  const file = getFile(path);
  const isMarkdown = file?.language === "markdown";
  const [mode, setMode] = useState<"preview" | "code">(isMarkdown ? "preview" : "code");
  const [copied, setCopied] = useState(false);
  const commit = latestCommitFor(path);

  if (!file) {
    return (
      <div className="rounded-xl border border-line bg-panel px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">Not in the tree</p>
        <p className="mt-2 text-sm text-mist">{path} does not exist on main.</p>
      </div>
    );
  }

  const lines = file.content.split("\n");
  const htmlLines = highlightLines(file.content, file.language);
  const source = file.content;

  async function copy() {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    toast("Copied to clipboard");
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumbs path={path} />
        {commit ? (
          <p className="min-w-0 truncate text-xs text-ash">
            {commit.short} · {commit.message} ·{" "}
            {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
          </p>
        ) : null}
      </div>

      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel">
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          {isMarkdown ? (
            <div className="flex rounded-sm bg-raised p-0.5">
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={cn(
                  "h-9 rounded-sm px-3 text-xs font-medium sm:h-8",
                  mode === "preview" ? "bg-panel text-ink" : "text-mist",
                )}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setMode("code")}
                className={cn(
                  "h-9 rounded-sm px-3 text-xs font-medium sm:h-8",
                  mode === "code" ? "bg-panel text-ink" : "text-mist",
                )}
              >
                Code
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-mist">{file.language}</span>
          )}
          <span className="ml-auto text-xs tabular-nums text-ash">
            {lines.length} lines · {formatBytes(byteSize(file))}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy file">
            {copied ? <Check className="size-4 text-sage" /> : <Copy className="size-4" />}
          </Button>
        </header>

        {mode === "preview" && isMarkdown ? (
          <div className="min-w-0 overflow-x-auto px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
            <Markdown source={file.content} />
          </div>
        ) : (
          <div className="code-lines overflow-x-auto font-mono leading-6">
            {htmlLines.map((html, i) => (
              <div key={i} className="flex min-w-0 hover:bg-raised/70">
                <span className="sticky left-0 w-10 shrink-0 select-none bg-panel pr-2 text-right tabular-nums text-ash sm:w-12 sm:pr-3">
                  {i + 1}
                </span>
                <code
                  className="min-w-0 flex-1 whitespace-pre px-3 text-ink"
                  dangerouslySetInnerHTML={{ __html: html || " " }}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
