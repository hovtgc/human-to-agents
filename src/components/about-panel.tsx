import { CONTRIBUTORS, REPO } from "@/lib/repo/meta";
import { fileCount } from "@/lib/repo/commits";
import { GitHubMark, OwnerAvatar, XMark } from "./mark";
import { LanguageBar } from "./language-bar";
import { Separator } from "./ui/separator";

export function AboutPanel() {
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 grid gap-6 px-1 py-2">
        <div>
          <h2 className="text-xs font-medium tracking-wide text-ash uppercase">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{REPO.description}</p>
        </div>
        <LanguageBar />
        <Separator />
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-ash">License</dt>
          <dd className="text-ink">{REPO.license}</dd>
          <dt className="text-ash">Release</dt>
          <dd className="text-ink">{REPO.version}</dd>
          <dt className="text-ash">Files</dt>
          <dd className="tabular-nums text-ink">{fileCount()}</dd>
          <dt className="text-ash">Branch</dt>
          <dd className="text-ink">{REPO.defaultBranch}</dd>
        </dl>
        <Separator />
        <div>
          <h2 className="text-xs font-medium tracking-wide text-ash uppercase">Owner</h2>
          <div className="mt-3 flex items-center gap-3">
            <OwnerAvatar className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{REPO.ownerName}</p>
              <p className="truncate text-xs text-ash">@{REPO.owner}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={REPO.xUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-raised text-xs font-medium text-ink hover:bg-panel"
            >
              <XMark className="size-3.5" />
              X
            </a>
            <a
              href={REPO.githubProfile}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-raised text-xs font-medium text-ink hover:bg-panel"
            >
              <GitHubMark className="size-3.5" />
              GitHub
            </a>
          </div>
        </div>
        <Separator />
        <div>
          <h2 className="text-xs font-medium tracking-wide text-ash uppercase">Contributors</h2>
          <ul className="mt-3 grid gap-2">
            {CONTRIBUTORS.map((c) => (
              <li key={c.handle} className="flex items-center gap-2 text-sm">
                {"avatar" in c && c.avatar ? (
                  <img
                    src={c.avatar}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 rounded-full object-cover outline outline-1 -outline-offset-1 outline-line"
                  />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-raised text-xs text-mist">
                    {c.name.slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-ink">{c.name}</span>
                  <span className="block text-xs text-ash">{c.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
