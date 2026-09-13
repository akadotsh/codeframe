export const highlightTheme = "github-dark-default";

export const loadHighlighter = () =>
  import("../highlighter").then((module) => module.highlighterPromise);
