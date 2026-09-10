import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { DEFAULT_OPEN, TREE } from "@/lib/repo/tree";
import type { TreeNode } from "@/lib/repo/types";
import { cn } from "@/lib/utils";
import { FileGlyph } from "./file-icon";

function NodeRow({
  node,
  depth,
  current,
  open,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  current: string;
  open: Set<string>;
  onToggle: (path: string) => void;
}) {
  const active = current === node.path;
  const isOpen = node.type === "dir" && open.has(node.path);
  const pad = 8 + depth * 12;

  if (node.type === "dir") {
    return (
      <div>
        <div className="flex items-center">
          <button
            type="button"
            aria-label={isOpen ? "Collapse folder" : "Expand folder"}
            onClick={() => onToggle(node.path)}
            className="grid size-8 place-items-center text-ash hover:text-ink"
          >
            <ChevronRight className={cn("size-3.5 transition-transform duration-150", isOpen && "rotate-90")} />
          </button>
          <Link
            to="/tree/$"
            params={{ _splat: node.path }}
            className={cn(
              "flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-sm py-1 pr-2 text-sm",
              active ? "bg-raised text-ink" : "text-mist hover:bg-raised hover:text-ink",
            )}
            style={{ paddingLeft: pad }}
          >
            <FileGlyph type="dir" open={isOpen} />
            <span className="truncate">{node.name}</span>
          </Link>
        </div>
        {isOpen
          ? node.children?.map((child) => (
              <NodeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                current={current}
                open={open}
                onToggle={onToggle}
              />
            ))
          : null}
      </div>
    );
  }

  return (
    <Link
      to="/blob/$"
      params={{ _splat: node.path }}
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-sm py-1 pr-2 text-sm",
        active ? "bg-raised text-ink" : "text-mist hover:bg-raised hover:text-ink",
      )}
      style={{ paddingLeft: pad + 32 }}
    >
      <FileGlyph type="file" language={node.language} />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

export function FileTree({ current }: { current: string }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(DEFAULT_OPEN));

  function onToggle(path: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <nav aria-label="Repository tree" className="py-2">
      <Link
        to="/"
        className={cn(
          "mx-2 mb-1 flex h-8 items-center rounded-sm px-2 text-xs font-medium tracking-wide uppercase",
          current === "" ? "bg-raised text-ink" : "text-ash hover:text-ink",
        )}
      >
        scoped-relay
      </Link>
      {TREE.children?.map((node) => (
        <NodeRow key={node.path} node={node} depth={0} current={current} open={open} onToggle={onToggle} />
      ))}
    </nav>
  );
}
