
export const CHIP_TEXT_COLOR = "#0f172a";

export const FRIENDLY_PALETTE = [
  "#fecdd3", // rose
  "#fde68a", // amber
  "#bbf7d0", // green
  "#bae6fd", // sky
  "#ddd6fe", // violet
  "#fbcfe8", // pink
  "#fed7aa", // orange
  "#a7f3d0", // emerald
  "#c7d2fe", // indigo
  "#e9d8a6", // sand
];

export const COLORBLIND_PALETTE = [
  "#f6e8c3", // light yellow
  "#cfe3f2", // light blue
  "#d9e8cf", // pale green
  "#f2d1ce", // light vermillion
  "#e3d5ef", // light purple
  "#f0d9b5", // light orange
  "#d6d6d6", // grey
  "#bcd9e8", // blue-grey
  "#efe2c8", // sand
  "#cdd9e5", // slate
];

export type PaletteName = "friendly" | "colorblind";

export function paletteFor(name: PaletteName): string[] {
  return name === "colorblind" ? COLORBLIND_PALETTE : FRIENDLY_PALETTE;
}

export function chipColor(i: number, palette: PaletteName): string {
  const colors = paletteFor(palette);
  return colors[i % colors.length];
}
