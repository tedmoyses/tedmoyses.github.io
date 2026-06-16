# Visual Enhancement Plan — "Refined Minimal Plus"

## Objective

Add visual character to the current minimal design without adding JS frameworks, CSS frameworks, or external dependencies. Target: ~100 extra lines of CSS, single self-hosted font file.

## Deliverables

### 1. Self-Host Inter Variable Font

- Download `Inter[wght].woff2` from https://rsms.me/inter/
- Save to `src/assets/fonts/Inter[wght].woff2`
- CSS `@font-face` declaration
- Apply to headings (`h1-h3`, `.nav-brand`, `.hero-subtitle`)
- Body text stays on system font stack

Trade-off: +1 HTTP request, ~60KB. Justified by significant visual lift.

### 2. Color Palette Additions

```
--accent-bg: color-mix(in srgb, var(--accent) 8%, transparent)
--accent-gradient: linear-gradient(135deg, var(--accent), #7c3aed)
--warm: #d97706
```

`color-mix()` is widely supported in all modern browsers. Pure CSS, no preprocessor needed.

### 3. Hero Section

- Subtle radial gradient background (`radial-gradient(circle at 50% 0%, var(--accent-bg) 0%, transparent 70%)`)
- Heading gets gradient text via `background-clip: text`
- CSS `@keyframes fadeIn` entrance animation
- Theme transition: `body { transition: background 0.3s, color 0.3s }`

### 4. Timeline Decoration (History Page)

- Each `.timeline-entry` gets `::before` pseudo-element circle dot
- Dot positioned on the left border line
- Matches accent color, gives the timeline visual weight

### 5. Project Cards (Projects Page)

- `.project` entries get `border: 1px solid var(--border)` + `border-radius: 8px` + `padding: 1.25rem`
- Subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` 
- Hover: `translateY(-2px)` + shadow deepen
- Transitions on all transforms

### 6. Blog Entry Accent Bar

- `.blog-entry` gets `border-left: 3px solid var(--accent)` + `padding-left: 1.25rem`
- Removes bottom border (was separator), uses left accent instead

### 7. Link Underlines

- Replace `text-decoration: underline` with `background-image` gradient technique
- Creates thinner, custom-colored underline that respects descenders
- `background: linear-gradient(to right, var(--accent), var(--accent)) no-repeat bottom 1px left / 0% 1px`
- `background-size: 100% 1px` on hover

### 8. Nav Link Hover

- `::after` pseudo-element on `.nav-links a`
- Underline grows from center on hover via `scaleX(0)` → `scaleX(1)` with `transform-origin: center`
- Gives nav a polished, intentional feel

### 9. Dividers

- Gradient horizontal rule between major sections
- `hr` style or `::after` on `.content-section`: `height: 1px; background: linear-gradient(to right, transparent, var(--border), transparent)`

## CSS Delta Estimate

| Addition | Lines | Impact |
|----------|-------|--------|
| `@font-face` + font vars | 15 | High |
| Hero gradient + keyframes | 20 | High |
| Timeline dots | 12 | Medium |
| Project cards | 18 | Medium |
| Blog accent bar | 8 | Medium |
| Gradient text | 6 | Medium |
| Link underlines | 12 | Low |
| Color vars + dark tweaks | 8 | Medium |
| Nav hover effect | 8 | Low |
| Dividers | 6 | Low |
| **Total** | **~113 lines** | |

## Constraints

- Zero new JS
- Zero new npm dependencies
- Zero external HTTP requests (font is self-hosted)
- Must still work with `prefers-color-scheme: dark`
- No `!important`
- No HTML changes required (CSS-only additions)
