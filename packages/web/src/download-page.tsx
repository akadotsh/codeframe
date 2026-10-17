import { useCallback, useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { aspectRatios, getFrameMetrics } from "./config/export";
import type { SnippetState } from "./config/snippet-state";
import { saveSnippetImage } from "./lib/save-snippet-image";
import { palettes } from "./palettes";
import { appStyles } from "./styles/app.stylex";

export function DownloadPage({ state }: { state: SnippetState }) {
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const download = useCallback(async () => {
    setFailed(false);
    const ratio = aspectRatios.find((option) => option.value === state.aspectRatio)!.ratio;
    try {
      await saveSnippetImage({
        code: state.code,
        fontSize: state.fontSize,
        format: state.imageFormat,
        frameMetrics: getFrameMetrics({
          fontSize: state.fontSize,
          frameWidth: state.frameWidth,
          lineCount: state.code.split("\n").length,
          padding: state.padding,
          ratio,
          titleBar: state.titleBar,
        }),
        language: state.language,
        lineNumbers: state.lineNumbers,
        mode: state.mode,
        padding: state.padding,
        palette: palettes[state.paletteIndex],
        radius: state.radius,
        syntaxTheme: state.syntaxTheme,
        title: state.title,
        titleBar: state.titleBar,
      });
    } catch {
      setFailed(true);
    }
  }, [state]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void download();
  }, [download]);

  return (
    <main {...stylex.props(appStyles.shell, styles.page)}>
      <h1 {...stylex.props(styles.title)}>Preparing your image</h1>
      <p {...stylex.props(styles.message)}>
        {failed ? "The automatic download did not start." : "Your download should begin shortly."}
      </p>
      <button {...stylex.props(appStyles.utilityButton)} type="button" onClick={download}>
        Download image
      </button>
    </main>
  );
}

const styles = stylex.create({
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    color: "#f4f3f6",
    textAlign: "center",
  },
  title: { margin: 0, fontSize: 24 },
  message: { marginBlock: "10px 22px", color: "#aaa6b2" },
});
