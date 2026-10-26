# Design system and CSS audit

Date: 13 September 2026.

## What the audit found

The stylesheet had grown by appending. Measured before any change:

| Measure | Before |
|---|---|
| Size | 126 KB, 4,600 lines |
| Hardcoded colour literals | **1,031** (777 distinct) |
| Rule blocks | 1,418 |
| Selectors defined more than once | 235 |
| Genuine property conflicts (same selector, same property, different value) | 332 total; **119 at top level**, outside media queries |
| `prefers-color-scheme` support | **none** |
| Distinct `border-radius` values | 20, from 2px to 999px |

777 distinct colours for what is really about a dozen roles, and two competing definitions of `.btn.primary` where the loser was still in the file. There was no theming layer to switch, which is why dark mode did not exist.

## The token layer

Every colour now resolves through `:root`. Components never name a raw hex.

- **Brand** — red: `--brand`, `--brand-hover`, `--brand-active`, `--brand-ink`, `--brand-tint`, `--brand-line`, `--brand-glow`.
- **Surfaces** — `--bg`, `--bg-deep`, `--surface`, `--surface-2`, `--surface-3`, `--surface-hover`.
- **Ink** — `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--ink-invert`, plus `--on-solid` for text on a coloured fill.
- **Lines** — `--line`, `--line-soft`, `--line-strong`.
- **Status** — critical, warning, ok and info, each with `-ink`, `-tint`, `-line` and `-solid`.
- **Extended accents** — violet, teal, plum and sand, each with a tint and a solid.
- **Console** — `--console` through `--console-4`, `--console-line`, `--console-ink` and friends.
- **Shape and elevation** — `--r-xs` to `--r-xl` plus `--r-pill`; `--shadow-sm`, `--shadow`, `--shadow-lg`.

Two decisions are worth stating because they are not obvious.

**A token means the same thing in both themes.** `--surface` is always "the thing a card sits on". The dark palette is a re-tuning, not an inversion, which is why nothing needed a `[data-theme]`-specific component rule.

**The `-solid` scale exists because status colours flip.** `--info` is a dark blue in light mode and a light blue in dark mode. Used as a *background* with white text, it silently fails in one theme. Any coloured fill that carries `--on-solid` text uses the `-solid` scale, which stays dark enough for white text in both.

**The console stays dark in both themes.** The operations room, the sidebar and the video surfaces sit behind bright footage; light chrome around them is glare. That is a deliberate exception, not an oversight.

## What changed

- **1,013 of 1,031 colour literals** replaced, resolving to 36 tokens. The rest are the token definitions themselves.
- **57 keyword colours** (`background: white`, `color: white`) tokenised — these were the main cause of white cards in dark mode.
- **138 dead declarations removed** across 93 duplicated selectors, and 7 rule blocks that became empty. Only declarations provably overridden later were removed, so rendering is unchanged by that step.
- **`.btn.primary` consolidated** — two competing definitions became one, on the brand.
- **168 radii snapped** to a five-step scale; 20 arbitrary values reduced to 5.
- **One elevation language** — a panel is one border, one radius, one shadow, and a panel inside a panel drops its frame so a card in a card reads as one object.
- **One focus ring**, drawn in the brand, on every interactive element.
- **Theme control** in the header: light, dark, or follow the system. System is the default and stamps nothing, so `prefers-color-scheme` applies. The choice is stored per browser and every storage access is guarded, so it still works in a private window.

## Defects found and fixed

- **Light-mode contrast**: muted text sat at 2.7:1 on white. `--ink-3` and `--ink-4` were darkened; low-contrast samples fell from **20 to 2** in light mode. The two remaining are gradient-clipped logo text, which has no foreground colour by design.
- **Console tokens leaking into light contexts** as backgrounds, producing near-invisible text.
- **Mobile header overflow**: adding the theme control pushed the page sideways at 375 px on three screens. Header actions now wrap; overflow is **0** on every screen in both themes.
- **A detection overlay label** was positioned outside its own bounding box and clipped at image edges. It now sits inside the box, which is the usual convention anyway.
- **A duplicated subtitle** — the concept hero repeated the text already shown under the page title.
- **`00` in a stat card**: counts were zero-padded to two digits, so a count of zero rendered as "00". Padding removed; alignment now comes from tabular numerals.
- **A hardcoded camera count**: the caption always read "1 camera needs attention" regardless of how many were offline. It now counts, and pluralises.

## Verification

TypeScript clean, 64/64 tests, application lint clean, static build and all five render smoke checks passing.

Browser-verified across eight screens in both themes: contrast 2 low samples in light and 3 in dark, no horizontal overflow on any screen at 1520 px or 375 px, no nested panels, no console errors, and the theme control switching correctly between light, dark and system.

## Known limits

The contrast sweep is a computed-style check against the nearest painted ancestor; it does not evaluate text over images or gradients. No screen-reader or keyboard-only pass was run. The dark palette has not been reviewed on a calibrated display.
