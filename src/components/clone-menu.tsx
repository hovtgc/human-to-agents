import { useState } from "react";
import { Check, ChevronDown, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REPO } from "@/lib/repo/meta";
import { downloadRepoZip } from "@/lib/repo/zip";
import { cn } from "@/lib/utils";

export function CloneMenu() {
  const [mode, setMode] = useState<"https" | "ssh">("https");
  const [copied, setCopied] = useState(false);
  const url = mode === "https" ? REPO.cloneHttps : REPO.cloneSsh;

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast(`Copied ${mode.toUpperCase()}`);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setCopied(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="clone" size="sm" className="gap-1.5 px-2.5 sm:px-3">
          <Download className="size-3.5" aria-hidden />
          <span>Code</span>
          <ChevronDown className="size-3.5 opacity-80" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="clone-menu-w p-2">
        <p className="px-1.5 pt-1 pb-2 text-xs font-medium tracking-wide text-ash uppercase">
          Clone
        </p>
        <div className="mb-2 flex rounded-sm bg-raised p-0.5">
          {(["https", "ssh"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                setCopied(false);
              }}
              className={cn(
                "h-9 flex-1 rounded-sm text-xs font-medium uppercase",
                mode === id ? "bg-panel text-ink" : "text-mist hover:text-ink",
              )}
            >
              {id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-sm border border-line bg-raised p-1">
          <input
            readOnly
            value={url}
            aria-label={`${mode.toUpperCase()} clone URL`}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent px-2 font-mono text-ink outline-none"
          />
          <Button
            type="button"
            variant="clone"
            size="icon-sm"
            className="shrink-0"
            onClick={() => void copyUrl()}
            aria-label="Copy clone URL"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
        <p className="px-1.5 pt-2 pb-1 text-xs leading-relaxed text-ash">
          {mode === "https" ? "HTTPS clone. Copy, then git clone." : "SSH clone. Copy, then git clone."}
        </p>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            window.open(REPO.githubUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink className="size-3.5 text-ash" />
          View on GitHub
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void downloadRepoZip();
            toast("Downloading scoped-relay.zip");
          }}
        >
          <Download className="size-3.5 text-ash" />
          Download ZIP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
