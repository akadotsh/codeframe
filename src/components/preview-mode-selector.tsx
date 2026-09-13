import { Monitor, Terminal } from "lucide-react";
import type { PreviewMode } from "../config/export";

export function PreviewModeSelector({
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
