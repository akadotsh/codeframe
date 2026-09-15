export const aspectRatios = [
  { value: "auto", label: "Auto", ratio: null },
  { value: "1:1", label: "Square · 1:1", ratio: 1 },
  { value: "4:3", label: "Classic · 4:3", ratio: 4 / 3 },
  { value: "16:9", label: "Widescreen · 16:9", ratio: 16 / 9 },
] as const;

export type AspectRatio = (typeof aspectRatios)[number]["value"];
export type PreviewMode = "window" | "terminal";
export type ImageFormat = "png" | "webp" | "jpeg";

export const imageFormats: Array<{
  value: ImageFormat;
  label: string;
  mimeType: string;
  extension: string;
  quality?: number;
}> = [
  { value: "png", label: "PNG", mimeType: "image/png", extension: "png" },
  { value: "webp", label: "WebP", mimeType: "image/webp", extension: "webp", quality: 0.92 },
  { value: "jpeg", label: "JPEG", mimeType: "image/jpeg", extension: "jpg", quality: 0.92 },
];

export const minFrameWidth = 720;
export const maxFrameWidth = 1600;

export function clampFrameWidth(width: number) {
  return Math.min(maxFrameWidth, Math.max(minFrameWidth, Math.round(width / 20) * 20));
}

export function getFrameMetrics({
  fontSize,
  frameWidth,
  lineCount,
  padding,
  ratio,
  titleBar,
}: {
  fontSize: number;
  frameWidth: number;
  lineCount: number;
  padding: number;
  ratio: number | null;
  titleBar: boolean;
}) {
  const lineHeight = fontSize * 1.65;
  const chromeHeight = titleBar ? 70 : 0;
  const naturalCardHeight = Math.max(360, lineCount * lineHeight + chromeHeight + 76);
  const naturalHeight = Math.ceil(naturalCardHeight + padding * 2);
  const width = ratio ? Math.max(frameWidth, Math.ceil(naturalHeight * ratio)) : frameWidth;
  const height = ratio ? Math.ceil(width / ratio) : naturalHeight;

  return { width, height, cardHeight: height - padding * 2, lineHeight, chromeHeight };
}

export type FrameMetrics = ReturnType<typeof getFrameMetrics>;
