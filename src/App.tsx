import { useEffect, useMemo, useState } from "react";
import { Braces, Check, ChevronDown, Download, Monitor, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const extensions: Record<string, string> = { TypeScript: "ts", JavaScript: "js", Python: "py", CSS: "css", Rust: "rs", Go: "go" };
const languageIds: Record<string, "typescript" | "javascript" | "python" | "css" | "rust" | "go"> = { TypeScript: "typescript", JavaScript: "javascript", Python: "python", CSS: "css", Rust: "rust", Go: "go" };
const highlightTheme = "github-dark-default";
const loadHighlighter = () => import("./highlighter").then((module) => module.highlighterPromise);

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
}

export function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [showAllPalettes, setShowAllPalettes] = useState(false);
  const [language, setLanguage] = useState("TypeScript");
  const [code, setCode] = useState(samples.TypeScript);
  const [mode, setMode] = useState<"window" | "terminal">("window");
  const [padding, setPadding] = useState(64);
  const [radius, setRadius] = useState(22);
  const [fontSize, setFontSize] = useState(16);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [title, setTitle] = useState("hello-world.ts");
  const [downloaded, setDownloaded] = useState(false);
  const palette = palettes[paletteIndex];
  const visiblePalettes = showAllPalettes ? palettes : palettes.slice(0, 6);
  const lines = useMemo(() => code.split("\n"), [code]);

  const chooseLanguage = (next: string) => {
    const previousSample = samples[language];
    setLanguage(next);
    setTitle(`hello-world.${extensions[next]}`);
    if (code === previousSample) setCode(samples[next]);
  };

  const downloadPng = async () => {
    await document.fonts.ready;
    const highlighter = await loadHighlighter();
    const highlightedLines = highlighter.codeToTokens(code, {
      lang: languageIds[language],
      theme: highlightTheme,
    }).tokens;
    const scale = 2;
    const width = 1200;
    const lineHeight = fontSize * 1.65;
    const chromeHeight = 70;
    const cardHeight = Math.max(360, lines.length * lineHeight + chromeHeight + 76);
    const height = cardHeight + padding * 2;
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
      ctx.save(); ctx.translate(x, 0); ctx.rotate(-0.34); ctx.fillRect(0, -height / 2, 1, height * 2); ctx.restore();
    }
    const x = padding;
    const y = padding;
    const cardWidth = width - padding * 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.32)"; ctx.shadowBlur = 44; ctx.shadowOffsetY = 22;
    roundedRect(ctx, x, y, cardWidth, cardHeight, radius); ctx.fillStyle = palette.card; ctx.fill(); ctx.restore();
    ctx.save(); roundedRect(ctx, x, y, cardWidth, cardHeight, radius); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.025)"; ctx.fillRect(x, y, cardWidth, 70);
    if (mode === "window") {
      ["#ff5f57", "#febc2e", "#28c840"].forEach((color, index) => { ctx.beginPath(); ctx.arc(x + 34 + index * 25, y + 35, 7, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
    } else {
      ctx.fillStyle = palette.accent; ctx.font = "600 16px 'Geist Mono Variable', ui-monospace, monospace"; ctx.fillText(">_", x + 30, y + 41);
    }
    ctx.fillStyle = palette.muted; ctx.font = "500 15px 'Geist Mono Variable', ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.fillText(title, width / 2, y + 41); ctx.textAlign = "left";
    const codeY = y + chromeHeight + 38;
    ctx.font = `430 ${fontSize}px 'Geist Mono Variable', ui-monospace, monospace`;
    highlightedLines.forEach((tokens, index) => {
      const baseline = codeY + index * lineHeight;
      if (lineNumbers) { ctx.fillStyle = palette.muted; ctx.textAlign = "right"; ctx.fillText(String(index + 1), x + 62, baseline); ctx.textAlign = "left"; }
      let tokenX = x + (lineNumbers ? 94 : 46);
      tokens.forEach((token) => {
        ctx.fillStyle = token.color || palette.text;
        ctx.fillText(token.content || " ", tokenX, baseline);
        tokenX += ctx.measureText(token.content).width;
      });
    });
    ctx.restore();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = `${title.replace(/\.[^.]+$/, "") || "codeframe"}.png`; link.click(); URL.revokeObjectURL(link.href);
      setDownloaded(true); window.setTimeout(() => setDownloaded(false), 1800);
    }, "image/png");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Vignette home"><span className="brand-mark"><Braces size={18} strokeWidth={2.2} /></span><span>Vignette</span></a>
        <div className="topbar-actions"><Button className="download-button" onClick={downloadPng} aria-live="polite">{downloaded ? <Check /> : <Download />}{downloaded ? "Exported" : "Export PNG"}</Button></div>
      </header>

      <section className="workspace">
        <div className="canvas-area">
          <div className="canvas-toolbar" aria-label="Preview type"><div className="segmented"><button className={mode === "window" ? "active" : ""} onClick={() => setMode("window")}><Monitor /> Window</button><button className={mode === "terminal" ? "active" : ""} onClick={() => setMode("terminal")}><Terminal /> Terminal</button></div><span className="canvas-size">1200 × auto</span></div>
          <div className="preview-wrap">
            <div className="preview-stage" style={{ background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`, padding: `${padding}px` }}>
              <div className="grain" aria-hidden="true" />
              <div className="code-window" style={{ borderRadius: `${radius}px`, background: palette.card, color: palette.text }}>
                <div className="window-bar"><div className="window-side">{mode === "window" ? <span className="traffic"><i /><i /><i /></span> : <span className="terminal-glyph" style={{ color: palette.accent }}>&gt;_</span>}</div><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Snippet title" /><span className="language-pill">{language}</span></div>
                <div className="editor-shell" style={{ fontSize: `${fontSize}px` }}>{lineNumbers && <pre className="line-numbers" style={{ color: palette.muted }}>{lines.map((_, i) => `${i + 1}\n`)}</pre>}<SyntaxEditor code={code} language={language} accent={palette.accent} onChange={setCode} /></div>
              </div>
            </div>
          </div>
        </div>

        <aside className="settings-panel">
          <div className="settings-heading"><div><h1>Appearance</h1><p>Adjust the exported image.</p></div></div>
          <div className="setting-group"><label className="setting-label" htmlFor="language-select">Language</label><Select value={language} onValueChange={chooseLanguage}><SelectTrigger id="language-select" className="select-trigger"><SelectValue /></SelectTrigger><SelectContent>{Object.keys(samples).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="setting-group"><div className="setting-label"><span>Color palette</span><button className="palette-expand" aria-label={showAllPalettes ? "Show fewer color palettes" : "Show all color palettes"} aria-expanded={showAllPalettes} aria-controls="palette-grid" onClick={() => setShowAllPalettes((current) => !current)}><span>{palette.name}</span><ChevronDown /></button></div><div className="palette-grid" id="palette-grid">{visiblePalettes.map((item, index) => <button key={item.name} aria-label={`Use ${item.name} palette`} aria-pressed={paletteIndex === index} className={`${paletteIndex === index ? "palette active" : "palette"}${index >= 6 ? " extra" : ""}`} style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }} onClick={() => setPaletteIndex(index)}>{paletteIndex === index && <Check />}</button>)}</div></div>
          <RangeControl label="Padding" value={padding} min={24} max={96} unit="px" onChange={setPadding} />
          <RangeControl label="Corner radius" value={radius} min={0} max={36} unit="px" onChange={setRadius} />
          <RangeControl label="Font size" value={fontSize} min={13} max={22} unit="px" onChange={setFontSize} />
          <div className="switch-list"><label><span><b>Line numbers</b><small>Show a gutter beside the code</small></span><Switch checked={lineNumbers} onCheckedChange={setLineNumbers} /></label></div>
        </aside>
      </section>
    </main>
  );
}

function RangeControl({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (value: number) => void }) {
  return <div className="setting-group range-control"><div className="setting-label"><span>{label}</span><output>{value}{unit}</output></div><Slider value={[value]} min={min} max={max} step={1} onValueChange={(next) => onChange(next[0])} aria-label={label} /></div>;
}

function SyntaxEditor({ code, language, accent, onChange }: { code: string; language: string; accent: string; onChange: (code: string) => void }) {
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
      <div className="highlight-layer" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlighted }} />
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
