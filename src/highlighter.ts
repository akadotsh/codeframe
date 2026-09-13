import css from "@shikijs/langs/css";
import go from "@shikijs/langs/go";
import javascript from "@shikijs/langs/javascript";
import python from "@shikijs/langs/python";
import rust from "@shikijs/langs/rust";
import typescript from "@shikijs/langs/typescript";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export const highlighterPromise = createHighlighterCore({
  themes: [githubDarkDefault],
  langs: [typescript, javascript, python, css, rust, go],
  engine: createJavaScriptRegexEngine(),
});
