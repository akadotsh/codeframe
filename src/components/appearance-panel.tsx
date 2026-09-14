import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "../config/editor";
import { aspectRatios, type AspectRatio, type PreviewMode } from "../config/export";
import { syntaxThemes, type SyntaxTheme } from "../config/themes";
import { palettes } from "../palettes";
import { appearanceStyles } from "../styles/appearance.stylex";
import { RangeControl } from "./range-control";
import { SearchableSelect } from "./searchable-select";

const languageOptions = languages.map((language) => ({ label: language, value: language }));

type AppearancePanelProps = {
  aspectRatio: AspectRatio;
  fontSize: number;
  language: Language;
  lineNumbers: boolean;
  mode: PreviewMode;
  padding: number;
  paletteIndex: number;
  radius: number;
  titleBar: boolean;
  syntaxTheme: SyntaxTheme;
  onAspectRatioChange: (value: AspectRatio) => void;
  onFontSizeChange: (value: number) => void;
  onLanguageChange: (value: Language) => void;
  onLineNumbersChange: (value: boolean) => void;
  onModeChange: (value: PreviewMode) => void;
  onPaddingChange: (value: number) => void;
  onPaletteChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onTitleBarChange: (value: boolean) => void;
  onThemeChange: (value: SyntaxTheme) => void;
  onThemePreview: (value: SyntaxTheme | null) => void;
};

export function AppearancePanel(props: AppearancePanelProps) {
  const [showAllPalettes, setShowAllPalettes] = useState(false);
  const palette = palettes[props.paletteIndex];
  const visiblePalettes = showAllPalettes ? palettes : palettes.slice(0, 6);

  return (
    <aside {...stylex.props(appearanceStyles.panel)}>
      <div {...stylex.props(appearanceStyles.heading, appearanceStyles.fullWidth)}>
        <div>
          <h1 {...stylex.props(appearanceStyles.headingTitle)}>Appearance</h1>
          <p {...stylex.props(appearanceStyles.headingText)}>Adjust the exported image.</p>
        </div>
      </div>
      <div {...stylex.props(appearanceStyles.group)}>
        <label {...stylex.props(appearanceStyles.label)} htmlFor="language-select">
          Language
        </label>
        <SearchableSelect
          id="language-select"
          options={languageOptions}
          searchLabel="Search programming languages"
          searchPlaceholder="Search languages…"
          value={props.language}
          onChange={props.onLanguageChange}
        />
      </div>
      <div {...stylex.props(appearanceStyles.group)}>
        <label {...stylex.props(appearanceStyles.label)} htmlFor="theme-select">
          Syntax
        </label>
        <SearchableSelect
          id="theme-select"
          options={syntaxThemes}
          searchLabel="Search syntax themes"
          searchPlaceholder="Search themes…"
          value={props.syntaxTheme}
          onChange={props.onThemeChange}
          onPreview={props.onThemePreview}
        />
      </div>
      <div {...stylex.props(appearanceStyles.group)}>
        <div {...stylex.props(appearanceStyles.label)}>
          <span>Color palette</span>
          <button
            {...stylex.props(appearanceStyles.paletteExpand)}
            aria-label={showAllPalettes ? "Show fewer color palettes" : "Show all color palettes"}
            aria-expanded={showAllPalettes}
            aria-controls="palette-grid"
            onClick={() => setShowAllPalettes((current) => !current)}
          >
            <span {...stylex.props(appearanceStyles.labelValue)}>{palette.name}</span>
            <ChevronDown
              {...stylex.props(
                appearanceStyles.paletteExpandIcon,
                showAllPalettes && appearanceStyles.paletteExpandIconOpen,
              )}
            />
          </button>
        </div>
        <div {...stylex.props(appearanceStyles.paletteGrid)} id="palette-grid">
          {visiblePalettes.map((item, index) => (
            <button
              key={item.name}
              aria-label={`Use ${item.name} palette`}
              aria-pressed={props.paletteIndex === index}
              {...stylex.props(
                appearanceStyles.palette,
                props.paletteIndex === index && appearanceStyles.paletteActive,
                index >= 6 && appearanceStyles.paletteExtra,
              )}
              style={{
                background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`,
              }}
              onClick={() => props.onPaletteChange(index)}
            >
              {props.paletteIndex === index && (
                <Check {...stylex.props(appearanceStyles.paletteCheck)} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div {...stylex.props(appearanceStyles.group)}>
        <div {...stylex.props(appearanceStyles.label)}>
          <span>Aspect ratio</span>
        </div>
        <div {...stylex.props(appearanceStyles.ratioGrid)}>
          {aspectRatios.map((option) => (
            <button
              key={option.value}
              {...stylex.props(
                appearanceStyles.ratio,
                props.aspectRatio === option.value && appearanceStyles.ratioActive,
              )}
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
      <div {...stylex.props(appearanceStyles.switchList, appearanceStyles.fullWidth)}>
        <label {...stylex.props(appearanceStyles.switchItem)}>
          <span {...stylex.props(appearanceStyles.switchCopy)}>
            <b {...stylex.props(appearanceStyles.switchTitle)}>Line numbers</b>
            <small {...stylex.props(appearanceStyles.switchText)}>
              Show a gutter beside the code
            </small>
          </span>
          <Switch checked={props.lineNumbers} onCheckedChange={props.onLineNumbersChange} />
        </label>
        <label {...stylex.props(appearanceStyles.switchItem)}>
          <span {...stylex.props(appearanceStyles.switchCopy)}>
            <b {...stylex.props(appearanceStyles.switchTitle)}>Title bar</b>
            <small {...stylex.props(appearanceStyles.switchText)}>
              Show filename and window controls
            </small>
          </span>
          <Switch checked={props.titleBar} onCheckedChange={props.onTitleBarChange} />
        </label>
        <label {...stylex.props(appearanceStyles.switchItem, appearanceStyles.switchItemLast)}>
          <span {...stylex.props(appearanceStyles.switchCopy)}>
            <b {...stylex.props(appearanceStyles.switchTitle)}>Terminal frame</b>
            <small {...stylex.props(appearanceStyles.switchText)}>
              Use terminal-style window controls
            </small>
          </span>
          <Switch
            checked={props.mode === "terminal"}
            onCheckedChange={(checked) => props.onModeChange(checked ? "terminal" : "window")}
          />
        </label>
      </div>
    </aside>
  );
}
