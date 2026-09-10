import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FILES } from "@/lib/repo/files";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileGlyph } from "./file-icon";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return FILES.slice(0, 12);
    return FILES.filter((f) => f.path.toLowerCase().includes(needle)).slice(0, 20);
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-2">
        <DialogTitle className="sr-only">Find a file</DialogTitle>
        <Input
          autoFocus
          placeholder="Find a file"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-0 bg-transparent focus-visible:border-0"
        />
        <ul className="max-h-80 overflow-auto py-1">
          {results.map((f) => (
            <li key={f.path}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-mist hover:bg-raised hover:text-ink"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/blob/$", params: { _splat: f.path } });
                }}
              >
                <FileGlyph type="file" language={f.language} />
                <span className="truncate font-mono text-xs">{f.path}</span>
              </button>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ash">No files match.</li>
          ) : null}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
