import { Fragment, useEffect, useState, type CSSProperties } from "react";
import type { ThemedToken } from "shiki";
import * as stylex from "@stylexjs/stylex";
import { languageConfig, type Language } from "../config/editor";
import type { SyntaxTheme } from "../config/themes";
import { getHighlighter } from "../lib/highlighting";

const styles = stylex.create({
  editor: { position: "relative", minWidth: 0, minHeight: 253 },
  highlight: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  code: {
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
    font: "inherit",
    lineHeight: "inherit",
    tabSize: 2,
    whiteSpace: "pre",
  },
  textarea: {
    position: "relative",
    width: "100%",
    minHeight: 253,
    resize: "none",
    borderWidth: 0,
    outline: "none",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    font: "inherit",
    lineHeight: "inherit",
    tabSize: 2,
    whiteSpace: "pre",
    "::selection": { backgroundColor: "rgba(143, 131, 223, 0.3)" },
  },
});

function getTokenStyle(token: ThemedToken): CSSProperties {
  if (token.htmlStyle) return token.htmlStyle as CSSProperties;
  return {
    color: token.color,
    backgroundColor: token.bgColor,
    fontStyle: token.fontStyle && token.fontStyle & 1 ? "italic" : undefined,
    fontWeight: token.fontStyle && token.fontStyle & 2 ? 700 : undefined,
    textDecoration: token.fontStyle && token.fontStyle & 4 ? "underline" : undefined,
  };
}

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
  const [highlighted, setHighlighted] = useState<ThemedToken[][] | null>(null);

  useEffect(() => {
    let current = true;
    const timeout = window.setTimeout(async () => {
      const highlighter = await getHighlighter(languageConfig[language].highlighter, theme);
      const tokens = highlighter.codeToTokens(code || " ", {
        lang: languageConfig[language].highlighter,
        theme,
      }).tokens;
      if (current) setHighlighted(tokens);
    }, 40);

    return () => {
      current = false;
      window.clearTimeout(timeout);
    };
  }, [code, language, theme]);

  return (
    <div {...stylex.props(styles.editor)}>
      <div {...stylex.props(styles.highlight)} aria-hidden="true">
        <pre {...stylex.props(styles.code)}>
          <code>
            {highlighted
              ? highlighted.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {line.map((token) => (
                      <span key={token.offset} style={getTokenStyle(token)}>
                        {token.content}
                      </span>
                    ))}
                    {lineIndex < highlighted.length - 1 ? "\n" : null}
                  </Fragment>
                ))
              : code}
          </code>
        </pre>
      </div>
      <textarea
        {...stylex.props(styles.textarea)}
        aria-label="Code snippet"
        value={code}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        style={{ caretColor: accent }}
      />
    </div>
  );
}
