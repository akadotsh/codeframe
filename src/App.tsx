import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Braces } from "lucide-react";
import { AppearancePanel } from "./components/appearance-panel";
import { EditorPreview } from "./components/editor-preview";
import { SaveControl } from "./components/save-control";
import { languageConfig, type Language } from "./config/editor";
import {
  aspectRatios,
  clampFrameWidth,
  getFrameMetrics,
  type AspectRatio,
  type ImageFormat,
  type PreviewMode,
} from "./config/export";
import type { SyntaxTheme } from "./config/themes";
import { saveSnippetImage } from "./lib/save-snippet-image";
import { palettes } from "./palettes";

export function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [code, setCode] = useState<string>(languageConfig.TypeScript.sample);
  const [mode, setMode] = useState<PreviewMode>("window");
  const [padding, setPadding] = useState(64);
  const [radius, setRadius] = useState(22);
  const [fontSize, setFontSize] = useState(16);
  const [frameWidth, setFrameWidth] = useState(1200);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("auto");
  const [lineNumbers, setLineNumbers] = useState(true);
  const [titleBar, setTitleBar] = useState(true);
  const [title, setTitle] = useState("hello-world.ts");
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [saved, setSaved] = useState(false);
  const [syntaxTheme, setSyntaxTheme] = useState<SyntaxTheme>("github-dark-default");
  const [previewTheme, setPreviewTheme] = useState<SyntaxTheme | null>(null);
  const [resizing, setResizing] = useState(false);
  const previewStageRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startWidth: 1200,
    pixelsToExport: 1,
    direction: 1,
  });
  const palette = palettes[paletteIndex];
  const lines = useMemo(() => code.split("\n"), [code]);
  const selectedAspectRatio = aspectRatios.find((option) => option.value === aspectRatio)!;
  const frameMetrics = useMemo(
    () =>
      getFrameMetrics({
        fontSize,
        frameWidth,
        lineCount: lines.length,
        padding,
        ratio: selectedAspectRatio.ratio,
        titleBar,
      }),
    [fontSize, frameWidth, lines.length, padding, selectedAspectRatio.ratio, titleBar],
  );

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>, direction: 1 | -1) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const previewWidth = previewStageRef.current?.getBoundingClientRect().width ?? frameWidth;
    resizeState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: frameWidth,
      pixelsToExport: frameWidth / previewWidth,
      direction,
    };
    setResizing(true);
  };

  const resizeFrame = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      !resizeState.current.active ||
      resizeState.current.pointerId !== event.pointerId ||
      event.buttons !== 1
    )
      return;
    const { startX, startWidth, pixelsToExport, direction } = resizeState.current;
    setFrameWidth(
      clampFrameWidth(startWidth + (event.clientX - startX) * pixelsToExport * direction),
    );
  };

  const stopResize = () => {
    resizeState.current.active = false;
    setResizing(false);
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 100 : 20;
    setFrameWidth((current) =>
      clampFrameWidth(current + (event.key === "ArrowRight" ? step : -step)),
    );
  };

  const chooseLanguage = (next: string) => {
    const nextLanguage = next as Language;
    const previousSample = languageConfig[language].sample;
    setLanguage(nextLanguage);
    setTitle(`hello-world.${languageConfig[nextLanguage].extension}`);
    if (code === previousSample) setCode(languageConfig[nextLanguage].sample);
  };

  const saveImage = async (formatValue: ImageFormat) => {
    await saveSnippetImage({
      code,
      fontSize,
      format: formatValue,
      frameMetrics,
      language,
      lineNumbers,
      mode,
      padding,
      palette,
      radius,
      title,
      titleBar,
      syntaxTheme,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="app-shell" data-resizing={resizing}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Vignette home">
          <span className="brand-mark">
            <Braces size={18} strokeWidth={2.2} />
          </span>
          <span>Vignette</span>
        </a>
        <div className="topbar-actions">
          <SaveControl
            format={imageFormat}
            saved={saved}
            onFormatChange={setImageFormat}
            onSave={saveImage}
          />
        </div>
      </header>

      <section className="workspace">
        <EditorPreview
          aspectRatio={selectedAspectRatio.ratio}
          code={code}
          fontSize={fontSize}
          frameMetrics={frameMetrics}
          language={language}
          lineNumbers={lineNumbers}
          mode={mode}
          padding={padding}
          palette={palette}
          previewStageRef={previewStageRef}
          radius={radius}
          resizing={resizing}
          title={title}
          titleBar={titleBar}
          syntaxTheme={previewTheme ?? syntaxTheme}
          onCodeChange={setCode}
          onModeChange={setMode}
          onResizeEnd={stopResize}
          onResizeKeyDown={resizeWithKeyboard}
          onResizeMove={resizeFrame}
          onResizeStart={startResize}
          onTitleChange={setTitle}
        />
        <AppearancePanel
          aspectRatio={aspectRatio}
          fontSize={fontSize}
          language={language}
          lineNumbers={lineNumbers}
          padding={padding}
          paletteIndex={paletteIndex}
          radius={radius}
          titleBar={titleBar}
          syntaxTheme={syntaxTheme}
          onAspectRatioChange={setAspectRatio}
          onFontSizeChange={setFontSize}
          onLanguageChange={chooseLanguage}
          onLineNumbersChange={setLineNumbers}
          onPaddingChange={setPadding}
          onPaletteChange={setPaletteIndex}
          onRadiusChange={setRadius}
          onTitleBarChange={setTitleBar}
          onThemeChange={(theme) => {
            setSyntaxTheme(theme);
            setPreviewTheme(null);
          }}
          onThemePreview={setPreviewTheme}
        />
      </section>
    </main>
  );
}
