import { useEffect, useMemo, useState } from "react";
import { aspectRatios, getFrameMetrics } from "./config/export";
import {
  resolveSnippetState,
  validateSnippetSearch,
  type SnippetState,
} from "./config/snippet-state";
import { renderSnippetImage } from "./lib/save-snippet-image";
import { palettes } from "./palettes";

export function RenderPage() {
  const state = useMemo(readState, []);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    let disposed = false;
    let renderedUrl: string | undefined;
    const ratio = aspectRatios.find((option) => option.value === state.aspectRatio)!.ratio;
    const frameMetrics = getFrameMetrics({
      fontSize: state.fontSize,
      frameWidth: state.frameWidth,
      lineCount: state.code.split("\n").length,
      padding: state.padding,
      ratio,
      titleBar: state.titleBar,
    });

    void renderSnippetImage({
      code: state.code,
      fontSize: state.fontSize,
      format: state.imageFormat,
      frameMetrics,
      language: state.language,
      lineNumbers: state.lineNumbers,
      mode: state.mode,
      padding: state.padding,
      palette: palettes[state.paletteIndex],
      radius: state.radius,
      syntaxTheme: state.syntaxTheme,
      title: state.title,
      titleBar: state.titleBar,
    }).then((blob) => {
      if (disposed) return;
      renderedUrl = URL.createObjectURL(blob);
      setImageUrl(renderedUrl);
    });

    return () => {
      disposed = true;
      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
    };
  }, [state]);

  return imageUrl ? (
    <img id="rendered-image" src={imageUrl} data-render-ready="true" alt="Rendered code frame" />
  ) : null;
}

function readState(): SnippetState {
  const encoded = window.location.hash.slice(1).replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const value = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  return resolveSnippetState(validateSnippetSearch(value));
}
