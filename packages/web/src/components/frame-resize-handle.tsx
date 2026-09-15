import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { maxFrameWidth, minFrameWidth } from "../config/export";
import { resizeHandleStyles } from "../styles/preview.stylex";

export function FrameResizeHandle({
  side,
  width,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onKeyDown,
}: {
  side: "left" | "right";
  width: number;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerEnd: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      {...stylex.props(resizeHandleStyles.handle, resizeHandleStyles[side])}
      aria-label={`Resize frame from ${side} edge`}
      aria-valuemin={minFrameWidth}
      aria-valuemax={maxFrameWidth}
      aria-valuenow={width}
      role="separator"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    />
  );
}
