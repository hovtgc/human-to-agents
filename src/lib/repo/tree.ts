import type { TreeNode } from "./types";
import { FILES } from "./files";

function sortNodes(nodes: TreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const n of nodes) if (n.children) sortNodes(n.children);
}

export function buildTree(): TreeNode {
  const root: TreeNode = { name: "", path: "", type: "dir", children: [] };
  for (const f of FILES) {
    const parts = f.path.split("/");
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const isFile = i === parts.length - 1;
      const name = parts[i]!;
      const path = parts.slice(0, i + 1).join("/");
      node.children ??= [];
      let child = node.children.find((c) => c.name === name);
      if (!child) {
        child = isFile
          ? { name, path, type: "file", language: f.language }
          : { name, path, type: "dir", children: [] };
        node.children.push(child);
      }
      node = child;
    }
  }
  sortNodes(root.children ?? []);
  return root;
}

export const TREE = buildTree();

export function getDir(path: string): TreeNode | undefined {
  if (!path) return TREE;
  const parts = path.split("/");
  let node: TreeNode | undefined = TREE;
  for (const part of parts) {
    node = node.children?.find((c) => c.name === part && c.type === "dir");
    if (!node) return undefined;
  }
  return node;
}

export function listDir(path: string): TreeNode[] {
  return getDir(path)?.children ?? [];
}

export const DEFAULT_OPEN = new Set([
  "agent",
  "agent/python",
  "agent/node",
  "schema",
  "docs",
  "examples",
  ".github",
  ".github/workflows",
]);
