import type { KeyboardEvent, PointerEvent, RefObject } from "react";
import type { Language } from "../config/editor";
import type { FrameMetrics, PreviewMode } from "../config/export";
import type { SyntaxTheme } from "../config/themes";
import type { Palette } from "../palettes";
import { useSyntaxThemeColors } from "../hooks/use-syntax-theme-colors";
import { FrameResizeHandle } from "./frame-resize-handle";
import { PreviewModeSelector } from "./preview-mode-selector";
import { SyntaxEditor } from "./syntax-editor";

type EditorPreviewProps = {
  aspectRatio: number | null;
  code: string;
  fontSize: number;
  frameMetrics: FrameMetrics;
  language: Language;
  lineNumbers: boolean;
  mode: PreviewMode;
  padding: number;
  palette: Palette;
  previewStageRef: RefObject<HTMLDivElement | null>;
  radius: number;
  resizing: boolean;
  title: string;
  titleBar: boolean;
  syntaxTheme: SyntaxTheme;
  onCodeChange: (value: string) => void;
  onModeChange: (value: PreviewMode) => void;
  onResizeEnd: () => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onResizeMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>, direction: 1 | -1) => void;
  onTitleChange: (value: string) => void;
};

export function EditorPreview(props: EditorPreviewProps) {
  const { frameMetrics, palette } = props;
  const lines = props.code.split("\n");
  const themeColors = useSyntaxThemeColors(props.syntaxTheme, {
    background: palette.card,
    foreground: palette.text,
  });

  return (
    <div className="canvas-area">
      <div className="canvas-toolbar" aria-label="Preview type">
        <PreviewModeSelector mode={props.mode} onChange={props.onModeChange} />
        <span className="canvas-size">
          {frameMetrics.width} × {frameMetrics.height}
        </span>
      </div>
      <div className="preview-wrap">
        <div
          ref={props.previewStageRef}
          className="preview-stage"
          style={{
            width: `${Math.round(frameMetrics.width * 0.72)}px`,
            background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
            padding: `${props.aspectRatio ? Math.round(props.padding * 0.72) : props.padding}px`,
            aspectRatio: props.aspectRatio ?? undefined,
          }}
        >
          {(["left", "right"] as const).map((side) => (
            <FrameResizeHandle
              key={side}
              side={side}
              width={frameMetrics.width}
              onPointerDown={(event) => props.onResizeStart(event, side === "left" ? -1 : 1)}
              onPointerMove={props.onResizeMove}
              onPointerEnd={props.onResizeEnd}
              onKeyDown={props.onResizeKeyDown}
            />
          ))}
          <output
            className="frame-width-indicator"
            data-visible={props.resizing}
            aria-hidden={!props.resizing}
          >
            {frameMetrics.width}px
          </output>
          <div className="grain" aria-hidden="true" />
          <div
            className="code-window"
            style={{
              borderRadius: `${props.radius}px`,
              background: themeColors.background,
              color: themeColors.foreground,
              height: props.aspectRatio ? "100%" : undefined,
            }}
          >
            <div
              className={`window-bar-reveal${props.titleBar ? "" : " hidden"}`}
              aria-hidden={!props.titleBar}
            >
              <div className="window-bar">
                <div className="window-side">
                  {props.mode === "window" ? (
                    <span className="traffic">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span className="terminal-glyph" style={{ color: palette.accent }}>
                      &gt;_
                    </span>
                  )}
                </div>
                <input
                  value={props.title}
                  onChange={(event) => props.onTitleChange(event.target.value)}
                  aria-label="Snippet title"
                  tabIndex={props.titleBar ? 0 : -1}
                />
                <span className="language-pill">{props.language}</span>
              </div>
            </div>
            <div className="editor-shell" style={{ fontSize: `${props.fontSize}px` }}>
              {props.lineNumbers && (
                <pre className="line-numbers" style={{ color: palette.muted }}>
                  {lines.map((_, index) => `${index + 1}\n`)}
                </pre>
              )}
              <SyntaxEditor
                code={props.code}
                language={props.language}
                theme={props.syntaxTheme}
                accent={palette.accent}
                onChange={props.onCodeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
