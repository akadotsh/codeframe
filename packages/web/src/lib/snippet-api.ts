import {
  resolveSnippetState,
  validateSnippetSearch,
  type SnippetState,
} from "../config/snippet-state";

type CreatedSnippet = {
  download_url: string;
};

const apiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function createSnippet(state: SnippetState) {
  const response = await fetch(`${apiUrl}/api/snippets`, {
    body: JSON.stringify(state),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("The download URL could not be created.");

  const snippet = (await response.json()) as Partial<CreatedSnippet>;
  if (typeof snippet.download_url !== "string")
    throw new Error("The API returned an invalid link.");
  return snippet as CreatedSnippet;
}

export async function getSnippet(id: string) {
  const response = await fetch(`${apiUrl}/api/snippets/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("This shared snippet is unavailable or has expired.");

  const value = (await response.json()) as Record<string, unknown>;
  return resolveSnippetState(validateSnippetSearch(value));
}
