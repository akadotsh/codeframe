import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export const highlighterPromise = createHighlighterCore({
  themes: [],
  langs: [],
  engine: createJavaScriptRegexEngine(),
});
