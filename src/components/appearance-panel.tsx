import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "../config/editor";
import { aspectRatios, type AspectRatio } from "../config/export";
import { palettes } from "../palettes";
import { RangeControl } from "./range-control";

type AppearancePanelProps = {
  aspectRatio: AspectRatio;
  fontSize: number;
  language: Language;
  lineNumbers: boolean;
  padding: number;
  paletteIndex: number;
  radius: number;
  titleBar: boolean;
  onAspectRatioChange: (value: AspectRatio) => void;
  onFontSizeChange: (value: number) => void;
  onLanguageChange: (value: string) => void;
  onLineNumbersChange: (value: boolean) => void;
  onPaddingChange: (value: number) => void;
  onPaletteChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onTitleBarChange: (value: boolean) => void;
};

export function AppearancePanel(props: AppearancePanelProps) {
  const [showAllPalettes, setShowAllPalettes] = useState(false);
  const palette = palettes[props.paletteIndex];
  const visiblePalettes = showAllPalettes ? palettes : palettes.slice(0, 6);

  return (
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
        <Select value={props.language} onValueChange={props.onLanguageChange}>
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
            aria-label={showAllPalettes ? "Show fewer color palettes" : "Show all color palettes"}
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
              aria-pressed={props.paletteIndex === index}
              className={`${props.paletteIndex === index ? "palette active" : "palette"}${index >= 6 ? " extra" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`,
              }}
              onClick={() => props.onPaletteChange(index)}
            >
              {props.paletteIndex === index && <Check />}
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
              className={`aspect-ratio-option${props.aspectRatio === option.value ? " active" : ""}`}
              aria-label={option.label}
              aria-pressed={props.aspectRatio === option.value}
              onClick={() => props.onAspectRatioChange(option.value)}
            >
              <span>{option.value === "auto" ? "Auto" : option.value}</span>
            </button>
          ))}
        </div>
      </div>
      <RangeControl
        label="Padding"
        value={props.padding}
        min={24}
        max={96}
        unit="px"
        onChange={props.onPaddingChange}
      />
      <RangeControl
        label="Corner radius"
        value={props.radius}
        min={0}
        max={36}
        unit="px"
        onChange={props.onRadiusChange}
      />
      <RangeControl
        label="Font size"
        value={props.fontSize}
        min={13}
        max={22}
        unit="px"
        onChange={props.onFontSizeChange}
      />
      <div className="switch-list">
        <label>
          <span>
            <b>Line numbers</b>
            <small>Show a gutter beside the code</small>
          </span>
          <Switch checked={props.lineNumbers} onCheckedChange={props.onLineNumbersChange} />
        </label>
        <label>
          <span>
            <b>Title bar</b>
            <small>Show filename and window controls</small>
          </span>
          <Switch checked={props.titleBar} onCheckedChange={props.onTitleBarChange} />
        </label>
      </div>
    </aside>
  );
}
