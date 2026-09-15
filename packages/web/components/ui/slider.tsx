"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    touchAction: "none",
    userSelect: "none",
  },
  track: {
    position: "relative",
    height: 6,
    width: "100%",
    flexGrow: 1,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#2b2b33",
  },
  range: { position: "absolute", height: "100%", backgroundColor: "#9186d8" },
  thumb: {
    boxSizing: "border-box",
    width: 15,
    height: 15,
    display: "block",
    flexShrink: 0,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "#9186d8",
    borderRadius: "50%",
    backgroundColor: "#111016",
    boxShadow: "0 0 0 3px rgba(145, 134, 216, 0.08)",
    outline: "none",
    ":focus-visible": { boxShadow: "0 0 0 4px rgba(145, 134, 216, 0.24)" },
  },
});

function Slider({
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "className">) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      {...stylex.props(styles.root)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track {...stylex.props(styles.track)}>
        <SliderPrimitive.Range {...stylex.props(styles.range)} />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb {...stylex.props(styles.thumb)} key={index} />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
