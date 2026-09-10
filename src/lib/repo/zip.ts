import JSZip from "jszip";
import { FILES } from "./files";
import { REPO } from "./meta";

export async function downloadRepoZip() {
  const zip = new JSZip();
  const root = zip.folder(REPO.name);
  if (!root) return;
  for (const file of FILES) root.file(file.path, file.content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${REPO.name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
