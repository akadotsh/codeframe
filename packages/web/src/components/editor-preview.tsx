import type { KeyboardEvent, PointerEvent, RefObject } from "react";
import * as stylex from "@stylexjs/stylex";
import type { Language } from "../config/editor";
import type { FrameMetrics, PreviewMode } from "../config/export";
import type { SyntaxTheme } from "../config/themes";
import type { Palette } from "../palettes";
import { useSyntaxThemeColors } from "../hooks/use-syntax-theme-colors";
import { previewStyles } from "../styles/preview.stylex";
import { FrameResizeHandle } from "./frame-resize-handle";
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
    <div {...stylex.props(previewStyles.canvas)}>
      <div {...stylex.props(previewStyles.previewWrap)}>
        <div
          ref={props.previewStageRef}
          {...stylex.props(previewStyles.stage)}
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
            {...stylex.props(
              previewStyles.indicator,
              props.resizing && previewStyles.indicatorVisible,
            )}
            data-visible={props.resizing}
            aria-hidden={!props.resizing}
          >
            {frameMetrics.width}px
          </output>
          <div {...stylex.props(previewStyles.grain)} aria-hidden="true" />
          <div
            {...stylex.props(previewStyles.codeWindow)}
            style={{
              borderRadius: `${props.radius}px`,
              background: themeColors.background,
              color: themeColors.foreground,
              height: props.aspectRatio ? "100%" : undefined,
            }}
          >
            <div
              {...stylex.props(
                previewStyles.windowReveal,
                !props.titleBar && previewStyles.windowRevealHidden,
              )}
              aria-hidden={!props.titleBar}
            >
              <div
                {...stylex.props(
                  previewStyles.windowBar,
                  !props.titleBar && previewStyles.windowBarHidden,
                )}
              >
                <div {...stylex.props(previewStyles.windowSide)}>
                  {props.mode === "window" ? (
                    <span {...stylex.props(previewStyles.traffic)}>
                      <i {...stylex.props(previewStyles.trafficLight, previewStyles.trafficRed)} />
                      <i
                        {...stylex.props(previewStyles.trafficLight, previewStyles.trafficYellow)}
                      />
                      <i
                        {...stylex.props(previewStyles.trafficLight, previewStyles.trafficGreen)}
                      />
                    </span>
                  ) : (
                    <span
                      {...stylex.props(previewStyles.terminalGlyph)}
                      style={{ color: palette.accent }}
                    >
                      &gt;_
                    </span>
                  )}
                </div>
                <input
                  {...stylex.props(previewStyles.titleInput)}
                  value={props.title}
                  onChange={(event) => props.onTitleChange(event.target.value)}
                  aria-label="Snippet title"
                  tabIndex={props.titleBar ? 0 : -1}
                />
                <span {...stylex.props(previewStyles.language)}>{props.language}</span>
              </div>
            </div>
            <div {...stylex.props(previewStyles.editorShell)} style={{ fontSize: props.fontSize }}>
              {props.lineNumbers && (
                <pre {...stylex.props(previewStyles.lineNumbers)} style={{ color: palette.muted }}>
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
