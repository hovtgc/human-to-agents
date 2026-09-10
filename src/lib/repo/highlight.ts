import type { Language } from "./types";

function esc(s: string): string {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

type Kind = "kw" | "str" | "com" | "num" | "fn" | "type" | "key" | "punc" | "";

function wrap(kind: Kind, text: string): string {
  const body = esc(text);
  return kind ? `<span class="tok-${kind}">${body}</span>` : body;
}

const PY_KW =
  /^(def|class|return|import|from|as|if|elif|else|for|in|while|try|except|raise|with|yield|async|await|True|False|None|not|and|or|lambda|pass|break|continue|is|assert|global|nonlocal)$/;
const TS_KW =
  /^(const|let|var|import|export|from|function|return|async|await|type|interface|class|if|else|for|of|in|new|void|never|string|number|boolean|undefined|null|true|false|extends|implements|readonly|private|public|static|as|throw|try|catch|finally|typeof|keyof|infer|satisfies|default|break|continue|while|switch|case|do)$/;

function tokenizeLine(
  line: string,
  lang: Language,
  inBlock: { on: boolean },
): string {
  if (lang === "text" || lang === "ignore") return esc(line);

  if (lang === "python" && inBlock.on) {
    const end = line.indexOf('"""');
    if (end >= 0) {
      inBlock.on = false;
      return wrap("com", line.slice(0, end + 3)) + tokenizeLine(line.slice(end + 3), lang, inBlock);
    }
    return wrap("com", line);
  }

  const out: string[] = [];
  let i = 0;
  const isPy = lang === "python";
  const isTs = lang === "typescript";
  const isJson = lang === "json";
  const isYaml = lang === "yaml";
  const isMd = lang === "markdown";

  while (i < line.length) {
    const rest = line.slice(i);

    if (isPy && rest.startsWith('"""')) {
      const end = rest.indexOf('"""', 3);
      if (end < 0) {
        inBlock.on = true;
        out.push(wrap("com", rest));
        break;
      }
      out.push(wrap("com", rest.slice(0, end + 3)));
      i += end + 3;
      continue;
    }

    if ((isPy || isYaml) && rest.startsWith("#")) {
      out.push(wrap("com", rest));
      break;
    }
    if (isTs && rest.startsWith("//")) {
      out.push(wrap("com", rest));
      break;
    }

    if (isMd && rest.startsWith("#")) {
      out.push(wrap("kw", rest));
      break;
    }

    const str = rest.match(/^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
    if (str) {
      const next = line.slice(i + str[0].length);
      const kind: Kind = isJson && /^\s*:/.test(next) ? "key" : "str";
      out.push(wrap(kind, str[0]));
      i += str[0].length;
      continue;
    }

    const num = rest.match(/^\b\d+(?:\.\d+)?\b/);
    if (num) {
      out.push(wrap("num", num[0]));
      i += num[0].length;
      continue;
    }

    const ident = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (ident) {
      const word = ident[0];
      const after = line.slice(i + word.length);
      let kind: Kind = "";
      if ((isPy && PY_KW.test(word)) || (isTs && TS_KW.test(word))) kind = "kw";
      else if (isTs && /^[A-Z]/.test(word)) kind = "type";
      else if ((isPy || isTs) && after.startsWith("(")) kind = "fn";
      else if (isYaml && after.startsWith(":")) kind = "key";
      out.push(wrap(kind, word));
      i += word.length;
      continue;
    }

    const punc = rest[0]!;
    if ("{}[]():,;.=<>+-*/|&!?".includes(punc)) out.push(wrap("punc", punc));
    else out.push(esc(punc));
    i += 1;
  }

  return out.join("");
}

export function highlightLines(content: string, language: Language): string[] {
  const inBlock = { on: false };
  return content.split("\n").map((line) => tokenizeLine(line, language, inBlock));
}
