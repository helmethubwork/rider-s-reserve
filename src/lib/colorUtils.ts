export const COLOR_MAP: Record<string, string> = {
  // Solids
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
  navy: "#1e3a5f",
  teal: "#0d9488",
  cyan: "#0891b2",
  "light blue": "#60a5fa",
  "dark blue": "#1e3a8a",
  maroon: "#7f1d1d",
  beige: "#d2b48c",
  cream: "#fffdd0",
  titanium: "#878681",

  // Matte / Gloss / Flat / Pearl variants
  "matte black": "#1a1a1a",
  "matt black": "#1a1a1a",
  "gloss black": "#0a0a0a",
  "gloss white": "#f0f0f0",
  "pearl white": "#f8f8f0",
  "flat black": "#2a2a2a",
  "matte grey": "#6b7280",
  "matte gray": "#6b7280",
  "matte red": "#dc2626",
  "matte blue": "#2563eb",
  "matte green": "#16a34a",

  // Neon variants
  "neon yellow": "#FFE000",
  "neon green": "#39FF14",
  "neon orange": "#FF6700",
  "neon red": "#FF073A",
  "neon blue": "#1F51FF",
  "neon pink": "#FF10F0",

  // Pre-defined dual-tone gradients (black base)
  "black grey": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
  "black gray": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
  "black white": "linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)",
  "black red": "linear-gradient(135deg, #1a1a1a 50%, #dc2626 50%)",
  "black blue": "linear-gradient(135deg, #1a1a1a 50%, #2563eb 50%)",
  "black yellow": "linear-gradient(135deg, #1a1a1a 50%, #eab308 50%)",
  "black orange": "linear-gradient(135deg, #1a1a1a 50%, #ea580c 50%)",
  "black green": "linear-gradient(135deg, #1a1a1a 50%, #16a34a 50%)",
  "black silver": "linear-gradient(135deg, #1a1a1a 50%, #c0c0c0 50%)",
  "black gold": "linear-gradient(135deg, #1a1a1a 50%, #d97706 50%)",
  "black purple": "linear-gradient(135deg, #1a1a1a 50%, #7c3aed 50%)",
  "black pink": "linear-gradient(135deg, #1a1a1a 50%, #db2777 50%)",
  "black neon yellow": "linear-gradient(135deg, #1a1a1a 50%, #FFE000 50%)",
  "black neon green": "linear-gradient(135deg, #1a1a1a 50%, #39FF14 50%)",
  "black neon orange": "linear-gradient(135deg, #1a1a1a 50%, #FF6700 50%)",
  "black neon red": "linear-gradient(135deg, #1a1a1a 50%, #FF073A 50%)",
  "black neon blue": "linear-gradient(135deg, #1a1a1a 50%, #1F51FF 50%)",
  "matt black grey": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
  "matt black red": "linear-gradient(135deg, #1a1a1a 50%, #dc2626 50%)",
  "matt black blue": "linear-gradient(135deg, #1a1a1a 50%, #2563eb 50%)",
  "matt black white": "linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)",
  "matt black yellow": "linear-gradient(135deg, #1a1a1a 50%, #eab308 50%)",
  "matt black neon yellow": "linear-gradient(135deg, #1a1a1a 50%, #FFE000 50%)",
  "matt black neon green": "linear-gradient(135deg, #1a1a1a 50%, #39FF14 50%)",
  "matte black grey": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
  "matte black red": "linear-gradient(135deg, #1a1a1a 50%, #dc2626 50%)",
  "matte black blue": "linear-gradient(135deg, #1a1a1a 50%, #2563eb 50%)",
  "matte black white": "linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)",

  // Pre-defined dual-tone gradients (other base colors)
  "grey black": "linear-gradient(135deg, #6b7280 50%, #1a1a1a 50%)",
  "white black": "linear-gradient(135deg, #f0f0f0 50%, #1a1a1a 50%)",
  "red black": "linear-gradient(135deg, #dc2626 50%, #1a1a1a 50%)",
  "blue black": "linear-gradient(135deg, #2563eb 50%, #1a1a1a 50%)",
  "green black": "linear-gradient(135deg, #16a34a 50%, #1a1a1a 50%)",
  "yellow black": "linear-gradient(135deg, #eab308 50%, #1a1a1a 50%)",
  "orange black": "linear-gradient(135deg, #ea580c 50%, #1a1a1a 50%)",
  "red white": "linear-gradient(135deg, #dc2626 50%, #f0f0f0 50%)",
  "blue white": "linear-gradient(135deg, #2563eb 50%, #f0f0f0 50%)",
  "green white": "linear-gradient(135deg, #16a34a 50%, #f0f0f0 50%)",
  "white red": "linear-gradient(135deg, #f0f0f0 50%, #dc2626 50%)",
  "white blue": "linear-gradient(135deg, #f0f0f0 50%, #2563eb 50%)",
  "white green": "linear-gradient(135deg, #f0f0f0 50%, #16a34a 50%)",
  "grey white": "linear-gradient(135deg, #6b7280 50%, #f0f0f0 50%)",
  "silver black": "linear-gradient(135deg, #c0c0c0 50%, #1a1a1a 50%)",
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

  // 1. Exact match in COLOR_MAP
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];

  // 1b. Strip numeric suffixes (e.g. "Black Neon Yellow-06" → "black neon yellow") and try again
  const cleaned = lower.replace(/[-_]?\s*\d+(\.\d+)?/g, "").trim();
  if (cleaned !== lower && COLOR_MAP[cleaned]) return COLOR_MAP[cleaned];

  // 2. Split by "/" → dual-tone gradient
  const splitOn = name.includes("/") ? "/" : null;
  if (splitOn) {
    const parts = name.split(splitOn).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const c1 = resolveColorPart(parts[0]);
      const c2 = resolveColorPart(parts[1]);
      return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }
  }

  // 3. Try to find a neon-compound match first (e.g. "neon yellow" inside the string)
  const neonMatch = cleaned.match(/neon\s+(yellow|green|orange|red|blue|pink)/);
  if (neonMatch) {
    const neonColor = `neon ${neonMatch[1]}`;
    // Check if there's another base color present
    const base = COLOR_KEYWORDS.find((k) => cleaned.includes(k) && !`neon ${neonMatch[1]}`.includes(k));
    if (base) {
      const c1 = COLOR_MAP[base] ?? "#6b7280";
      const c2 = COLOR_MAP[neonColor] ?? "#FFE000";
      return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }
    return COLOR_MAP[neonColor] ?? "#FFE000";
  }

  // 4. Extract plain color keywords from the cleaned string
  const found = extractColorKeywords(cleaned);
  if (found.length >= 2) {
    const c1 = COLOR_MAP[found[0]] ?? "#6b7280";
    const c2 = COLOR_MAP[found[1]] ?? "#6b7280";
    return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
  }
  if (found.length === 1) {
    return COLOR_MAP[found[0]] ?? "#6b7280";
  }

  // 5. Final fallback — never blank
  return "#6b7280";
};

function resolveColorPart(part: string): string {
  const key = part.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key] as string;
  const found = COLOR_KEYWORDS.find((k) => key.includes(k));
  return found ? (COLOR_MAP[found] ?? "#6b7280") : "#6b7280";
}
