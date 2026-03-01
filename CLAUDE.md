# CLAUDE.md — PitCrew Developer Guide

You are a senior software architect and engineer. Your task is to build and maintain PitCrew.  PitCrew is a Jekyll-based website template for FIRST Robotics teams. It deploys to GitHub Pages as a static site. No backend. No database. No login. Also read `SPEC.md` — it is the authoritative product document. This file gives you architectural and engineering instructions on top of it.

---

## Common Commands

```bash
# Local preview (primary dev loop)
bundle exec jekyll serve
# → http://localhost:4000

# Rebuild Tailwind CSS (only needed when editing main.css itself)
npm run build:css

# Watch CSS changes while editing main.css
npm run watch:css
```

**What triggers a rebuild:**
- Content / layout changes → just refresh the browser (Jekyll auto-reloads)
- `_config.yml` changes → restart `jekyll serve`
- `main.css` changes → run `npm run build:css`, then restart

---

## CSS Architecture — The Critical Constraint

### Two CSS systems, different rules

**1. Main site CSS** — compiled Tailwind output at `assets/css/output.css`
- Tailwind utility classes (`flex`, `gap-4`, `text-sm`, etc.) come from here
- CSS custom properties (`--color-primary`, `--color-text`, etc.) are injected by Jekyll from `_config.yml` at build time and override anything in output.css
- Content scanner paths are in `tailwind.config.js` — new utility classes are only generated if they appear in scanned files
- **`npm run build:css` does NOT run locally in this workflow** — it runs in GitHub Actions on every push

**2. Wizard CSS** — `_layouts/wizard.html` has a self-contained `<style>` block
- The wizard layout does NOT import `output.css`
- All styling is inline in the wizard layout's `<style>` block
- CSS vars use short names: `--p` (primary), `--s` (secondary), `--sh` (secondary highlight), `--bg`, `--surf`, `--text`, `--muted`, `--border`, `--ok` (success), `--bad` (danger)
- These are injected from `_config.yml` by Liquid at the top of the wizard layout

### Color system

Colors are defined once in `_config.yml` under `theme.colors`. Jekyll injects them into every page's `<head>` as CSS custom properties:
```
--color-primary, --color-primary-highlight, --color-primary-darkest
--color-secondary, --color-secondary-highlight
--color-success, --color-info, --color-warning, --color-danger
--color-background, --color-surface, --color-text, --color-text-muted, --color-border
```
**Never hardcode hex values in templates.** Always use `var(--color-*)`.

### Safe Tailwind classes (already compiled)

Standard utilities like `flex`, `grid`, `hidden`, `block`, `gap-*`, `p-*`, `m-*`, `text-sm`, `font-bold`, `rounded`, `border` are safe to use in layout files. Arbitrary values like `text-[var(--color-text-muted)]` and class variants like `bg-primary/10` require the JIT compiler to have seen them — only use them if confident they appear in output.css already or if the CSS build will run.

---

## Key File Map

```
_config.yml              ← ALL site settings: colors, features, navigation, team info
_data/
  team.yml               ← Team members
  mentors.yml            ← Mentors
  sponsors.yml           ← Sponsors (tier: platinum|gold|silver|bronze)
  awards.yml             ← Awards won
  events.yml             ← Events (type: competition|outreach|event)
  alumni.yml             ← Graduated members (auto-managed if alumni_auto_archive: true)
  docs_navigation.yml    ← Sidebar nav for the /docs/ section

_layouts/
  default.html           ← Base layout (includes startup wizard redirect)
  home.html              ← Homepage with events carousel (JS-driven)
  docs.html              ← Docs layout with sidebar + breadcrumb + TOC
  wizard.html            ← Standalone wizard layout (NO output.css dependency)
  post.html, page.html, season.html, archive.html

_includes/
  components/            ← Reusable components (event-card, sponsor-grid, etc.)
  sections/              ← Page-specific sections (home-events, etc.)
  navigation.html        ← Top nav bar
  footer.html

_docs/                   ← Jekyll collection for /docs/ pages (layout: docs)
_posts/                  ← Blog posts (YYYY-MM-DD-title.md)
seasons/                 ← Season pages (seasons/2025-2026/index.md)

assets/
  css/
    main.css             ← Source CSS (Tailwind @layer base, component classes)
    output.css           ← Compiled output — DO NOT edit directly
  js/
    wizard.js            ← All wizard logic (~1100 lines)
    search.js            ← Site search
  images/                ← Team photos, logos, sponsor logos
  models/                ← 3D robot models (GLTF/GLB)

wizard.md                ← Entry point for /wizard/ (layout: wizard, minimal front matter)
tailwind.config.js       ← Tailwind content scan paths + color theme extension
```

---

## Patterns & Conventions

### Adding a new doc page
1. Create `_docs/your-page.md` with front matter: `layout: docs`, `title`, `description`, `permalink: /docs/your-page/`, `parent: Section Name`
2. Add an entry to `_data/docs_navigation.yml` under the right section

### Breadcrumb in docs
The breadcrumb `<ol>` needs `list-none pl-0 mb-0` to reset global `ul/ol` base styles. Each `<li>` needs `mb-0`. Without this, decimal markers and margin cause visual overlap.

### Events — date filtering is client-side
Events are sorted and split into past/future by JavaScript at render time using today's date. The Liquid layer only passes all events as a JSON blob via `jsonify`. Do not try to do date comparison in Liquid for the home page carousel — timezone handling is unreliable.

### Wizard data flow
1. Jekyll injects all `_config.yml` values and `_data/*.yml` content into `window.WIZARD_DATA` via `jsonify` in `_layouts/wizard.html`
2. `wizard.js` reads this on load and populates the `state` object
3. On Save Progress / final download, `wizard.js` regenerates YAML strings from `state` and packages them into a zip via JSZip (CDN)
4. The downloaded zip matches the repo folder structure so files can be dropped in directly

### startup_wizard flag
- `true` → `_layouts/default.html` injects a redirect script that sends non-wizard visitors to `/wizard/`
- Completion is tracked in `localStorage` (`pitcrew_wizard_done`) to prevent redirect loops
- Mid-wizard saves always keep `startup_wizard: true`; final download respects the "Skip wizard on startup" checkbox

---

## What NOT to Do

- **Never edit `assets/css/output.css` directly.** It is compiler output and will be overwritten on the next build.
- **Never add Tailwind utility classes or `output.css` imports to `_layouts/wizard.html`.** The wizard must work without any compiled CSS.
- **Never hardcode brand colors.** Use `var(--color-primary)` etc. so teams can change colors via `_config.yml`.
- **Never commit without being asked.** Always present changes and let the user decide when to commit/push.
- **Never auto-push.** Pushing to GitHub triggers a live deployment.
- **Never run `npm run build:css` as part of a normal content change.** It's only needed for structural CSS changes to `main.css`.
- **Never use inline Python execution scripts locally** — the GitHub Actions workflows handle all asset conversion (CAD → GLTF, SPICE → SVG, image optimization).

---

## Workflow Preferences

- Present changes before implementing them when scope is unclear or more than 2-3 files will change — use plan mode
- Minimal changes: fix only what was asked; don't clean up surrounding code
- No comments added unless the logic is genuinely non-obvious
- No docstrings, no type annotations added to code not being changed
- If a Tailwind class might not be in `output.css`, prefer using inline `style=""` with CSS vars over adding a new arbitrary Tailwind class
- When unsure whether a change is safe (destructive git ops, pushing, force-anything), ask first

---

## Engineering Rules

**Code reuse & structure**
- Keep HTML DRY via `_includes/` components. Break repeated markup into a partial — but stop before the abstraction becomes harder to understand than the repetition.
- Keep JS and CSS in external files so browsers can cache them. The only exceptions are the dark-mode init script and critical above-the-fold CSS, which must be inline in `<head>` to prevent flash of unstyled content.
- Use Collections for non-post content (seasons, docs, team profiles). Keep blog posts in `_posts/`; everything else in its appropriate collection.

**Performance**
- Load only the JS needed for the current view. Use `defer` on all non-critical scripts. Gate feature-specific code (gallery lightbox, circuit viewer, docs TOC) behind an element existence check rather than running it on every page.
- Use `loading="lazy"` on all off-screen images. Set explicit `width` and `height` on every `<img>` to prevent cumulative layout shift (CLS).
- Use `<picture>` or `srcset` for responsive images — serve the right size for the viewport.
- Prefer self-hosted fonts or system font stacks. If using an external font CDN, add `<link rel="preconnect">` and set `font-display: swap` in CSS to avoid render-blocking.
- Minify HTML, CSS, and JS for production. The GitHub Actions deploy pipeline handles this — do not manually minify source files.

**Accessibility & semantics**
- Use semantic HTML5 elements (`<article>`, `<nav>`, `<section>`, `<header>`, `<main>`) — they are free SEO and screen-reader benefit.
- All interactive elements must be keyboard-reachable. ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`) must stay in sync with actual JS state — a static `aria-expanded="false"` that never changes when a menu opens is worse than no attribute.
- Design mobile-first. Build for the smallest viewport and layer up. Never hide meaningful content from mobile that desktop users can see.

**Security**
- Never assign `innerHTML` with a value sourced from user input or external data. Use `textContent` for plain text; build DOM nodes programmatically for anything structured.
- Keep `Gemfile.lock` and `package-lock.json` current. Review dependency updates regularly to stay ahead of known vulnerabilities.

**Code quality**
- Use ESLint and Prettier for consistent JS/CSS style. Config lives in the repo root; don't override it per-file.
- Use `{% include_relative %}` when the included file's path should be relative to the including file's location — more predictable than `{% include %}` for nested content structures.

*End of CLAUDE.md*
