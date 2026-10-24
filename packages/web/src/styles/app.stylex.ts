import * as stylex from "@stylexjs/stylex";

export const appStyles = stylex.create({
  shell: {
    minHeight: "100vh",
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    backgroundColor: "#101012",
    backgroundImage:
      "linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
  },
  resizing: {
    cursor: "ew-resize",
    userSelect: "none",
  },
  topbar: {
    boxSizing: "border-box",
    height: {
      default: 68,
      "@media (max-width: 640px)": 62,
    },
    paddingInline: {
      default: 24,
      "@media (max-width: 640px)": 15,
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    position: "relative",
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    color: "#f0eee7",
    textDecoration: "none",
    fontSize: 17,
    fontWeight: 620,
    letterSpacing: "-0.035em",
  },
  brandMark: {
    width: 19,
    height: 19,
    marginRight: 8,
    color: "#aebc91",
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  utilityButton: {
    boxSizing: "border-box",
    height: { default: 36, "@media (max-width: 640px)": 34 },
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingInline: { default: 12, "@media (max-width: 640px)": 9 },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#444a40",
    borderRadius: 5,
    color: "#dedfd6",
    backgroundColor: "#242820",
    cursor: "pointer",
    font: "inherit",
    fontSize: 12,
    fontWeight: 520,
    transition:
      "background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms ease",
    ":hover": {
      backgroundColor: "#30362a",
      borderColor: "#626b52",
      color: "#f2f3eb",
    },
    ":active": { transform: "scale(0.97)" },
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "#aebc91",
      outlineOffset: 3,
    },
    ":disabled": { cursor: "default", opacity: 0.38 },
    "@media (prefers-reduced-motion: reduce)": {
      transform: "none",
      transition: "opacity 160ms ease",
    },
  },
  utilityIcon: {
    width: 14,
    height: 14,
  },
  utilityLabel: {
    display: { default: "inline", "@media (max-width: 520px)": "none" },
  },
  copyButton: {
    width: 172,
    "@media (max-width: 520px)": { width: 36, paddingInline: 0 },
  },
  workspace: {
    boxSizing: "border-box",
    minHeight: {
      default: "calc(100vh - 68px)",
      "@media (max-width: 640px)": "calc(100vh - 62px)",
    },
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) 328px",
      "@media (max-width: 820px)": "1fr",
    },
    gap: 0,
    padding: "0 14px 14px",
  },
});
