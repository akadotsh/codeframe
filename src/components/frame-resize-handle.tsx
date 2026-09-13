import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { maxFrameWidth, minFrameWidth } from "../config/export";

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
      className={`frame-resize-handle ${side}`}
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
