import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { askGrok } from "@/lib/ask-grok";
import { Markdown } from "@/lib/repo/markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How does scoping work?",
  "Show me the mapping schema.",
  "Python or Node — which should I run?",
  "What happens on an unknown channel id?",
];

type Msg = { role: "user" | "assistant"; text: string };

export function AskPanel({ path }: { path?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setPending(true);
    try {
      const res = await askGrok({ data: { question: q, path } });
      if (!res.ok) {
        setError(res.error);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: res.text }]);
      }
    } catch {
      setError("Could not reach Grok.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-2xl gap-8 ask-pad-b">
      <header className="enter-1">
        <p className="text-xs font-medium tracking-wide text-ash uppercase">Ask the repository</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink md:text-5xl">
          Grok reads this git.
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-mist">
          Questions are answered from the mapping schema, the axioms, and the relay source — not from the open web.
        </p>
      </header>

      {messages.length === 0 && !pending ? (
        <ul className="enter-2 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => void send(s)}
                className="h-full min-h-11 w-full rounded-lg border border-line bg-panel px-4 py-3 text-left text-sm text-mist hover:bg-raised hover:text-ink"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="grid min-w-0 gap-5">
          {messages.map((m, i) => (
            <li
              key={i}
              className={cn(
                "max-w-xl min-w-0 text-sm leading-relaxed",
                m.role === "user" ? "ml-auto rounded-lg bg-raised px-4 py-3 text-ink" : "text-mist",
              )}
            >
              {m.role === "assistant" ? <Markdown source={m.text} /> : m.text}
            </li>
          ))}
          {pending ? <li className="shimmer-text text-sm">Reading the tree…</li> : null}
          {error ? <li className="text-sm text-rose">{error}</li> : null}
        </ol>
      )}

      <form
        className="ask-sticky sticky flex gap-2 rounded-xl border border-line bg-panel p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about mappings, scope, Slack, Discord…"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-ink placeholder:text-ash focus-visible:outline-none"
          maxLength={800}
        />
        <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  );
}
