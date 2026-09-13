import { useEffect, useMemo, useState } from "react";
import { Braces, Check, ChevronDown, Monitor, Terminal } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { palettes } from "./palettes";

const samples: Record<string, string> = {
  TypeScript: `const createFrame = (code: string) => {\n  return {\n    title: "hello-world.ts",\n    theme: "graphite",\n    ready: true,\n  };\n};\n\nconsole.log(createFrame("Ship it."));`,
  JavaScript: `function greet(name) {\n  const message = \`Hello, \${name}!\`;\n  return message;\n}\n\nconsole.log(greet("world"));`,
  Python: `def create_frame(code: str):\n    return {\n        "title": "hello.py",\n        "ready": True,\n    }\n\nprint(create_frame("Ship it."))`,
  CSS: `.code-frame {\n  display: grid;\n  place-items: center;\n  padding: 4rem;\n  border-radius: 24px;\n}`,
  Rust: `fn main() {\n    let status = "ready";\n    println!("Frame is {status}");\n}`,
  Go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Frame is ready")\n}`,
};

const extensions: Record<string, string> = {
  TypeScript: "ts",
  JavaScript: "js",
  Python: "py",
  CSS: "css",
  Rust: "rs",
  Go: "go",
};
const languageIds: Record<string, "typescript" | "javascript" | "python" | "css" | "rust" | "go"> =
  {
    TypeScript: "typescript",
    JavaScript: "javascript",
    Python: "python",
    CSS: "css",
    Rust: "rust",
    Go: "go",
  };
const highlightTheme = "github-dark-default";
const loadHighlighter = () => import("./highlighter").then((module) => module.highlighterPromise);
const aspectRatios = [
  { value: "auto", label: "Auto", ratio: null },
  { value: "1:1", label: "Square · 1:1", ratio: 1 },
  { value: "4:3", label: "Classic · 4:3", ratio: 4 / 3 },
  { value: "16:9", label: "Widescreen · 16:9", ratio: 16 / 9 },
] as const;

type AspectRatio = (typeof aspectRatios)[number]["value"];
type PreviewMode = "window" | "terminal";
type ImageFormat = "png" | "webp" | "jpeg";

const imageFormats: Array<{
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

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
}

export function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [showAllPalettes, setShowAllPalettes] = useState(false);
  const [language, setLanguage] = useState("TypeScript");
  const [code, setCode] = useState(samples.TypeScript);
  const [mode, setMode] = useState<PreviewMode>("window");
  const [padding, setPadding] = useState(64);
  const [radius, setRadius] = useState(22);
  const [fontSize, setFontSize] = useState(16);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("auto");
  const [lineNumbers, setLineNumbers] = useState(true);
  const [titleBar, setTitleBar] = useState(true);
  const [title, setTitle] = useState("hello-world.ts");
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [saved, setSaved] = useState(false);
  const palette = palettes[paletteIndex];
  const visiblePalettes = showAllPalettes ? palettes : palettes.slice(0, 6);
  const lines = useMemo(() => code.split("\n"), [code]);
  const selectedAspectRatio = aspectRatios.find((option) => option.value === aspectRatio)!;
  const frameMetrics = useMemo(() => {
    const lineHeight = fontSize * 1.65;
    const chromeHeight = titleBar ? 70 : 0;
    const naturalCardHeight = Math.max(360, lines.length * lineHeight + chromeHeight + 76);
    const naturalHeight = Math.ceil(naturalCardHeight + padding * 2);
    const ratio = selectedAspectRatio.ratio;
    const width = ratio ? Math.max(1200, Math.ceil(naturalHeight * ratio)) : 1200;
    const height = ratio ? Math.ceil(width / ratio) : naturalHeight;

    return { width, height, cardHeight: height - padding * 2, lineHeight, chromeHeight };
  }, [fontSize, lines.length, padding, selectedAspectRatio.ratio, titleBar]);

  const chooseLanguage = (next: string) => {
    const previousSample = samples[language];
    setLanguage(next);
    setTitle(`hello-world.${extensions[next]}`);
    if (code === previousSample) setCode(samples[next]);
  };

  const saveImage = async (formatValue: ImageFormat) => {
    await document.fonts.ready;
    const highlighter = await loadHighlighter();
    const highlightedLines = highlighter.codeToTokens(code, {
      lang: languageIds[language],
      theme: highlightTheme,
    }).tokens;
    const scale = 2;
    const { width, height, cardHeight, lineHeight, chromeHeight } = frameMetrics;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, palette.colors[0]);
    gradient.addColorStop(1, palette.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    for (let x = -height; x < width; x += 54) {
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(-0.34);
      ctx.fillRect(0, -height / 2, 1, height * 2);
      ctx.restore();
    }
    const x = padding;
    const y = padding;
    const cardWidth = width - padding * 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.32)";
    ctx.shadowBlur = 44;
    ctx.shadowOffsetY = 22;
    roundedRect(ctx, x, y, cardWidth, cardHeight, radius);
    ctx.fillStyle = palette.card;
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(ctx, x, y, cardWidth, cardHeight, radius);
    ctx.clip();
    if (titleBar) {
      ctx.fillStyle = "rgba(255,255,255,.025)";
      ctx.fillRect(x, y, cardWidth, 70);
      if (mode === "window") {
        ["#ff5f57", "#febc2e", "#28c840"].forEach((color, index) => {
          ctx.beginPath();
          ctx.arc(x + 34 + index * 25, y + 35, 7, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      } else {
        ctx.fillStyle = palette.accent;
        ctx.font = "600 16px 'Geist Mono Variable', ui-monospace, monospace";
        ctx.fillText(">_", x + 30, y + 41);
      }
      ctx.fillStyle = palette.muted;
      ctx.font = "500 15px 'Geist Mono Variable', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(title, width / 2, y + 41);
      ctx.textAlign = "left";
    }
    const codeY = y + chromeHeight + 38;
    ctx.font = `430 ${fontSize}px 'Geist Mono Variable', ui-monospace, monospace`;
    highlightedLines.forEach((tokens, index) => {
      const baseline = codeY + index * lineHeight;
      if (lineNumbers) {
        ctx.fillStyle = palette.muted;
        ctx.textAlign = "right";
        ctx.fillText(String(index + 1), x + 62, baseline);
        ctx.textAlign = "left";
      }
      let tokenX = x + (lineNumbers ? 94 : 46);
      tokens.forEach((token) => {
        ctx.fillStyle = token.color || palette.text;
        ctx.fillText(token.content || " ", tokenX, baseline);
        tokenX += ctx.measureText(token.content).width;
      });
    });
    ctx.restore();
    const format = imageFormats.find((option) => option.value === formatValue)!;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/\.[^.]+$/, "") || "vignette"}.${format.extension}`;
        link.click();
        URL.revokeObjectURL(link.href);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      },
      format.mimeType,
      format.quality,
    );
  };

  return (
    <main className="app-shell">
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
              className="preview-stage"
              style={{
                background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
                padding: `${selectedAspectRatio.ratio ? Math.round(padding * 0.72) : padding}px`,
                aspectRatio: selectedAspectRatio.ratio ?? undefined,
              }}
            >
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
                {Object.keys(samples).map((item) => (
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

function SaveControl({
  format,
  saved,
  onFormatChange,
  onSave,
}: {
  format: ImageFormat;
  saved: boolean;
  onFormatChange: (format: ImageFormat) => void;
  onSave: (format: ImageFormat) => void;
}) {
  const selectedFormat = imageFormats.find((option) => option.value === format)!;

  return (
    <div className="save-control">
      <Button className="save-button" onClick={() => onSave(format)} aria-live="polite">
        {saved ? "Saved" : `Save ${selectedFormat.label}`}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="save-menu-trigger" aria-label="Choose image format">
            <ChevronDown />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="save-menu-content" align="end" sideOffset={6}>
            <DropdownMenu.RadioGroup
              value={format}
              onValueChange={(next) => onFormatChange(next as ImageFormat)}
            >
              {imageFormats.map((option) => (
                <DropdownMenu.RadioItem
                  className="save-menu-item"
                  key={option.value}
                  value={option.value}
                >
                  <span>{option.label}</span>
                  <small>.{option.extension}</small>
                  <DropdownMenu.ItemIndicator>
                    <Check />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function PreviewModeSelector({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <div className="segmented">
      <button className={mode === "window" ? "active" : ""} onClick={() => onChange("window")}>
        <Monitor /> Window
      </button>
      <button className={mode === "terminal" ? "active" : ""} onClick={() => onChange("terminal")}>
        <Terminal /> Terminal
      </button>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="setting-group range-control">
      <div className="setting-label">
        <span>{label}</span>
        <output>
          {value}
          {unit}
        </output>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(next) => onChange(next[0])}
        aria-label={label}
      />
    </div>
  );
}

function SyntaxEditor({
  code,
  language,
  accent,
  onChange,
}: {
  code: string;
  language: string;
  accent: string;
  onChange: (code: string) => void;
}) {
  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    let current = true;
    const timeout = window.setTimeout(async () => {
      const highlighter = await loadHighlighter();
      const html = highlighter.codeToHtml(code || " ", {
        lang: languageIds[language],
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
