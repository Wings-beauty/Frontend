# Design System

## Design Source

The current design system is implemented primarily in `src/index.css` using Tailwind CSS v4 `@theme` tokens, global base rules, and a small set of custom utilities.

Before redesigning screens or changing major UI patterns, remember that the Lazyweb MCP/plugin is available in this Codex environment. Use Lazyweb for design research, screenshots, critique, references, and improvement ideas when a task benefits from comparison with real product UI patterns.

## Brand Feel

WINGS uses a clean, quiet beauty-service visual language:

- warm off-white page backgrounds, white surfaces, and deep brown text establish a cosmetic/editorial feel without looking heavy.
- Tone-specific colors map personal color seasons to soft spring/summer/autumn/winter accents.
- Moderately rounded cards, airy spacing, low borders, and restrained shadows create a polished consumer-app surface.
- The UI is optimized around a centered mobile-width frame while still rendering in desktop browser contexts.

## Typography

Font family: `Pretendard` loaded from CDN in `src/index.css`.

Weights loaded:

| Weight | File       |
| ------ | ---------- |
| 100    | Thin       |
| 200    | ExtraLight |
| 300    | Light      |
| 400    | Regular    |
| 500    | Medium     |
| 600    | SemiBold   |
| 700    | Bold       |
| 800    | ExtraBold  |
| 900    | Black      |

Base sizing:

```css
:root {
  --app-font-size: 15px;
  --app-frame-width: min(100vw, 32rem);
}
```

Responsive adjustments:

- Small viewports: reduce max base size to 16px.
- Tablet/tall viewports: frame width can expand up to 34rem.
- Large desktop: frame width narrows to keep the app mobile-composed.

## Color System

### Neutral / Brand Foundation

| Token       | Hex       | Usage                                             |
| ----------- | --------- | ------------------------------------------------- |
| `cream`     | `#fbf5ec` | Warm page wash and legacy soft background.        |
| `cream-50`  | `#fffdf9` | Lightest surface tint.                            |
| `cream-100` | `#fbf5ec` | Soft panel tint.                                  |
| `cream-200` | `#eadfd2` | Borders and low-emphasis dividers.                |
| `cream-300` | `#d8cabb` | Warm UI accents.                                  |
| `cream-400` | `#c7b5a4` | Secondary warm accent.                            |
| `cream-500` | `#ad9784` | Mid-tone warm emphasis.                           |
| `cream-600` | `#8e7867` | Strong warm emphasis.                             |
| `cream-700` | `#715d50` | Dark warm accent.                                 |
| `cream-800` | `#55443b` | Deep warm accent.                                 |
| `cream-900` | `#3f322d` | Darkest warm accent.                              |
| `cream-950` | `#241d1a` | Near-brown depth tone.                            |
| `brown-200` | `#a8958c` | Muted text, subtle controls.                      |
| `brown-300` | `#725c53` | Secondary text and labels.                        |
| `brown-400` | `#563f39` | Brand text and medium emphasis.                   |
| `brown-600` | `#2b211f` | Primary action background and high-emphasis copy. |
| `ivory`     | `#eadfd2` | Soft decorative border/fill accent.               |

### Accent Colors

| Token    | Hex       | Usage                                     |
| -------- | --------- | ----------------------------------------- |
| `pink`   | `#e9b7aa` | Warm cosmetic accent.                     |
| `purple` | `#d5c9e8` | Cool soft accent and analysis decoration. |
| `green`  | `#6fae8c` | Success and positive feedback.            |
| `red`    | `#d96a6a` | Error/destructive/negative emphasis.      |

### Personal Color Season Tokens

| Token         | Hex       | Season            |
| ------------- | --------- | ----------------- |
| `tone-spring` | `#ffb7a1` | Spring warm tone. |
| `tone-summer` | `#d7e8fa` | Summer cool tone. |
| `tone-autumn` | `#d9a98f` | Autumn warm tone. |
| `tone-winter` | `#e2d8ff` | Winter cool tone. |

## Layout Rules

Global layout rules from `src/index.css`:

- `html` uses `min-height: 100dvh` and smooth scrolling.
- `body` is reset to zero margin and inherits the app text color.
- `#root` is full width and full dynamic viewport height.
- Media queries tune the app font scale and frame width for compact, tablet, and large desktop contexts.

## Interaction Defaults

- Buttons use pointer cursor; disabled buttons use `not-allowed`.
- Images, videos, canvas, and SVGs are block-level and max-width constrained.
- Form controls inherit font settings.
- Links inherit color and remove text decoration.
- Lists reset padding, margin, and list styling.
- Scrollbars use thin brown-tinted thumbs:
  - Thumb: `rgba(122, 98, 92, 0.14)`
  - Hover thumb: `rgba(122, 98, 92, 0.3)`

## Animations

Custom welcome utilities:

| Class              | Behavior                                         |
| ------------------ | ------------------------------------------------ |
| `welcome-fade-in`  | 700ms ease-out, opacity to 0.8, translateY to 0. |
| `welcome-fade-out` | 600ms ease-in, opacity to 0, translateY -8px.    |

## Component Guidance

- Keep primary CTAs in `brown-600` with white text unless a screen has a strong reason to use a seasonal accent.
- Use warm off-white for page backgrounds and white for surfaces. Keep `cream-200`/`ivory` for low-contrast borders.
- Prefer `.app-page`, `.app-panel`, `.app-card`, `.app-eyebrow`, `.app-copy`, and `.app-input` for repeated page structure before adding one-off Tailwind compositions.
- Use tone tokens for diagnosis results, tags, and product matching affordances.
- Favor mobile-first composition; desktop should usually center or comfortably frame the mobile app surface rather than stretching content across the screen.
- Use Lazyweb MCP for reference checks when improving onboarding, recommendation cards, product detail sheets, admin tables, or profile/history flows.

## shadcn/ui Guidance

Use the local shadcn-style primitives in `src/components/ui` before creating one-off UI elements. Current primitives include buttons, cards, dialogs, badges, avatar, inputs, and textarea.

- Prefer shadcn/ui composition for repeated interface patterns such as cards, modals/dialogs, form fields, admin panels, and list item actions.
- Keep shadcn components aligned with the WINGS token system in `src/index.css`; do not introduce unrelated color palettes or radius scales.
- When adding a new primitive, place it under `src/components/ui` and keep the API small, typed, and consistent with existing components.
- For page-specific layout, compose shadcn primitives with Tailwind utility classes rather than hardcoding standalone CSS.
- Use Lazyweb MCP references to compare patterns, then implement with shadcn primitives where the pattern maps cleanly.

## Lazyweb MCP Reminder

Lazyweb is available in this environment and should be considered part of the design workflow:

- Use Lazyweb quick references for examples of onboarding, beauty recommendation, profile, saved items, and support/admin screens.
- Use Lazyweb design research before making broad layout or navigation changes.
- Use Lazyweb design improve when a local screen exists and needs critique against real-world UI references.
- Keep any Lazyweb-driven changes reconciled with this token system rather than adding one-off colors.
