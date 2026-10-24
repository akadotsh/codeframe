"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    appearance: "none",
    width: 32,
    height: 18,
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 999,
    padding: 0,
    backgroundColor: "#343832",
    cursor: "pointer",
    outline: "none",
    transition: "background-color 150ms ease",
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "#aebc91",
      outlineOffset: 3,
    },
    ":disabled": { cursor: "not-allowed", opacity: 0.5 },
  },
  checked: { backgroundColor: "#8e9b76" },
  small: { width: 24, height: 14 },
  thumb: {
    boxSizing: "border-box",
    width: 16,
    height: 16,
    display: "block",
    borderRadius: 999,
    backgroundColor: "#d5d2c8",
    pointerEvents: "none",
    transform: "translateX(0)",
    transition: "transform 150ms cubic-bezier(0.23, 1, 0.32, 1)",
  },
  thumbChecked: { backgroundColor: "#191c18", transform: "translateX(14px)" },
  thumbSmall: { width: 12, height: 12 },
  thumbSmallChecked: { transform: "translateX(10px)" },
});

function Switch({
  size = "default",
  checked,
  ...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "className"> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      {...stylex.props(styles.root, checked && styles.checked, size === "sm" && styles.small)}
      checked={checked}
      {...props}
    >
      <SwitchPrimitive.Thumb
        {...stylex.props(
          styles.thumb,
          checked && styles.thumbChecked,
          size === "sm" && styles.thumbSmall,
          checked && size === "sm" && styles.thumbSmallChecked,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
