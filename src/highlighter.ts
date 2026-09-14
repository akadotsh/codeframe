import githubDarkDefault from "@shikijs/themes/github-dark-default";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export const highlighterPromise = createHighlighterCore({
  themes: [githubDarkDefault],
  langs: [],
  engine: createJavaScriptRegexEngine(),
});
