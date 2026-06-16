# Site Redesign Implementation Plan

## Overview

Replace hand-built HTML + Glomr (PHP 7, EOL) with 11ty (Eleventy v3) static site generator. Modern design, minimal dependencies, GitHub Actions auto-deploy.

## Key Decisions

- **SSG**: 11ty (Eleventy) v3 — zero runtime JS, Nunjucks templates, Markdown blog
- **Fonts**: System font stack (`system-ui, -apple-system, sans-serif`) — zero HTTP requests
- **Dark mode**: Pure CSS via `prefers-color-scheme` — zero JS
- **Favicon**: Inline SVG data URI — zero file requests
- **Social icons**: Inline SVGs (simple hand-crafted) — zero file requests
- **Deploy**: GitHub Actions on push to master — auto-builds and deploys to Pages
- **Dev server**: `npx @11ty/eleventy --serve` — live reload via Browsersync

## URL Structure

| Old | New |
|-----|-----|
| `/index.html` | `/` |
| `/projects.html` | `/projects/` |
| `/history.html` | `/history/` |
| `/thoughts.html` | `/thoughts/` (blog listing) |
| `/error.html` | `/404.html` |

## File Structure

```
tedmoyses.github.io/
├── src/
│   ├── _includes/
│   │   ├── layout.njk        # base HTML shell
│   │   └── nav.njk           # nav bar partial
│   ├── assets/
│   │   ├── css/
│   │   │   └── site.css
│   │   └── js/
│   │       └── site.js
│   ├── blog/
│   │   └── posts/
│   │       └── 2018-09-24-hmm.md   # existing post migrated
│   └── pages/
│       ├── index.njk
│       ├── history.njk
│       ├── projects.njk
│       └── thoughts.njk             # blog listing
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions
├── eleventy.config.js
├── package.json
└── .gitignore
```

## Implementation Order

### 1. Foundation (setup)
- `package.json` — `npm init`, `npm install -D @11ty/eleventy`
- `.gitignore` — ignore `node_modules/` and `_site/`
- `eleventy.config.js` — passthrough copy for assets, dir config

### 2. Base Templates
- `src/_includes/layout.njk` — HTML shell with `<head>`, nav include, content slot, script
- `src/_includes/nav.njk` — responsive nav: brand, toggle button (mobile), links

### 3. CSS (`src/assets/css/site.css`)
- Custom properties on `:root` for colors, spacing, typography
- System font stack
- Dark mode via `@media (prefers-color-scheme: dark)`
- Light + dark color palettes (background, text, accent, muted, border)
- Container: `max-width: 42rem`, centered
- Responsive nav: flexbox, hamburger on mobile
- `.history` timeline styles (migrated)
- `.blog-entry` styles (migrated)
- Typography: `line-height: 1.7`, proper heading hierarchy
- No `!important`, no preprocessor, no framework

### 4. JS (`src/assets/js/site.js`)
- Nav toggle (click hamburger → toggle `show` class on nav-links)
- No console.log, no active-link highlighting (handled by clean URL structure)
- Target: ~8 lines

### 5. Page Templates
Each page gets a `.njk` file with the content migrated from the current HTML:

- `src/pages/index.njk` — About section, social links
- `src/pages/history.njk` — Timeline (Early, Later, Career, Current)
- `src/pages/projects.njk` — Project listings (Glomr, Paper plane, Charbohydrate, Questr)
- `src/pages/thoughts.njk` — Blog listing page (loops over `collections.posts`)

### 6. Blog
- Migrate existing 2018 post to `src/blog/posts/2018-09-24-hmm.md`
- Directory data file `src/blog/posts/posts.json` with `layout: "post.njk"` and `permalink: "/blog/{{ title | slug }}/"`
- Create `src/_includes/post.njk` layout for individual posts
- `thoughts.njk` lists posts with date, title, excerpt

### 7. GitHub Actions
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx @11ty/eleventy
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

### 8. Content Migration & Cleanup
- Move all content from old HTML → new templates
- Delete old: `index.html`, `projects.html`, `history.html`, `thoughts.html`, `error.html`, `tags`
- Files to keep: `.git/`, `.gitignore`, `.opencode/`, SVG images (or replace with inline)

## Design Spec

### Color Palette

Light mode:
- `--bg: #fafafa`
- `--text: #1a1a1a`
- `--accent: #2563eb` (blue-600)
- `--muted: #6b7280`
- `--border: #e5e7eb`

Dark mode:
- `--bg: #111827`
- `--text: #f3f4f6`
- `--accent: #60a5fa` (blue-400)
- `--muted: #9ca3af`
- `--border: #374151`

### Typography
- Base: `system-ui, -apple-system, sans-serif`
- Body: `1rem / 1.7`
- H1: `2.5rem / 1.2`
- H2: `1.75rem / 1.3`
- H3: `1.25rem / 1.4`

### Layout
- Container: `max-width: 42rem`, `margin: 0 auto`, `padding: 0 1.5rem`
- Content area: `padding: 2rem 0`
- Nav: sticky top, flexbox with brand left + links right, hamburger on mobile

## Workflow Summary

```sh
# Dev (live preview)
npm run dev        # → localhost:8080

# Build (one-shot)
npm run build      # → _site/

# Deploy
git push           # GitHub Actions builds + deploys automatically
```

## Post-Implementation Verification

1. Run `npm run build` — confirm no errors
2. Open `_site/index.html` locally — check all pages render
3. Check dark mode (toggle OS preference)
4. Check mobile responsive (resize to <640px)
5. Verify all links work (nav, social, blog posts)
6. Run `npx @11ty/eleventy --dryrun` to verify no missing files
