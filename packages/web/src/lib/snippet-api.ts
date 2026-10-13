import {
  resolveSnippetState,
  validateSnippetSearch,
  type SnippetState,
} from "../config/snippet-state";

type CreatedSnippet = SnippetState & {
  expiresIn: number;
  id: string;
  url: string;
};

export async function createSnippet(state: SnippetState) {
  const response = await fetch("/api/snippets", {
    body: JSON.stringify(state),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("The short link could not be created.");

  const snippet = (await response.json()) as Partial<CreatedSnippet>;
  if (typeof snippet.url !== "string") throw new Error("The API returned an invalid short link.");
  return snippet as CreatedSnippet;
}

export async function getSnippet(id: string) {
  const response = await fetch(`/api/snippets/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("This shared snippet is unavailable or has expired.");

  const value = (await response.json()) as Record<string, unknown>;
  return resolveSnippetState(validateSnippetSearch(value));
}
