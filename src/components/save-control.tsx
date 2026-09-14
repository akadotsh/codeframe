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
    display: "flex",
    borderRadius: 999,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  },
  button: {
    height: { default: 36, "@media (max-width: 640px)": 34 },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundImage: "linear-gradient(180deg, #9b90e3, #887bd1)",
    color: "#121019",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), filter 160ms ease",
    cursor: "pointer",
    font: "inherit",
    filter: { "@media (hover: hover) and (pointer: fine)": "brightness(1)" },
    ":hover": { filter: "brightness(1.06)" },
    ":active": { transform: "scale(0.97)" },
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "rgba(178, 168, 238, 0.85)",
      outlineOffset: 3,
    },
    "@media (prefers-reduced-motion: reduce)": {
      transform: "none",
      transition: "opacity 160ms ease",
    },
  },
  saveButton: {
    minWidth: 104,
    paddingInline: { default: 14, "@media (max-width: 640px)": 11 },
    borderRadius: "999px 0 0 999px",
    borderRightWidth: 0,
  },
  menuTrigger: {
    width: 36,
    display: "grid",
    placeItems: "center",
    padding: 0,
    borderRadius: "0 999px 999px 0",
  },
  triggerIcon: { width: 15 },
  menu: {
    zIndex: 50,
    minWidth: 164,
    padding: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 15,
    backgroundColor: "rgba(25, 24, 32, 0.97)",
    color: "#f2f1f4",
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
    borderRadius: 10,
    color: "#c6c3cc",
    cursor: "default",
    fontSize: 12,
    outline: "none",
    ":focus": { backgroundColor: "rgba(143, 131, 223, 0.16)", color: "#fff" },
  },
  extension: {
    color: "#67646f",
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
