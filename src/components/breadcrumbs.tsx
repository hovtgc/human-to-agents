import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { REPO } from "@/lib/repo/meta";
import { FILE_MAP } from "@/lib/repo/files";

export function Breadcrumbs({ path }: { path: string }) {
  const parts = path ? path.split("/") : [];
  return (
    <nav aria-label="Path" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
      <Link to="/" className="font-medium text-ink hover:underline">
        {REPO.name}
      </Link>
      {parts.map((part, i) => {
        const sub = parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        const isFile = FILE_MAP.has(sub);
        return (
          <span key={sub} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-3.5 text-ash" />
            {isLast ? (
              <span className="truncate text-ink">{part}</span>
            ) : isFile ? (
              <Link to="/blob/$" params={{ _splat: sub }} className="truncate text-mist hover:text-ink">
                {part}
              </Link>
            ) : (
              <Link to="/tree/$" params={{ _splat: sub }} className="truncate text-mist hover:text-ink">
                {part}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
