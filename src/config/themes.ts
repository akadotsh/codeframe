export const syntaxThemes = [
  { value: "github-dark-default", label: "GitHub Dark" },
  { value: "dark-plus", label: "VS Code Dark+" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { value: "rose-pine", label: "Rosé Pine" },
] as const;

export type SyntaxTheme = (typeof syntaxThemes)[number]["value"];

export const themeLoaders = {
  "github-dark-default": () => import("@shikijs/themes/github-dark-default"),
  "dark-plus": () => import("@shikijs/themes/dark-plus"),
  dracula: () => import("@shikijs/themes/dracula"),
  nord: () => import("@shikijs/themes/nord"),
  "one-dark-pro": () => import("@shikijs/themes/one-dark-pro"),
  "tokyo-night": () => import("@shikijs/themes/tokyo-night"),
  "catppuccin-mocha": () => import("@shikijs/themes/catppuccin-mocha"),
  "rose-pine": () => import("@shikijs/themes/rose-pine"),
} satisfies Record<SyntaxTheme, () => Promise<unknown>>;
