import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Star } from "lucide-react";
import { OwnerAvatar } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { CloneMenu } from "@/components/clone-menu";
import { CommandPalette } from "@/components/command-palette";
import { FileTree } from "@/components/file-tree";
import { useStar } from "@/hooks/use-star";
import { REPO } from "@/lib/repo/meta";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "code", label: "Code", to: "/" },
  { id: "commits", label: "Commits", to: "/commits" },
  { id: "axioms", label: "Axioms", to: "/axioms" },
  { id: "ask", label: "Ask", to: "/ask" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export function RepoShell({
  tab,
  treePath,
  children,
  showTree = false,
}: {
  tab: TabId;
  treePath?: string;
  children: ReactNode;
  showTree?: boolean;
}) {
  const { starred, toggle, count } = useStar();
  const [palette, setPalette] = useState(false);
  const [mobileTree, setMobileTree] = useState(false);

  useEffect(() => {
    setMobileTree(false);
  }, [treePath, tab]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if ((meta && e.key.toLowerCase() === "k") || e.key.toLowerCase() === "t") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setPalette(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-dvh min-w-0 overflow-x-clip bg-canvas text-ink">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 safe-top backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:px-6">
            {showTree ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open file tree"
                onClick={() => setMobileTree(true)}
              >
                <Menu className="size-4" />
              </Button>
            ) : null}
            <div className="flex min-w-0 items-center gap-2">
              <a
                href={REPO.xUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full"
                aria-label={`${REPO.owner} on X`}
                title={`@${REPO.owner} on X`}
              >
                <OwnerAvatar />
              </a>
              <span className="min-w-0">
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <a
                    href={REPO.xUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden truncate text-sm text-mist hover:text-ink hover:underline sm:inline"
                  >
                    {REPO.owner}
                  </a>
                  <span className="hidden text-ash sm:inline">/</span>
                  <Link
                    to="/"
                    className="truncate font-display text-lg leading-none tracking-tight text-ink hover:underline sm:text-xl"
                  >
                    {REPO.name}
                  </Link>
                </span>
              </span>
            </div>
            <span className="hidden rounded-full border border-line px-2 py-0.5 text-xs tracking-wide text-mist uppercase sm:inline">
              Public
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Tooltip content="Find a file  T">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Find a file"
                  onClick={() => setPalette(true)}
                >
                  <Search className="size-4" />
                </Button>
              </Tooltip>
              <Button
                variant={starred ? "subtle" : "outline"}
                size="sm"
                onClick={toggle}
                aria-pressed={starred}
                aria-label={starred ? "Starred" : "Star"}
                className="gap-1.5 px-2 sm:px-3"
              >
                <Star className={cn("size-3.5", starred && "fill-paper text-paper")} />
                <span className="hidden sm:inline">{starred ? "Starred" : "Star"}</span>
                <span className="hidden tabular-nums text-mist sm:inline">{count}</span>
              </Button>
              <CloneMenu />
            </div>
          </div>
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-4 md:px-6">
            {TABS.map((t) => (
              <Link
                key={t.id}
                to={t.to}
                className={cn(
                  "relative shrink-0 px-3 py-2.5 text-sm",
                  tab === t.id ? "text-ink" : "text-mist hover:text-ink",
                )}
              >
                {t.label}
                {tab === t.id ? (
                  <span className="absolute inset-x-2 -bottom-px h-px bg-paper" />
                ) : null}
              </Link>
            ))}
          </div>
        </header>

        <div className="mx-auto min-w-0 max-w-7xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8">{children}</div>
        <CommandPalette open={palette} onOpenChange={setPalette} />

        {mobileTree ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-canvas/70"
              aria-label="Close tree"
              onClick={() => setMobileTree(false)}
            />
            <div className="absolute inset-y-0 left-0 drawer-w overflow-auto border-r border-line bg-panel safe-top">
              <div className="flex items-center justify-between border-b border-line px-3 py-3">
                <p className="text-sm font-medium">Files</p>
                <Button variant="ghost" size="sm" onClick={() => setMobileTree(false)}>
                  Close
                </Button>
              </div>
              <FileTree current={treePath ?? ""} />
            </div>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
