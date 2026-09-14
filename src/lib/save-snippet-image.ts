import { languageConfig, type Language } from "../config/editor";
import {
  imageFormats,
  type FrameMetrics,
  type ImageFormat,
  type PreviewMode,
} from "../config/export";
import type { Palette } from "../palettes";
import type { SyntaxTheme } from "../config/themes";
import { getHighlighter } from "./highlighting";

type SaveSnippetImageOptions = {
  code: string;
  fontSize: number;
  format: ImageFormat;
  frameMetrics: FrameMetrics;
  language: Language;
  lineNumbers: boolean;
  mode: PreviewMode;
  padding: number;
  palette: Palette;
  radius: number;
  title: string;
  titleBar: boolean;
  syntaxTheme: SyntaxTheme;
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
}

function drawTitleBar(
  context: CanvasRenderingContext2D,
  options: SaveSnippetImageOptions,
  width: number,
  x: number,
  y: number,
) {
  const { mode, palette, title } = options;
  context.fillStyle = "rgba(255,255,255,.025)";
  context.fillRect(x, y, width - x * 2, 70);
  if (mode === "window") {
    ["#ff5f57", "#febc2e", "#28c840"].forEach((color, index) => {
      context.beginPath();
      context.arc(x + 34 + index * 25, y + 35, 7, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
  } else {
    context.fillStyle = palette.accent;
    context.font = "600 16px 'Geist Mono Variable', ui-monospace, monospace";
    context.fillText(">_", x + 30, y + 41);
  }
  context.fillStyle = palette.muted;
  context.font = "500 15px 'Geist Mono Variable', ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(title, width / 2, y + 41);
  context.textAlign = "left";
}

export async function saveSnippetImage(options: SaveSnippetImageOptions) {
  const {
    code,
    fontSize,
    format: formatValue,
    frameMetrics,
    language,
    lineNumbers,
    padding,
    palette,
    radius,
    title,
    titleBar,
    syntaxTheme,
  } = options;
  await document.fonts.ready;
  const highlighter = await getHighlighter(languageConfig[language].highlighter, syntaxTheme);
  const theme = highlighter.getTheme(syntaxTheme);
  const highlightedLines = highlighter.codeToTokens(code, {
    lang: languageConfig[language].highlighter,
    theme: syntaxTheme,
  }).tokens;
  const scale = 2;
  const { width, height, cardHeight, lineHeight, chromeHeight } = frameMetrics;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(scale, scale);
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette.colors[0]);
  gradient.addColorStop(1, palette.colors[1]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  const x = padding;
  const y = padding;
  const cardWidth = width - padding * 2;
  context.save();
  context.shadowColor = "rgba(0,0,0,.32)";
  context.shadowBlur = 44;
  context.shadowOffsetY = 22;
  roundedRect(context, x, y, cardWidth, cardHeight, radius);
  context.fillStyle = theme.bg;
  context.fill();
  context.restore();
  context.save();
  roundedRect(context, x, y, cardWidth, cardHeight, radius);
  context.clip();
  if (titleBar) drawTitleBar(context, options, width, x, y);
  const codeY = y + chromeHeight + 38;
  context.font = `430 ${fontSize}px 'Geist Mono Variable', ui-monospace, monospace`;
  highlightedLines.forEach((tokens, index) => {
    const baseline = codeY + index * lineHeight;
    if (lineNumbers) {
      context.fillStyle = palette.muted;
      context.textAlign = "right";
      context.fillText(String(index + 1), x + 62, baseline);
      context.textAlign = "left";
    }
    let tokenX = x + (lineNumbers ? 94 : 46);
    tokens.forEach((token) => {
      context.fillStyle = token.color || theme.fg;
      context.fillText(token.content || " ", tokenX, baseline);
      tokenX += context.measureText(token.content).width;
    });
  });
  context.restore();
  const format = imageFormats.find((item) => item.value === formatValue)!;
  await new Promise<void>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${title.replace(/\.[^.]+$/, "") || "vignette"}.${format.extension}`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
        resolve();
      },
      format.mimeType,
      format.quality,
    );
  });
}
