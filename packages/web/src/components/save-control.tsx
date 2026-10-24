import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import * as stylex from "@stylexjs/stylex";
import { imageFormats, type ImageFormat } from "../config/export";

const menuIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(-3px) scale(0.98)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

const styles = stylex.create({
  control: {
    boxSizing: "border-box",
    width: 112,
    height: 32,
    display: "flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#c5c7b8",
    borderRadius: 5,
    backgroundColor: "#dcded2",
  },
  button: {
    boxSizing: "border-box",
    appearance: "none",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "#171814",
    transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), filter 160ms ease",
    cursor: "pointer",
    font: "inherit",
    filter: { "@media (hover: hover) and (pointer: fine)": "brightness(1)" },
    ":hover": { filter: "brightness(1.06)" },
    ":active": { transform: "scale(0.97)" },
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "#aebc91",
      outlineOffset: 3,
    },
    "@media (prefers-reduced-motion: reduce)": {
      transform: "none",
      transition: "opacity 160ms ease",
    },
  },
  saveButton: {
    flex: 1,
    paddingInline: 8,
    fontSize: 11,
  },
  menuTrigger: {
    width: 28,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    padding: 0,
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: "rgba(23, 24, 20, 0.18)",
  },
  triggerIcon: { width: 15 },
  menu: {
    zIndex: 50,
    minWidth: 164,
    padding: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#3d4239",
    borderRadius: 6,
    backgroundColor: "#1d201c",
    color: "#f0eee7",
    boxShadow: "0 18px 48px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.045)",
    backdropFilter: "blur(18px)",
    animationName: menuIn,
    animationDuration: "150ms",
    animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  menuItem: {
    height: 34,
    display: "grid",
    gridTemplateColumns: "1fr auto 16px",
    alignItems: "center",
    gap: 10,
    paddingInline: 8,
    borderRadius: 4,
    color: "#d0cdc3",
    cursor: "default",
    fontSize: 12,
    outline: "none",
    ":focus": { backgroundColor: "#30362a", color: "#f3f1e9" },
  },
  extension: {
    color: "#a6a398",
    fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
    fontSize: 10,
  },
  check: { width: 14 },
});

export function SaveControl({
  format,
  saved,
  onFormatChange,
  onSave,
}: {
  format: ImageFormat;
  saved: boolean;
  onFormatChange: (format: ImageFormat) => void;
  onSave: (format: ImageFormat) => void;
}) {
  const selectedFormat = imageFormats.find((option) => option.value === format)!;

  return (
    <div {...stylex.props(styles.control)}>
      <button
        {...stylex.props(styles.button, styles.saveButton)}
        onClick={() => onSave(format)}
        aria-live="polite"
      >
        {saved ? "Saved" : `Save ${selectedFormat.label}`}
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            {...stylex.props(styles.button, styles.menuTrigger)}
            aria-label="Choose image format"
          >
            <ChevronDown {...stylex.props(styles.triggerIcon)} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content {...stylex.props(styles.menu)} align="end" sideOffset={6}>
            <DropdownMenu.RadioGroup
              value={format}
              onValueChange={(next) => onFormatChange(next as ImageFormat)}
            >
              {imageFormats.map((option) => (
                <DropdownMenu.RadioItem
                  {...stylex.props(styles.menuItem)}
                  key={option.value}
                  value={option.value}
                >
                  <span>{option.label}</span>
                  <small {...stylex.props(styles.extension)}>.{option.extension}</small>
                  <DropdownMenu.ItemIndicator>
                    <Check {...stylex.props(styles.check)} />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
