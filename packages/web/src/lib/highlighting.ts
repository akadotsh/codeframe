import { languageLoaders, type HighlightLanguage } from "../config/language-loaders";
import { themeLoaders, type SyntaxTheme } from "../config/themes";

export const loadHighlighter = () =>
  import("../highlighter").then((module) => module.highlighterPromise);

const pendingLanguages = new Map<HighlightLanguage, Promise<void>>();
const pendingThemes = new Map<SyntaxTheme, Promise<void>>();

export async function getHighlighter(language: HighlightLanguage, theme: SyntaxTheme) {
  const highlighter = await loadHighlighter();
  const loads: Array<Promise<void>> = [];

  if (language !== "text" && !highlighter.getLoadedLanguages().includes(language)) {
    let pendingLanguage = pendingLanguages.get(language);
    if (!pendingLanguage) {
      pendingLanguage = highlighter.loadLanguage(languageLoaders[language]()).then(() => undefined);
      pendingLanguages.set(language, pendingLanguage);
    }
    loads.push(pendingLanguage);
  }

  if (!highlighter.getLoadedThemes().includes(theme)) {
    let pendingTheme = pendingThemes.get(theme);
    if (!pendingTheme) {
      pendingTheme = highlighter.loadTheme(themeLoaders[theme]()).then(() => undefined);
      pendingThemes.set(theme, pendingTheme);
    }
    loads.push(pendingTheme);
  }

  await Promise.all(loads);
  return highlighter;
}
