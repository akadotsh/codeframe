import * as stylex from "@stylexjs/stylex";

export const appStyles = stylex.create({
  shell: {
    minHeight: "100vh",
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    backgroundImage:
      "radial-gradient(circle at 16% 0%, rgba(99, 89, 156, 0.14), transparent 34%), linear-gradient(145deg, #0b0b10, #111019 58%, #0c0c12)",
  },
  resizing: {
    cursor: "ew-resize",
    userSelect: "none",
  },
  topbar: {
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
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 14, 21, 0.64)",
    boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(24px) saturate(125%)",
    position: "relative",
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#f4f3f6",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 580,
    letterSpacing: "-0.018em",
  },
  brandMark: {
    width: 31,
    height: 31,
    display: "grid",
    placeItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.11)",
    borderRadius: 11,
    color: "#b2a8ee",
    backgroundImage:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.035))",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
  },
  workspace: {
    minHeight: {
      default: "calc(100vh - 68px)",
      "@media (max-width: 640px)": "calc(100vh - 62px)",
    },
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) 328px",
      "@media (max-width: 820px)": "1fr",
    },
    gap: 14,
    padding: 14,
  },
});
