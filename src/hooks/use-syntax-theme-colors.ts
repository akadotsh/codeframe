import { useEffect, useState } from "react";
import type { SyntaxTheme } from "../config/themes";
import { getHighlighter } from "../lib/highlighting";

type ThemeColors = {
  background: string;
  foreground: string;
};

export function useSyntaxThemeColors(theme: SyntaxTheme, fallback: ThemeColors) {
  const [colors, setColors] = useState(fallback);

  useEffect(() => {
    let current = true;
    getHighlighter("text", theme).then((highlighter) => {
      const loadedTheme = highlighter.getTheme(theme);
      if (current) {
        setColors({ background: loadedTheme.bg, foreground: loadedTheme.fg });
      }
    });

    return () => {
      current = false;
    };
  }, [theme]);

  return colors;
}
