import { FileCode2, FileJson, FileText, Folder, FolderOpen } from "lucide-react";
import type { Language } from "@/lib/repo/types";

export function FileGlyph({
  type,
  language,
  open,
}: {
  type: "file" | "dir";
  language?: Language;
  open?: boolean;
}) {
  const cls = "size-3.5 shrink-0 text-ash";
  if (type === "dir") {
    return open ? <FolderOpen className={cls} /> : <Folder className={cls} />;
  }
  if (language === "json") return <FileJson className={cls} />;
  if (language === "markdown" || language === "text" || language === "yaml" || language === "ignore") {
    return <FileText className={cls} />;
  }
  return <FileCode2 className={cls} />;
}
