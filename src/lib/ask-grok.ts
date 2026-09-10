import { createServerFn } from "@tanstack/react-start";
import { FILES, getFile } from "@/lib/repo/files";
import { COMMITS } from "@/lib/repo/commits";

const MAX_FILE = 5000;

function digest(path?: string, question?: string): string {
  const tree = FILES.map((f) => f.path).join("\n");
  const readme = getFile("README.md")?.content ?? "";
  const axioms = getFile("AXIOMS.md")?.content ?? "";
  const schema = getFile("schema/channels.md")?.content ?? "";
  const commits = COMMITS.map((c) => `${c.short} ${c.message}`).join("\n");

  const extras: string[] = [];
  const viewed = path ? getFile(path) : undefined;
  if (viewed) extras.push(`# currently viewing ${viewed.path}\n${viewed.content.slice(0, MAX_FILE)}`);

  const q = (question ?? "").toLowerCase();
  for (const f of FILES) {
    const name = f.path.split("/").pop() ?? "";
    if (f.path === path) continue;
    if (q.includes(f.path.toLowerCase()) || (name.length > 3 && q.includes(name.toLowerCase()))) {
      extras.push(`# ${f.path}\n${f.content.slice(0, MAX_FILE)}`);
    }
    if (extras.length >= 4) break;
  }

  return [
    "Repository: axiom/scoped-relay (MIT). The page is the git.",
    `# tree\n${tree}`,
    `# commits\n${commits}`,
    `# README.md\n${readme.slice(0, 3500)}`,
    `# AXIOMS.md\n${axioms}`,
    `# schema/channels.md\n${schema}`,
    ...extras,
  ].join("\n\n");
}

export const askGrok = createServerFn({ method: "POST" })
  .validator((input: { question: string; path?: string }) => input)
  .handler(async ({ data }) => {
    const question = data.question.trim().slice(0, 800);
    if (!question) return { ok: false as const, error: "Ask something about the repo." };

    const { env } = await import("@/lib/env.server");
    const apiKey = env("XAI_API_KEY");
    if (!apiKey) return { ok: false as const, error: "Grok is not available in this environment." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You are Grok answering questions about the Axiom open-source repository (scoped human–agent relays). Answer only from the repository context. Cite file paths. Quote short snippets when useful. If the question is outside the repo, say so. Keep answers under 220 words. No emoji.",
          },
          { role: "user", content: `${digest(data.path, question)}\n\nQuestion: ${question}` },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Grok returned ${res.status}. Try again in a moment.` };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Empty reply." };
    return { ok: true as const, text };
  });
