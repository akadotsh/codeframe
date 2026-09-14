import { useEffect, useState } from "react";
import { languageConfig, type Language } from "../config/editor";
import type { SyntaxTheme } from "../config/themes";
import { getHighlighter } from "../lib/highlighting";

export function SyntaxEditor({
  code,
  language,
  theme,
  accent,
  onChange,
}: {
  code: string;
  language: Language;
  theme: SyntaxTheme;
  accent: string;
  onChange: (code: string) => void;
}) {
  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    let current = true;
    const timeout = window.setTimeout(async () => {
      const highlighter = await getHighlighter(languageConfig[language].highlighter, theme);
      const html = highlighter.codeToHtml(code || " ", {
        lang: languageConfig[language].highlighter,
        theme,
      });
      if (current) setHighlighted(html);
    }, 40);

    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [code, language, theme]);

  return (
    <div className="syntax-editor">
      <div
        className="highlight-layer"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      <textarea
        aria-label="Code snippet"
        value={code}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        style={{ caretColor: accent }}
      />
    </div>
  );
}
