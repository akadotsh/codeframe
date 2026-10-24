export type Palette = {
  name: string;
  colors: [string, string];
  card: string;
  text: string;
  muted: string;
  accent: string;
};

export const palettes: Palette[] = [
  {
    name: "Warm Graphite",
    colors: ["#343632", "#55574f"],
    card: "#181917",
    text: "#ecece6",
    muted: "#85877f",
    accent: "#b6bb9e",
  },
  {
    name: "Tide",
    colors: ["#123f4c", "#55736f"],
    card: "#0c1519",
    text: "#e7f1f0",
    muted: "#718484",
    accent: "#8ec8bd",
  },
  {
    name: "Clay",
    colors: ["#5f342f", "#98705d"],
    card: "#17110f",
    text: "#f5ece8",
    muted: "#88736b",
    accent: "#d8a88f",
  },
  {
    name: "Ink",
    colors: ["#202c50", "#5c4c7a"],
    card: "#0d101b",
    text: "#eff1fa",
    muted: "#6f7488",
    accent: "#9daae2",
  },
  {
    name: "Mono",
    colors: ["#292a2f", "#606168"],
    card: "#101012",
    text: "#f0f0f1",
    muted: "#77787e",
    accent: "#c3c3c7",
  },
  {
    name: "Cedar",
    colors: ["#3b342f", "#6f5948"],
    card: "#171411",
    text: "#f1ece5",
    muted: "#8f8277",
    accent: "#c5a580",
  },
  {
    name: "Forest",
    colors: ["#263d36", "#657a68"],
    card: "#101713",
    text: "#edf3ef",
    muted: "#77847b",
    accent: "#a5c4ad",
  },
  {
    name: "Glacier",
    colors: ["#274255", "#708796"],
    card: "#0d151b",
    text: "#edf4f7",
    muted: "#748590",
    accent: "#abc8d8",
  },
  {
    name: "Plum",
    colors: ["#432f4f", "#79617e"],
    card: "#151017",
    text: "#f3edf4",
    muted: "#837587",
    accent: "#c5a7c9",
  },
  {
    name: "Dune",
    colors: ["#514638", "#90816a"],
    card: "#16130f",
    text: "#f4f0e8",
    muted: "#857d70",
    accent: "#cbbc9f",
  },
  {
    name: "Auburn",
    colors: ["#57312f", "#8b5b50"],
    card: "#17100f",
    text: "#f5edeb",
    muted: "#89736e",
    accent: "#d0a096",
  },
  {
    name: "Slate",
    colors: ["#303946", "#69717e"],
    card: "#101419",
    text: "#eef1f4",
    muted: "#78808a",
    accent: "#b1bdca",
  },
];
