import { languageLoaders, type HighlightLanguage } from "../config/language-loaders";

export const highlightTheme = "github-dark-default";

export const loadHighlighter = () =>
  import("../highlighter").then((module) => module.highlighterPromise);

const pendingLanguages = new Map<HighlightLanguage, Promise<void>>();

export async function getHighlighter(language: HighlightLanguage) {
  const highlighter = await loadHighlighter();
  if (language === "text" || highlighter.getLoadedLanguages().includes(language))
    return highlighter;

  let pendingLanguage = pendingLanguages.get(language);
  if (!pendingLanguage) {
    pendingLanguage = highlighter.loadLanguage(languageLoaders[language]()).then(() => undefined);
    pendingLanguages.set(language, pendingLanguage);
  }
  await pendingLanguage;
  return highlighter;
}
