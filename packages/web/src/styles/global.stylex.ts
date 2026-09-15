import * as stylex from "@stylexjs/stylex";

export const globalStyles = stylex.create({
  document: {
    minHeight: "100%",
    margin: 0,
    colorScheme: "dark",
    backgroundColor: "#0c0c11",
    color: "#f2f1f4",
    fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    lineHeight: 1.5,
  },
  body: {
    minWidth: 320,
    minHeight: "100%",
    margin: 0,
    backgroundColor: "#0c0c11",
  },
  app: {
    minHeight: "100%",
  },
});
