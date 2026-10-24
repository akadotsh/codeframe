import * as stylex from "@stylexjs/stylex";

export const globalStyles = stylex.create({
  document: {
    minHeight: "100%",
    margin: 0,
    colorScheme: "dark",
    backgroundColor: "#101012",
    color: "#eeefe7",
    fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    lineHeight: 1.5,
  },
  body: {
    minWidth: 320,
    minHeight: "100%",
    margin: 0,
    backgroundColor: "#101012",
  },
  app: {
    minHeight: "100%",
  },
});
