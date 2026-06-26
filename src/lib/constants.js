// Design tokens. Colors resolve to CSS variables (defined in globals.css) so the
// whole app themes light/dark via [data-theme] with no per-component changes.
export const F = "Inter,system-ui,sans-serif";
export const M = "JetBrains Mono,SF Mono,monospace";
// Revolut-style geometric display face (Aeonik Pro if licensed, else Space Grotesk).
export const FD = "var(--font-display)";
export const BK = "var(--bk)";
export const WH = "var(--wh)";
export const GY = "var(--gy)";
export const BD = "var(--bd)";
export const MT = "var(--mt)";
export const LT = "var(--lt)";
export const GN = "var(--gn)";
export const RD = "var(--rd)";
export const AM = "var(--am)";
export const BG = "var(--bg)";

// Tint tokens for the literal accent backgrounds used across screens (theme-aware).
export const TINT_GN_BG = "var(--tint-gn-bg)";
export const TINT_GN_BD = "var(--tint-gn-bd)";
export const TINT_RD_BG = "var(--tint-rd-bg)";
export const TINT_RD_BD = "var(--tint-rd-bd)";
export const TINT_AM_BG = "var(--tint-am-bg)";
export const TINT_AM_BD = "var(--tint-am-bd)";
export const TINT_BLUE_BG = "var(--tint-blue-bg)";
export const TINT_BLUE_BD = "var(--tint-blue-bd)";
export const BODY2 = "var(--body2)";
export const MUTEDFILL = "var(--muted-fill)";

// ─── Premium Blue Design System ──────────────────────────────────────────────
// Corner radii
export const R_SM = "var(--r-sm)";   // 8
export const R_MD = "var(--r-md)";   // 12
export const R_LG = "var(--r-lg)";   // 16  (default Card)
export const R_XL = "var(--r-xl)";   // 20
export const R_PILL = "var(--r-pill)"; // 999 (default Btn)

// Brand accent — Norvex blue gradient
export const NX_1 = "var(--nx-1)";     // #2563EB
export const NX_2 = "var(--nx-2)";     // #60A5FA
export const NX_ON = "var(--nx-on)";   // white text on gradient
export const NX_GRAD = "var(--nx-grad)";

// Hero glow (radial, very low opacity)
export const HERO_GLOW = "var(--hero-glow)";

// Elevation
export const SHADOW_SM = "var(--shadow-sm)";
export const SHADOW_MD = "var(--shadow-md)";
export const SHADOW_LG = "var(--shadow-lg)";

// Section rhythm
export const PAD_SECTION = "var(--pad-section)"; // 56
export const PAD_LG = "var(--pad-lg)";           // 80

// Screen IDs (kept from the prototype so component internals are unchanged).
export const S = {
  LANDING: 0,
  WAITLIST: 1,
  CONNECT: 2,
  TUTORIAL: 3,
  GOAL: 4,
  SIMULATOR: 5,
  BUILDING: 6,
  PREVIEW: 7,
  DEPLOYED: 8,
  DASH: 9,
  B2B: 10,
  ADMIN: 11,
  SETTINGS: 12,
  HISTORY: 13,
  EDUCATION: 14,
  SYSTEM: 15,
};

// Map each screen ID to its App-Router path.
export const PATHS = {
  0: "/",
  1: "/waitlist",
  2: "/connect",
  3: "/tutorial",
  4: "/goal",
  5: "/simulator",
  6: "/building",
  7: "/preview",
  8: "/deployed",
  9: "/dashboard",
  10: "/b2b",
  11: "/admin",
  12: "/settings",
  13: "/history",
  14: "/education",
  15: "/system",
};
