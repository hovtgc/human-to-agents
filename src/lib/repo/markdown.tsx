import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { highlightLines } from "./highlight";
import type { Language } from "./types";

function langOf(name: string): Language {
  if (name === "python" || name === "py") return "python";
  if (name === "ts" || name === "typescript" || name === "js") return "typescript";
  if (name === "json") return "json";
  if (name === "yaml" || name === "yml") return "yaml";
  if (name === "bash" || name === "sh") return "text";
  if (name === "md" || name === "markdown") return "markdown";
  return "text";
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[3]!;
      const label = m[2]!;
      if (href.startsWith("/blob/")) {
        parts.push(
          <Link key={k++} to="/blob/$" params={{ _splat: href.slice("/blob/".length) }} className="underline">
            {label}
          </Link>,
        );
      } else {
        parts.push(
          <a key={k++} href={href} className="underline">
            {label}
          </a>,
        );
      }
    } else if (m[4]) {
      parts.push(<code key={k++}>{m[4].slice(1, -1)}</code>);
    } else if (m[5]) {
      parts.push(<strong key={k++}>{m[5].slice(2, -2)}</strong>);
    } else if (m[6]) {
      parts.push(<em key={k++}>{m[6].slice(1, -1)}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBlock(block: string, key: number): ReactNode {
  if (block.startsWith("```")) {
    const nl = block.indexOf("\n");
    const lang = block.slice(3, nl).trim();
    const body = block.slice(nl + 1).replace(/```$/, "").replace(/\n$/, "");
    const html = highlightLines(body, langOf(lang)).join("\n");
    return (
      <div key={key} className="max-w-full min-w-0 overflow-x-auto">
        <pre>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    );
  }
  if (block.startsWith("# ")) return <h1 key={key}>{renderInline(block.slice(2))}</h1>;
  if (block.startsWith("## ")) return <h2 key={key}>{renderInline(block.slice(3))}</h2>;
  if (block.startsWith("### ")) return <h3 key={key}>{renderInline(block.slice(4))}</h3>;
  if (block.startsWith("> ")) {
    const quote = block
      .split("\n")
      .map((l) => l.replace(/^>\s?/, ""))
      .join(" ");
    return <blockquote key={key}>{renderInline(quote)}</blockquote>;
  }
  if (block === "---") return <hr key={key} />;
  if (block.startsWith("|")) {
    const rows = block
      .split("\n")
      .filter((l) => l.trim().startsWith("|"))
      .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
      .filter((cells) => !cells.every((c) => /^[-:]+$/.test(c)));
    const [head, ...body] = rows;
    if (!head) return null;
    return (
      <div key={key} className="max-w-full min-w-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci}>{renderInline(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (/^[-*] /.test(block) || /^\d+\. /.test(block)) {
    const items = block.split("\n").filter(Boolean);
    const ordered = /^\d+\. /.test(items[0]!);
    const Tag = ordered ? "ol" : "ul";
    return (
      <Tag key={key}>
        {items.map((item, i) => (
          <li key={i}>{renderInline(item.replace(/^([-*] |\d+\. )/, ""))}</li>
        ))}
      </Tag>
    );
  }
  return <p key={key}>{renderInline(block)}</p>;
}

export function Markdown({ source }: { source: string }) {
  const chunks: string[] = [];
  const fence = /```[\s\S]*?```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(source))) {
    if (m.index > last) chunks.push(source.slice(last, m.index));
    chunks.push(m[0]);
    last = m.index + m[0].length;
  }
  if (last < source.length) chunks.push(source.slice(last));

  const blocks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.startsWith("```")) blocks.push(chunk.trim());
    else {
      for (const part of chunk.split(/\n{2,}/)) {
        const t = part.trim();
        if (t) blocks.push(t);
      }
    }
  }

  return <div className="prose-axiom min-w-0">{blocks.map((b, i) => renderBlock(b, i))}</div>;
}
