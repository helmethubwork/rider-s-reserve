export const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f0f0f0",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#ea580c",
  purple: "#7c3aed",
  pink: "#db2777",
  grey: "#6b7280",
  gray: "#6b7280",
  silver: "#c0c0c0",
  gold: "#d97706",
  brown: "#92400e",
  "matte black": "#1a1a1a",
  "matt black": "#1a1a1a",
  "gloss black": "#0a0a0a",
  "gloss white": "#f0f0f0",
  "pearl white": "#f8f8f0",
  "flat black": "#2a2a2a",
  navy: "#1e3a5f",
  teal: "#0d9488",
  cyan: "#0891b2",
  "light blue": "#60a5fa",
  "dark blue": "#1e3a8a",
  maroon: "#7f1d1d",
  beige: "#d2b48c",
  cream: "#fffdd0",
  titanium: "#878681",
  "matte grey": "#6b7280",
  "matte gray": "#6b7280",
};

const COLOR_KEYWORDS = [
  "black", "white", "red", "blue", "green", "yellow",
  "orange", "purple", "pink", "grey", "gray", "silver",
  "gold", "brown", "navy", "teal", "cyan", "maroon",
];

export const getColorHex = (name: string): string =>
  COLOR_MAP[name.toLowerCase().trim()] ?? "#6b7280";

function extractColorKeywords(name: string): string[] {
  const lower = name.toLowerCase();
  // Strip numeric suffixes and special chars
  const cleaned = lower.replace(/[-_]?\d+/g, "").trim();
  return COLOR_KEYWORDS.filter((k) => cleaned.includes(k));
}

export const getSwatchBackground = (name: string): string => {
  const lower = name.toLowerCase().trim();

  // 1. Exact match in COLOR_MAP (handles solids like "Matt Black")
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];

  // 2. Split by "/" → dual-tone gradient
  if (name.includes("/")) {
    const parts = name.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const c1 = COLOR_MAP[parts[0].toLowerCase()] ?? "#6b7280";
      const c2 = COLOR_MAP[parts[1].toLowerCase()] ?? "#6b7280";
      return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }
  }

  // 3. Extract color keywords from the string
  const found = extractColorKeywords(lower);
  if (found.length >= 2) {
    const c1 = COLOR_MAP[found[0]] ?? "#6b7280";
    const c2 = COLOR_MAP[found[1]] ?? "#6b7280";
    return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
  }
  if (found.length === 1) {
    return COLOR_MAP[found[0]] ?? "#6b7280";
  }

  // 4. Final fallback — never blank
  return "#6b7280";
};
