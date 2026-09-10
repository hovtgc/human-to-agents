export type Language =
  | "markdown"
  | "python"
  | "typescript"
  | "json"
  | "yaml"
  | "text"
  | "ignore";

export type RepoFile = {
  path: string;
  language: Language;
  content: string;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  language?: Language;
  children?: TreeNode[];
};

export type CommitChange = {
  path: string;
  status: "added" | "modified";
  additions: number;
  deletions: number;
  patch: string;
};

export type Commit = {
  hash: string;
  short: string;
  author: { name: string; handle: string };
  date: string;
  message: string;
  body?: string;
  files: CommitChange[];
};
