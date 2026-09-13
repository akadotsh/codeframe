import { useEffect, useState } from "react";
import { languageConfig, type Language } from "../config/editor";
import { highlightTheme, loadHighlighter } from "../lib/highlighting";

export function SyntaxEditor({
  code,
  language,
  accent,
  onChange,
}: {
  code: string;
  language: Language;
  accent: string;
  onChange: (code: string) => void;
}) {
  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    let current = true;
    const timeout = window.setTimeout(async () => {
      const highlighter = await loadHighlighter();
      const html = highlighter.codeToHtml(code || " ", {
        lang: languageConfig[language].highlighter,
        theme: highlightTheme,
      });
      if (current) setHighlighted(html);
    }, 40);

    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [code, language]);

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
