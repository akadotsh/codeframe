import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Braces, Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FrameResizeHandle } from "./components/frame-resize-handle";
import { PreviewModeSelector } from "./components/preview-mode-selector";
import { RangeControl } from "./components/range-control";
import { SaveControl } from "./components/save-control";
import { SyntaxEditor } from "./components/syntax-editor";
import { languageConfig, languages, type Language } from "./config/editor";
import {
  aspectRatios,
  clampFrameWidth,
  getFrameMetrics,
  type AspectRatio,
  type ImageFormat,
  type PreviewMode,
} from "./config/export";
import { saveSnippetImage } from "./lib/save-snippet-image";
import { palettes } from "./palettes";

export function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [showAllPalettes, setShowAllPalettes] = useState(false);
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
  const visiblePalettes = showAllPalettes ? palettes : palettes.slice(0, 6);
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
        <div className="canvas-area">
          <div className="canvas-toolbar" aria-label="Preview type">
            <PreviewModeSelector mode={mode} onChange={setMode} />
            <span className="canvas-size">
              {frameMetrics.width} × {frameMetrics.height}
            </span>
          </div>
          <div className="preview-wrap">
            <div
              ref={previewStageRef}
              className="preview-stage"
              style={{
                width: `${Math.round(frameMetrics.width * 0.72)}px`,
                background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
                padding: `${selectedAspectRatio.ratio ? Math.round(padding * 0.72) : padding}px`,
                aspectRatio: selectedAspectRatio.ratio ?? undefined,
              }}
            >
              <FrameResizeHandle
                side="left"
                width={frameMetrics.width}
                onPointerDown={(event) => startResize(event, -1)}
                onPointerMove={resizeFrame}
                onPointerEnd={stopResize}
                onKeyDown={resizeWithKeyboard}
              />
              <FrameResizeHandle
                side="right"
                width={frameMetrics.width}
                onPointerDown={(event) => startResize(event, 1)}
                onPointerMove={resizeFrame}
                onPointerEnd={stopResize}
                onKeyDown={resizeWithKeyboard}
              />
              <output
                className="frame-width-indicator"
                data-visible={resizing}
                aria-hidden={!resizing}
              >
                {frameMetrics.width}px
              </output>
              <div className="grain" aria-hidden="true" />
              <div
                className="code-window"
                style={{
                  borderRadius: `${radius}px`,
                  background: palette.card,
                  color: palette.text,
                  height: selectedAspectRatio.ratio ? "100%" : undefined,
                }}
              >
                <div
                  className={`window-bar-reveal${titleBar ? "" : " hidden"}`}
                  aria-hidden={!titleBar}
                >
                  <div className="window-bar">
                    <div className="window-side">
                      {mode === "window" ? (
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
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      aria-label="Snippet title"
                      tabIndex={titleBar ? 0 : -1}
                    />
                    <span className="language-pill">{language}</span>
                  </div>
                </div>
                <div className="editor-shell" style={{ fontSize: `${fontSize}px` }}>
                  {lineNumbers && (
                    <pre className="line-numbers" style={{ color: palette.muted }}>
                      {lines.map((_, i) => `${i + 1}\n`)}
                    </pre>
                  )}
                  <SyntaxEditor
                    code={code}
                    language={language}
                    accent={palette.accent}
                    onChange={setCode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="settings-panel">
          <div className="settings-heading">
            <div>
              <h1>Appearance</h1>
              <p>Adjust the exported image.</p>
            </div>
          </div>
          <div className="setting-group">
            <label className="setting-label" htmlFor="language-select">
              Language
            </label>
            <Select value={language} onValueChange={chooseLanguage}>
              <SelectTrigger id="language-select" className="select-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="setting-group">
            <div className="setting-label">
              <span>Color palette</span>
              <button
                className="palette-expand"
                aria-label={
                  showAllPalettes ? "Show fewer color palettes" : "Show all color palettes"
                }
                aria-expanded={showAllPalettes}
                aria-controls="palette-grid"
                onClick={() => setShowAllPalettes((current) => !current)}
              >
                <span>{palette.name}</span>
                <ChevronDown />
              </button>
            </div>
            <div className="palette-grid" id="palette-grid">
              {visiblePalettes.map((item, index) => (
                <button
                  key={item.name}
                  aria-label={`Use ${item.name} palette`}
                  aria-pressed={paletteIndex === index}
                  className={`${paletteIndex === index ? "palette active" : "palette"}${index >= 6 ? " extra" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`,
                  }}
                  onClick={() => setPaletteIndex(index)}
                >
                  {paletteIndex === index && <Check />}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-group">
            <div className="setting-label">
              <span>Aspect ratio</span>
            </div>
            <div className="aspect-ratio-grid">
              {aspectRatios.map((option) => (
                <button
                  key={option.value}
                  className={`aspect-ratio-option${aspectRatio === option.value ? " active" : ""}`}
                  aria-label={option.label}
                  aria-pressed={aspectRatio === option.value}
                  onClick={() => setAspectRatio(option.value)}
                >
                  <span>{option.value === "auto" ? "Auto" : option.value}</span>
                </button>
              ))}
            </div>
          </div>
          <RangeControl
            label="Padding"
            value={padding}
            min={24}
            max={96}
            unit="px"
            onChange={setPadding}
          />
          <RangeControl
            label="Corner radius"
            value={radius}
            min={0}
            max={36}
            unit="px"
            onChange={setRadius}
          />
          <RangeControl
            label="Font size"
            value={fontSize}
            min={13}
            max={22}
            unit="px"
            onChange={setFontSize}
          />
          <div className="switch-list">
            <label>
              <span>
                <b>Line numbers</b>
                <small>Show a gutter beside the code</small>
              </span>
              <Switch checked={lineNumbers} onCheckedChange={setLineNumbers} />
            </label>
            <label>
              <span>
                <b>Title bar</b>
                <small>Show filename and window controls</small>
              </span>
              <Switch checked={titleBar} onCheckedChange={setTitleBar} />
            </label>
          </div>
        </aside>
      </section>
    </main>
  );
}
