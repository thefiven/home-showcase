# DESIGN.md — Maison Vue Mer (Plouider)

Source of truth for the design system used in `Maison Vue Mer - Plouider.dc.html`. Any new page/screen must reuse these tokens as-is (no new ad hoc color/size without updating this document).

## 1. Color tokens

| Name                            | Hex                                            | Usage                                                                                       |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `background`                    | `#F5F2EC`                                      | General page background (warm stone / off-white), input backgrounds                         |
| `surface`                       | `#EDE9DF`                                      | Alternate section background (availability, form card)                                      |
| `surface-dark`                  | `#24445c`                                      | Dark section backgrounds (key-figures banner, location, footer top-border), logo mark color |
| `border`                        | `rgba(28,43,51,0.1)`                           | Subtle separators (nav, footer)                                                             |
| `border-strong`                 | `rgba(28,43,51,0.15)` to `rgba(28,43,51,0.25)` | Input borders, calendar cells, language pill                                                |
| `foreground`                    | `#1C2B33`                                      | Primary text on light background (deep slate / navy)                                        |
| `foreground-muted`              | `#3A3C3D`                                      | Body copy paragraphs (description, section text)                                            |
| `foreground-soft`               | `#6B6459`                                      | Uppercase eyebrows/labels, secondary text (granite)                                         |
| `foreground-on-dark`            | `#F5F2EC`                                      | Text on dark background (hero, banner, location, footer text)                               |
| `foreground-on-dark-muted`      | `#C7CDD1` / `#9BB0BC` / `#E7E1D3`              | Secondary text on dark background (variants per section)                                    |
| **Primary accent** — `atlantic` | `#24445c`                                      | Main CTA (nav, form button), links (`a`)                                                    |
| **Primary accent hover**        | `color-mix(in srgb, #24445c 85%, black)`       | Hover state of primary-accent CTAs/links                                                    |
| **Warm accent** — `gorse`       | `#B8863A`                                      | Hero CTA ("Check availability"), price, amenity checkmarks                                  |
| **Warm accent hover**           | `#a37530`                                      | Hover state of the warm-accent CTA                                                          |
| **Semantic — available**        | `#F5F2EC` (cell) + border `rgba(28,43,51,0.3)` | Free calendar cell                                                                          |
| **Semantic — unavailable**      | `#8B8177`                                      | Blocked calendar cell (grayed foam), legend background                                      |

No hard-coded success/error color in the current design (form has no visual validation state) — if added, derive from `#24445c` (`atlantic`, info/success) and a desaturated, muted red to be defined before implementation, never a generic saturated red.

## 2. Typographic scale

Families:

- **Display**: `'Source Serif 4', serif` — headings (h1, h2, h3, logo). Weights used: 600 (default), 400/500/700 also loaded.
- **Body**: `'Work Sans', sans-serif` — body copy, nav, form, buttons.
- **Utility (dates / prices / labels)**: `'Space Mono', monospace` — price, calendar dates, uppercase eyebrows, language pill.

| Role                      | Family         | Weight | Size                                               | Line height                   | Notes                                             |
| ------------------------- | -------------- | ------ | -------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| Display (H1 hero)         | Source Serif 4 | 600    | `clamp(2.4rem, 6vw, 4.4rem)`                       | 1.05                          | `max-width:16ch`, color `#F5F2EC` on hero         |
| H2 (section titles)       | Source Serif 4 | 600    | `clamp(1.7rem, 3vw, 2.3rem)`                       | normal (browser default ~1.3) | Used for all section titles                       |
| H3 (calendar subtitles)   | Source Serif 4 | 600    | `18px`                                             | normal                        |                                                   |
| Body                      | Work Sans      | 400    | `16px` (long copy) / `15px` (secondary text, form) | `1.5` (inherited from body)   | `max-width:58ch` on long paragraphs               |
| Nav / links               | Work Sans      | 500    | `15px`                                             | 1.5                           |                                                   |
| Form labels               | Work Sans      | 600    | `14px`                                             | 1.5                           |                                                   |
| Eyebrow / uppercase label | Space Mono     | 400    | `12px`                                             | 1.5                           | `text-transform:uppercase; letter-spacing:0.12em` |
| Hero eyebrow              | Space Mono     | 400    | `13px`                                             | 1.5                           | `letter-spacing:0.14em`                           |
| Caption / fine print      | Work Sans      | 400    | `13px`–`14px`                                      | 1.5                           | Footer, key-figures banner sub-labels             |
| Key figures (banner)      | Space Mono     | 700    | `22px`                                             | 1.2                           |                                                   |
| Calendar dates            | Space Mono     | 400    | `13px`                                             | 1 (square cell `34px`)        |                                                   |
| Hero price (gorse)        | Space Mono     | 700    | `22px`                                             | 1.2                           | Warm accent color                                 |

Base body text size: `16px`, never below `12px` (footer fine print). No type size below 12px.

## 3. Spacing

Base unit: **2px** (underlying grid), but the real rhythm is mostly expressed in **multiples-of-4** steps:

`2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32`, then fluid `clamp()` steps for large section spacing:

| Usage                               | Value                                                      |
| ----------------------------------- | ---------------------------------------------------------- |
| Internal gap (icon + text, chip)    | `6px`–`10px`                                               |
| Gap between form fields             | `14px`–`16px`                                              |
| Gap between cards/columns (grid)    | `12px` (gallery), `clamp(32px,5vw,64px)` (section columns) |
| Nav padding (vertical / horizontal) | `14px` / `clamp(16px,4vw,48px)`                            |
| Section padding (vertical)          | `clamp(48px,7vw,88px)`                                     |
| Hero padding (internal)             | `clamp(28px,5vw,64px)`                                     |
| Button padding                      | `10px 20px` (nav), `14px 24px`–`14px 26px` (main CTAs)     |
| Input/textarea padding              | `11px 12px`                                                |
| Form card padding                   | `clamp(20px,3vw,32px)`                                     |

Large spacing values (section padding, responsive grid gaps) consistently use `clamp(min, preferred-vw, max)` rather than fixed breakpoints — the rhythm tightens continuously from mobile to desktop.

## 4. Radius / borders / shadows

- **Radius**: deliberately flat policy — `2px` on all interactive elements (buttons, inputs, form cards), `20px` (pill) only on the FR/EN language selector. No `border-radius` on images (sharp corners, consistent with the roof motif). No SaaS-style "rounded-xl" cards.
- **Borders**: `1px solid`, always in `rgba(28,43,51, α)` — `0.1` (subtle separators), `0.15` (calendar cells), `0.25` (inputs, language pill), `0.3` (available legend), `0.6` (ghost button on hero, in `rgba(245,242,236,0.6)`).
- **Shadows**: **none** in the current design — no box-shadow anywhere. Depth comes from background contrast (`#24445c` / `#EDE9DF` / `#F5F2EC` bands) and a `backdrop-filter: blur(8px)` on the sticky nav, no drop-shadow elevation. Don't introduce a shadow without revisiting this rule.

## 5. Signature element

Longère (farmhouse) roof silhouette (two slopes, low ridge): `clip-path: polygon(0 100%, 0 55%, 22% 20%, 50% 0%, 78% 20%, 100% 55%, 100% 100%)` on a `#24445c` background. Used as the logo mark (nav `34×26px`, footer `26×20px`). Reusable as a divider or decorative accent, never as a wave/seagull icon.

## 6. Responsive breakpoints

No fixed breakpoints (`@media`): the layout is **fluid** end to end.

- **Typography and large spacing**: `clamp()` (bounds given in sections 2 and 3) — evolves continuously with `vw`.
- **Content grids**: `grid-template-columns: repeat(auto-fit, minmax(Xpx, 1fr))` — automatically collapse to 1 column below threshold `X`:
  - Section columns (description/amenities, booking, location): `minmax(320px, 1fr)`
  - Photo gallery: `minmax(260px, 1fr)`, `grid-auto-rows:220px`, hero tile `grid-column:span 2; grid-row:span 2`
  - Calendar (2 months): `minmax(300px, 1fr)`
  - Paired form fields (dates, email/phone): `minmax(160px, 1fr)`
- **Nav and action rows**: `flex-wrap: wrap` with fluid `gap` (`clamp(14px,3vw,28px)`) rather than a dedicated burger menu — naturally reflows into stacked columns on mobile.
- **Hero**: fluid height `clamp(440px, 62vw, 720px)` (never a fixed pure-vh height, to stay readable in mobile portrait format).

Common usage reference points implied by the `minmax()` thresholds (≈ approximate equivalents, for reference only):

- **Mobile**: < 480px — everything in 1 column
- **Tablet**: ≈ 480–860px — 2 columns depending on the grid (`auto-fit` switches on its own)
- **Desktop**: > 860–1100px — full grids (up to 3 amenity columns, 2 calendar/form columns), content capped at `max-width:1200px` (`1000px` for the availability section).
