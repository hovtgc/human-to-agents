import { languageStats } from "@/lib/repo/files";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  typescript: "bg-ink",
  python: "bg-sage",
  markdown: "bg-mist",
  json: "bg-ash",
  yaml: "bg-ash",
  text: "bg-line",
  ignore: "bg-line",
};

const LABELS: Record<string, string> = {
  typescript: "TypeScript",
  python: "Python",
  markdown: "Markdown",
  json: "JSON",
  yaml: "YAML",
  text: "Text",
  ignore: "Ignore",
};

export function LanguageBar() {
  const stats = languageStats();
  return (
    <div className="grid gap-2">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-raised">
        {stats.map((s) => (
          <div
            key={s.language}
            className={cn(TONES[s.language] ?? "bg-mist")}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist">
        {stats.map((s) => (
          <li key={s.language} className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", TONES[s.language] ?? "bg-mist")} />
            {LABELS[s.language] ?? s.language}
            <span className="tabular-nums text-ash">{s.pct.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
