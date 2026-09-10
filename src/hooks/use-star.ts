import { useEffect, useState } from "react";
import { REPO } from "@/lib/repo/meta";

const KEY = "axiom:starred";

export function useStar() {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    setStarred(localStorage.getItem(KEY) === "1");
  }, []);

  function toggle() {
    setStarred((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }

  return { starred, toggle, count: REPO.starsBase + (starred ? 1 : 0) };
}
