# 12 — Design System (Round 6: Solana × Revolut blend)

> The app shipped its full visual identity in Round 6 — a deliberate blend of **Revolut's**
> fintech warmth (rounded cards, generous spacing, premium typography) with **Solana's** web3
> confidence (deep dark sections, gradient highlights, abstract product imagery). Everything is
> token-driven via CSS variables so light/dark mode flips with zero per-component refactor.

## Brand direction
- **Personality:** premium fintech (Revolut) × web3 confidence (Solana). Calm, technical, trustworthy.
- **Voice:** plain English, never crypto jargon at the user surface. The math is the moat — show it
  with restraint.
- **Signature accent:** Norvex green→teal gradient `#16a34a → #14b8a6` (135°). Used for primary CTAs,
  the highlighted "Built by AI." headline word, the Norvex column badge in the comparison table, and
  the brand-row gradient text in product cards.
- **Defining shape:** pill (border-radius 999px) — every button. Card radius 16px (R_LG).
- **Atmosphere:** dark hero panels with abstract 3D backdrops over a warm off-white canvas
  (`#f7f6f3`). Card-on-canvas feel; soft shadows; never harsh borders.

## Design tokens (`src/lib/constants.js` + `src/app/globals.css`)

### Color
All colors are CSS variables so `[data-theme="dark"]` flips the whole app:
- `BK / WH / GY / BD / MT / LT` — base text/surface ladder
- `GN / RD / AM` — success / danger / warn
- `BG` — body canvas (warm off-white `#f7f6f3` light, `#0a0a0c` dark)
- `BODY2 / MUTEDFILL` — secondary text / disabled fill
- `TINT_GN_BG / TINT_GN_BD / TINT_RD_BG / TINT_RD_BD / TINT_AM_BG / TINT_AM_BD` — themed alert tints
- **Brand:** `NX_1 / NX_2 / NX_ON` (solid fallbacks) + `NX_GRAD` (the gradient)
- **Hero glow:** `HERO_GLOW` (subtle teal radial behind hero headlines)

### Radius
- `R_SM` 8px · `R_MD` 12px · `R_LG` 16px (default Card) · `R_XL` 20px · `R_PILL` 999px (default Btn)

### Elevation
- `SHADOW_SM` 0 1px 2px rgba(0,0,0,0.04) — outer app panel
- `SHADOW_MD` 0 8px 24px rgba(0,0,0,0.08) — primary CTAs, page hero banners, dropdowns
- `SHADOW_LG` 0 16px 48px rgba(0,0,0,0.12) — landing hero, dark comparison section
- Darker variants under `[data-theme="dark"]`

### Section rhythm
- `PAD_SECTION` 56px · `PAD_LG` 80px

## Layout

### Frame (`src/components/AppShell.jsx`)
- **Uniform `maxWidth: 1240`** on every route (landing AND inner pages) — no jarring width change
  when navigating between landing and dashboard. Inner pages constrain their content to `maxWidth: 960`
  centered, so dashboards/forms feel readable without wasted horizontal space.
- Outer panel: rounded `R_LG` corners, `SHADOW_SM`, 1px border, 24px top margin → "card on canvas" feel.
- Body canvas: `var(--bg)` (warm off-white light, deep dark).
- Frame is conditionally borderless on landing (Nav's bottom border drops when `pathname === "/"`).

### Nav (`src/components/Nav.jsx`)
- Wordmark `norvex` at 24px, weight 800, tight letter-spacing. No gradient dot, no version tag — the
  brand stands alone.
- Padding 22/28; gap 16 between elements.
- Connected-user chip: pill (`R_PILL`), 7px green dot, address truncated `XXXX..YYYY`, "demo" tag
  when simulated.
- Notification bell (with dot when unread), Admin / API quick-links when role unlocked.
- Dropdown menu: `R_MD`, soft shadow, items at 14px weight 500, includes Dark Mode toggle + Disconnect.

### Page heroes
Every non-landing page above the fold gets a **dark image-backed hero card** (`R_LG`, soft shadow,
~180–220px tall):
- Backdrop image at 55–85% opacity + a left-to-right dark gradient overlay so text stays readable.
- Eyebrow label (mono, uppercase, 11px) + headline (clamp 26–38px, weight 800, white) + 1-line subhead.
- Per-page image mapping in `screens.jsx` — see the inventory below.

## Components (`src/components/ui.jsx`)

### Btn
- **Default:** pill, outline, 1px border on `BD`, `R_PILL`, 13/24 padding.
- **`primary` (gradient)** — green→teal gradient bg, white text, soft elevation. Used for landing
  CTAs ("Join Waitlist", "Get Early Access").
- **`black`** — solid black/white-on-black in dark.
- **`danger`** — red text/border.
- Sizes: default (15px text) / `small` (13px).
- `full` makes it fill width; `disabled` mutes.

### Card
- **Default:** `R_LG` 16px corners, 1px `BD` border, 16px padding.
- **`hl`** — light fill (`GY`) for highlighted/nested cards.
- **`dark`** — black/dark surface.
- **`elev`** — adds `SHADOW_MD` for emphasized cards.
- **`accent`** — wraps in a 1px gradient border (green→teal) for "special" cards (fee, risk callouts).

### Other primitives
- `Stat` — pill-card numeric stat (28px number, mono label).
- `Tab` — pill chip, active = solid black/white.
- `Toggle` — 36×20 pill switch, green when on.
- `Label` (eyebrow), `H2`, `Sub`, `Row`, `MiniChart`, `SysCode`.

## Landing — section anatomy (`Landing` in `src/components/screens.jsx`)
1. **Hero** — full-width dark `R_LG` card. Backdrop: vibrant rainbow waves
   (`pexels-julien-tromeur-10234681-12060424.jpg`). Hero glow (teal radial) behind headline.
   Headline: "Your private banker." (white) + "Built by AI." (gradient text-fill). 3 pill CTAs;
   primary CTA = gradient. Title is forced to 2 lines via `whiteSpace: nowrap` on each line and a
   clamp scale so it never breaks awkwardly.
2. **Stats** — four pill chips ($7T / $100 / 24/7 / 5-layer); each number filled with a distinct
   gradient (green→teal · indigo→teal · magenta→indigo · amber→magenta).
3. **Feature blocks (4)** — Revolut-style alternating image-left / text-right.
   See the image mapping below.
4. **How it works** — **2×2** dark gradient cards, sized to match the stats; each card has its own
   tinted gradient bg (green-teal · navy · plum · cyan) + a soft colored radial glow in the
   top-right corner, gradient-text mono number (01/02/03/04), title (18px weight 700, white),
   description (13px muted).
5. **Comparison table** — wrapped in a **dark gradient section** with an iridescent-waves backdrop
   (`pexels-mahmoudramadan-31622977.jpg` at 35% opacity), 135° dark→teal overlay, teal radial glow
   top-right. Header is a translucent white-on-dark card; each row is its own glassmorphism card
   (4% white, 4px blur). Norvex column = gradient pill badge in header + gradient text-fill in rows.
6. **FAQ** — narrow centered column (`maxWidth: 720`). 9 questions, circular ±26px toggle icons,
   black when open / `GY` when closed. h2 headline "Questions, answered."
7. **Final CTA** — centered gradient pill ("Get Early Access").

## Image asset library (`public/images/`)

Twelve abstract 3D renders + one product shot, used as dark hero backdrops across the app. Each is
designed to bleed in from one side of a dark card behind a left-to-right fade so text always reads.

| File | Where it's used | Mood |
|---|---|---|
| `pexels-julien-tromeur-10234681-12060424.jpg` | **Landing hero** | Vibrant rainbow waves (Solana energy) |
| `pexels-steve-29703884.jpg` | **Feature: Protected by design** | Green grooved sphere (brand-perfect) |
| `pexels-danielwells67-35786897.jpg` | **Feature: AI builds your portfolio** | Iridescent rainbow curves (multi-agent debate) |
| `pexels-steve-12696425.jpg` | **Feature: Built on Solana** | Teal chevron walls (on-chain proof) |
| `pexels-mahmoudramadan-32624441.jpg` | **Feature: Compound on autopilot** + Dashboard hero | Polished chrome shell |
| `pexels-mahmoudramadan-31622977.jpg` | **Comparison-table backdrop** | Iridescent metal waves (dramatic centerpiece) |
| `maxresdefault (5).jpg` | **B2B hero** | Ledger × Solana hardware wallet (partner narrative) |
| `pexels-mahmoudramadan-31650385.jpg` | **Admin hero** | Burgundy/silver swirl (command-room mood) |
| `pexels-steve-12696432.jpg` | **System Docs hero** | Silver/chrome cylinders (technical/industrial) |
| `pexels-kechno-studio-2150595479-34270452.jpg` | **Education hero** | Teal pill stacks (protection theme) |
| `pexels-danielwells67-35787318.jpg` | **Goal / New Portfolio hero** | Rainbow glass rings (creation/possibility) |
| `pexels-steve-29703881.jpg` | **Simulator hero** | Navy spiral fan (analysis / depth) |
| `pexels-mahmoudramadan-28795078.jpg` · `pexels-steve-126964322.jpg` | (Spare — available for future pages, B2B sub-tabs, marketing) |

## Dark mode
- Triggered via `[data-theme="dark"]` on `<html>` (toggle in Nav dropdown + ⌘K palette).
- Persisted in `localStorage`; inline no-FOUC script applies the saved theme before paint.
- Dark palette is lightened from a pure-black look so cards/text/borders breathe:
  `--bk: #f4f4f5`, `--wh: #15151a`, `--gy: #202028`, `--bd: #303039`, `--bg: #0a0a0c`, etc.
- Brand gradient brightens in dark (`#22c55e → #2dd4bf`); hero glow gets warmer.
- All tint backgrounds (success/danger/warn) have themed dark variants — no white-on-white or
  black-on-black readability issues.

## Accessibility & responsive
- **Mobile:** at ≤720px the Revolut feature blocks stack image-on-top via media query (`.nx-feature`);
  the 2×2 How-It-Works grid collapses to single column (`.nx-howgrid`).
- Headline `font-size` uses `clamp(min, vw, max)` everywhere so type scales smoothly from 375px to
  desktop without overflow.
- Color contrast checked against WCAG AA on both themes (Inter at 13–15px on `BODY2` is the floor;
  larger sizes use `LT` or `BK`).
- Every interactive primitive is a real `<button>` / `<a>` (keyboard accessible).
- Print: a `.no-print` class hides Nav / Breadcrumbs / Footer / FeedbackWidget / CommandPalette;
  Preview & Dashboard expose "Download PDF" → `window.print()`.

## Typography
- **Body / UI:** Inter (`F = "Inter,system-ui,sans-serif"`).
- **Mono / numbers / labels:** JetBrains Mono (`M = "JetBrains Mono,SF Mono,monospace"`).
- Headline scale uses `letter-spacing: -0.03 to -0.04em` and `font-weight: 800`.
- Body line-height 1.5–1.6; tight 1.04–1.15 on headlines (with extra `padding-bottom` on
  gradient-text spans so descenders don't clip).

## Sample component recipes

### A page hero (used on every inner page)
```jsx
<div style={{position:"relative",borderRadius:R_LG,overflow:"hidden",background:"#0a0a0c",
             minHeight:200,marginBottom:24,boxShadow:SHADOW_MD}}>
  <img src="/images/<page-asset>.jpg" alt="" aria-hidden
       style={{position:"absolute",inset:0,width:"100%",height:"100%",
               objectFit:"cover",objectPosition:"right center",opacity:0.7}}/>
  <div aria-hidden style={{position:"absolute",inset:0,
       background:"linear-gradient(90deg, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.5) 60%, rgba(10,10,12,0.1) 100%)"}}/>
  <div style={{position:"relative",padding:"32px"}}>
    <p style={{fontSize:11,fontFamily:M,color:"#a1a1aa",letterSpacing:"0.16em",
               textTransform:"uppercase",margin:"0 0 12px"}}>PAGE EYEBROW</p>
    <h1 style={{fontSize:"clamp(26px, 4vw, 38px)",fontWeight:800,lineHeight:1.1,
                letterSpacing:"-0.03em",margin:"0 0 8px",color:"#fafafa"}}>Page headline.</h1>
    <p style={{fontSize:14,color:"#c4c4cc",margin:0,maxWidth:520}}>Subhead.</p>
  </div>
</div>
```

### A gradient-text accent
```jsx
const gradTextStyle = {
  backgroundImage: NX_GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  paddingBottom: "0.12em", // descenders need extra room with background-clip: text
};
```

### A primary CTA
```jsx
<Btn primary onClick={...}>Join Waitlist</Btn>
```

## What's intentionally NOT in the design
- Emojis (avoided in product surfaces; reserved for marketing copy).
- Glassmorphism *everywhere* (only on the dark comparison section; cards stay flat-with-shadow).
- Custom illustrations (we use real abstract product photography — cheaper, more premium, no
  illustrator cost).
- Heavy animations (subtle 150ms transitions only; no parallax, no scroll-jacking).
- Skeleton loaders (we show real content fast; rare loading states use the dotted progress pattern).

## Maintenance notes
- **Single source of truth:** color/radius/shadow tokens live in `globals.css` + `constants.js`.
  Never inline hex values in components — use the tokens.
- **Adding a new page hero:** follow the recipe above, pick an unused image, set the right eyebrow +
  headline + subhead. Keep `minHeight` between 180–220px (220 for marketing pages, 180 for utility).
- **Adding a new color tint:** add the light value to `:root`, the dark value to `[data-theme="dark"]`,
  export a constant from `constants.js`, use everywhere as a CSS variable.
- **Changing the gradient:** edit `--nx-grad` in both themes; everything that uses `NX_GRAD` updates
  automatically (CTAs, hero word fill, stat numbers, comparison-table badge, brand dots).
