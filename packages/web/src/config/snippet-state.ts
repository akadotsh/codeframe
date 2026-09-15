import { languages, languageConfig, type Language } from "./editor";
import {
  aspectRatios,
  imageFormats,
  maxFrameWidth,
  minFrameWidth,
  type AspectRatio,
  type ImageFormat,
  type PreviewMode,
} from "./export";
import { syntaxThemes, type SyntaxTheme } from "./themes";
import { palettes } from "../palettes";

export type SnippetState = {
  aspectRatio: AspectRatio;
  code: string;
  fontSize: number;
  frameWidth: number;
  imageFormat: ImageFormat;
  language: Language;
  lineNumbers: boolean;
  mode: PreviewMode;
  padding: number;
  paletteIndex: number;
  radius: number;
  syntaxTheme: SyntaxTheme;
  title: string;
  titleBar: boolean;
};

export type SnippetSearch = Partial<SnippetState>;

export const defaultSnippetState: SnippetState = {
  aspectRatio: "auto",
  code: languageConfig.TypeScript.sample,
  fontSize: 16,
  frameWidth: 1200,
  imageFormat: "png",
  language: "TypeScript",
  lineNumbers: true,
  mode: "window",
  padding: 64,
  paletteIndex: 0,
  radius: 22,
  syntaxTheme: "github-dark-default",
  title: "hello-world.ts",
  titleBar: true,
};

const previewModes: PreviewMode[] = ["window", "terminal"];

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown, min: number, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? Math.round(number) : undefined;
}

function getBoolean(value: unknown) {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}

function getOption<Value extends string>(value: unknown, options: readonly Value[]) {
  return options.includes(value as Value) ? (value as Value) : undefined;
}

export function validateSnippetSearch(search: Record<string, unknown>): SnippetSearch {
  return {
    aspectRatio: getOption(
      search.aspectRatio,
      aspectRatios.map((option) => option.value),
    ),
    code: getString(search.code),
    fontSize: getNumber(search.fontSize, 13, 22),
    frameWidth: getNumber(search.frameWidth, minFrameWidth, maxFrameWidth),
    imageFormat: getOption(
      search.imageFormat,
      imageFormats.map((option) => option.value),
    ),
    language: getOption(search.language, languages),
    lineNumbers: getBoolean(search.lineNumbers),
    mode: getOption(search.mode, previewModes),
    padding: getNumber(search.padding, 24, 96),
    paletteIndex: getNumber(search.paletteIndex, 0, palettes.length - 1),
    radius: getNumber(search.radius, 0, 36),
    syntaxTheme: getOption(
      search.syntaxTheme,
      syntaxThemes.map((theme) => theme.value),
    ),
    title: getString(search.title),
    titleBar: getBoolean(search.titleBar),
  };
}

export function resolveSnippetState(search: SnippetSearch): SnippetState {
  const definedSearch = Object.fromEntries(
    Object.entries(search).filter((entry) => entry[1] !== undefined),
  ) as SnippetSearch;
  return { ...defaultSnippetState, ...definedSearch };
}

export function toSnippetSearch(state: SnippetState): SnippetSearch {
  return Object.fromEntries(
    (Object.keys(defaultSnippetState) as Array<keyof SnippetState>)
      .filter((key) => state[key] !== defaultSnippetState[key])
      .map((key) => [key, state[key]]),
  ) as SnippetSearch;
}
