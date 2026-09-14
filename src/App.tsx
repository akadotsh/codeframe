import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AppearancePanel } from "./components/appearance-panel";
import { EditorPreview } from "./components/editor-preview";
import { SaveControl } from "./components/save-control";
import { languageConfig, type Language } from "./config/editor";
import { aspectRatios, clampFrameWidth, getFrameMetrics, type ImageFormat } from "./config/export";
import type { SyntaxTheme } from "./config/themes";
import { resolveSnippetState, toSnippetSearch, type SnippetState } from "./config/snippet-state";
import { saveSnippetImage } from "./lib/save-snippet-image";
import { palettes } from "./palettes";
import { appStyles } from "./styles/app.stylex";

export function App() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const state = resolveSnippetState(search);
  const {
    aspectRatio,
    code,
    fontSize,
    frameWidth,
    imageFormat,
    language,
    lineNumbers,
    mode,
    padding,
    paletteIndex,
    radius,
    syntaxTheme,
    title,
    titleBar,
  } = state;
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const updateState = (patch: Partial<SnippetState>) => {
    void navigate({ search: toSnippetSearch({ ...state, ...patch }), replace: true });
  };

  const resetSnippet = () => {
    setPreviewTheme(null);
    setSaved(false);
    setCopied(false);
    void navigate({ search: {}, replace: true });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

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
    updateState({
      frameWidth: clampFrameWidth(
        startWidth + (event.clientX - startX) * pixelsToExport * direction,
      ),
    });
  };

  const stopResize = () => {
    resizeState.current.active = false;
    setResizing(false);
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 100 : 20;
    updateState({
      frameWidth: clampFrameWidth(frameWidth + (event.key === "ArrowRight" ? step : -step)),
    });
  };

  const chooseLanguage = (nextLanguage: Language) => {
    const previousSample = languageConfig[language].sample;
    updateState({
      language: nextLanguage,
      title: `hello-world.${languageConfig[nextLanguage].extension}`,
      code: code === previousSample ? languageConfig[nextLanguage].sample : code,
    });
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
    <main {...stylex.props(appStyles.shell, resizing && appStyles.resizing)}>
      <header {...stylex.props(appStyles.topbar)}>
        <a {...stylex.props(appStyles.brand)} href="/" aria-label="Vignette home">
          <span {...stylex.props(appStyles.brandMark)}>
            <Braces size={18} strokeWidth={2.2} />
          </span>
          <span>Vignette</span>
        </a>
        <div {...stylex.props(appStyles.topbarActions)}>
          <button
            {...stylex.props(appStyles.utilityButton)}
            type="button"
            disabled={Object.values(search).every((value) => value === undefined)}
            onClick={resetSnippet}
          >
            <RotateCcw {...stylex.props(appStyles.utilityIcon)} />
            <span {...stylex.props(appStyles.utilityLabel)}>Reset</span>
          </button>
          <button {...stylex.props(appStyles.utilityButton)} type="button" onClick={copyLink}>
            {copied ? (
              <Check {...stylex.props(appStyles.utilityIcon)} />
            ) : (
              <Copy {...stylex.props(appStyles.utilityIcon)} />
            )}
            <span {...stylex.props(appStyles.utilityLabel)} aria-live="polite">
              {copied ? "Copied" : "Copy link"}
            </span>
          </button>
          <SaveControl
            format={imageFormat}
            saved={saved}
            onFormatChange={(next) => updateState({ imageFormat: next })}
            onSave={saveImage}
          />
        </div>
      </header>

      <section {...stylex.props(appStyles.workspace)}>
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
          onCodeChange={(next) => updateState({ code: next })}
          onResizeEnd={stopResize}
          onResizeKeyDown={resizeWithKeyboard}
          onResizeMove={resizeFrame}
          onResizeStart={startResize}
          onTitleChange={(next) => updateState({ title: next })}
        />
        <AppearancePanel
          aspectRatio={aspectRatio}
          fontSize={fontSize}
          language={language}
          lineNumbers={lineNumbers}
          mode={mode}
          padding={padding}
          paletteIndex={paletteIndex}
          radius={radius}
          titleBar={titleBar}
          syntaxTheme={syntaxTheme}
          onAspectRatioChange={(next) => updateState({ aspectRatio: next })}
          onFontSizeChange={(next) => updateState({ fontSize: next })}
          onLanguageChange={chooseLanguage}
          onLineNumbersChange={(next) => updateState({ lineNumbers: next })}
          onModeChange={(next) => updateState({ mode: next })}
          onPaddingChange={(next) => updateState({ padding: next })}
          onPaletteChange={(next) => updateState({ paletteIndex: next })}
          onRadiusChange={(next) => updateState({ radius: next })}
          onTitleBarChange={(next) => updateState({ titleBar: next })}
          onThemeChange={(theme) => {
            updateState({ syntaxTheme: theme });
            setPreviewTheme(null);
          }}
          onThemePreview={setPreviewTheme}
        />
      </section>
    </main>
  );
}
