import { cn } from "@/lib/utils";
import { REPO } from "@/lib/repo/meta";

export function OwnerAvatar({ className }: { className?: string }) {
  return (
    <img
      src={REPO.ownerAvatar}
      alt=""
      width={28}
      height={28}
      className={cn(
        "size-7 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-line",
        className,
      )}
    />
  );
}
