# PitCrew — Product Specification

**Version:** 1.1
**Target:** GitHub Pages (static), zero-install for end users
**Stack:** Jekyll 4.3+, Tailwind CSS 3.4+, GitHub Actions
**Storage:** YAML flat files in `_data/` and `_config.yml` — no database, no backend

---

## 1. Overview

PitCrew is a free, open-source website template for competitive robotics teams (FTC, FRC, VEX, FLL). A team forks the repository, runs a setup wizard or edits two config files, and immediately has a professional public website — no web development experience required.

The site is entirely static. All customization is through YAML files and `_config.yml`. Deployment is fully automated via GitHub Actions on every push to `main`. Teams own their data; there is no PitCrew cloud service.

**Primary users:**
- Student members managing the website (content editors)
- Business/media subteam members (blog posts, sponsor info)
- Mentors overseeing configuration

**Non-users (by design):** competition judges, sponsors, recruits are *readers*, not editors.

---

## 2. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Static site generator | Jekyll 4.3+ | GitHub Pages native, no build server needed |
| CSS framework | Tailwind CSS 3.4 (JIT) | Utility-first, purged output, team-color theming via CSS vars |
| Color system | CSS custom properties | Injected from `_config.yml` at build time; no CSS recompile for color changes |
| Automation | GitHub Actions | Alumni archival, image optimization, CAD/circuit conversion, deployment |
| Wizard zip | JSZip (CDN) | Client-side zip generation; no server, no file upload |
| 3D viewer | Google Model Viewer | GLB/GLTF display in-browser, no plugin |

### Critical constraint: no local CSS build

`npm run build:css` compiles Tailwind into `assets/css/output.css`. This runs automatically in GitHub Actions on every push — teams never run it locally. The wizard layout is a special case: it is fully self-contained with no dependency on `output.css`.

---

## 3. Configuration System

Everything a team customizes lives in two places:

### `_config.yml` — site-level settings

```yaml
title:       "Team Name Robotics"
description: "Short tagline"
url:         ""        # blank for GitHub Pages root
baseurl:     ""        # set to /repo-name for subpath deploy

site:
  team_name:      "Team Name"
  team_number:    "12345"
  program:        "FTC"          # FTC | FRC | VEX | FLL
  current_season: "2025-2026"
  logo:           "/assets/images/logo.png"

theme:
  colors:
    primary:           "#003974"
    primary_highlight: "#002855"
    primary_darkest:   "#001a3d"
    secondary:         "#F57E25"
    secondary_highlight: "#d96a1f"
    success: "#28a745"
    info:    "#17a2b8"
    warning: "#f0b37e"
    danger:  "#dc3545"
    sponsor_platinum: "#9ca3af"
    sponsor_gold:     "#eab308"
    sponsor_silver:   "#d1d5db"
    sponsor_bronze:   "#92400e"
  dark_mode: true

startup_wizard: true    # true = auto-redirect new visitors to /wizard/

features:
  blog:                true
  docs:                true
  cad_viewer:          true
  circuit_viewer:      true
  code_links:          true
  data_visualizations: true
  alumni_auto_archive: true
  accessibility_toggle: true
  search:              true

navigation:
  - title: Home
    url: /
  - title: About
    url: /about/
  # ...

socials:
  instagram: ""
  github:    ""
  youtube:   ""
  twitter:   ""
  email:     ""

fundraising:
  enabled: false
  url:     ""
  text:    "Support Our Team"
```

### `_data/*.yml` — content data

| File | Contents |
|---|---|
| `team.yml` | Team members: name, role, grade, graduation_year, bio, image, skills[] |
| `mentors.yml` | Mentors: name, role, bio, image, organization |
| `sponsors.yml` | Sponsors: name, tier (platinum/gold/silver/bronze), logo, url |
| `awards.yml` | Awards: name, event, season, description |
| `events.yml` | Events: name, date (YYYY-MM-DD), location, type (competition/outreach/event), description, url |
| `alumni.yml` | Alumni: name, role, graduation_year, seasons[], now, bio, image |
| `docs_navigation.yml` | Sidebar navigation for the /docs/ section (sections with title + items[]) |

---

## 4. Color System

Colors are defined once in `_config.yml` under `theme.colors`. Jekyll injects them into every page `<head>` as inline CSS custom properties, overriding any compiled values in `output.css`. All templates use `var(--color-*)` — never hardcoded hex values.

Available variables:
```
--color-primary           --color-primary-highlight    --color-primary-darkest
--color-secondary         --color-secondary-highlight  --color-secondary-glow
--color-success           --color-info                 --color-warning    --color-danger
--color-background        --color-surface
--color-text              --color-text-muted           --color-border
--color-link              --color-link-hover
--color-sponsor-platinum  --color-sponsor-gold  --color-sponsor-silver  --color-sponsor-bronze
```

Dark mode is toggled via the `.dark` class on `<html>`. The accessibility toggle can also switch to a high-contrast palette.

---

## 5. Feature Set

### 5.1 Pages

| URL | Layout | Description |
|---|---|---|
| `/` | home | Hero, current season cards, awards, events carousel, sponsors, join CTA |
| `/about/` | page | Team story, subteam breakdown, join section |
| `/season/` | season | Current season overview, robot, results, outreach |
| `/seasons/{YYYY-YYYY}/` | season | Archived seasons |
| `/awards/` | page | All awards, organized by season |
| `/sponsors/` | page | Sponsor tiers with logos |
| `/news/` | archive | Blog post listing |
| `/news/{year}/{month}/{day}/{slug}/` | post | Individual blog posts |
| `/contact/` | page | Contact form / info |
| `/handbook/` | page | Team handbook (policies, expectations, schedule) |
| `/alumni/` | page | Auto-archived graduated members |
| `/judge-mode/` | page | Printer-friendly summary for competition judges |
| `/docs/` | docs | Documentation index |
| `/docs/{page}/` | docs | Individual doc pages with sidebar + breadcrumb + auto-TOC |
| `/wizard/` | wizard | Setup wizard (standalone, no output.css dependency) |
| `/search/` | page | Site-wide search (JSON index) |

### 5.2 Navigation

Top navigation bar is configured in `_config.yml` under `navigation`. Order matters — items appear left to right. The wizard's Navigation step allows drag reordering. Mobile nav collapses to a hamburger.

### 5.3 Events Carousel (home page)

Events on the home page are displayed as a date-aware carousel:
- All events from `_data/events.yml` are injected as JSON via Liquid
- Client-side JavaScript splits events into **past** (date < today) and **future** (date ≥ today), both sorted ascending by date
- Initial view: first page of future events ("Upcoming Events")
- Navigation: left/right arrow buttons; left from future page 0 jumps to last past page; right from last past page jumps to future page 0
- Page size: 3 cards per page
- Dot indicators show all pages grouped by past/future, with a divider between groups
- Heading changes between "Upcoming Events" and "Past Events" based on the active group
- Past event cards render at 70% opacity
- Date comparison uses local date (YYYY-MM-DD) to avoid timezone offset issues

### 5.4 Documentation Section

`/docs/` is a Jekyll collection (`_docs/*.md`) with a dedicated `docs` layout that provides:
- Left sidebar: section/item navigation driven by `_data/docs_navigation.yml`
- Right sidebar: auto-generated table of contents (JS, based on heading structure)
- Breadcrumb: Docs → Parent Section → Page Title
- Breadcrumb `<ol>` resets global list styles (`list-none pl-0 mb-0`) and each `<li>` uses `mb-0` to prevent overlap
- Previous/Next links (if `prev_page`/`next_page` set in front matter)

Current doc pages: Introduction, Quick Start Guide, Site Configuration, Team Handbook, Robot Overview, Programming Guide, Electrical Systems, CAD Resources, Safety Guidelines, Competition Checklist, Outreach Guide, Useful Links, Glossary.

### 5.5 Blog / News

Posts live in `_posts/YYYY-MM-DD-title.md` with `layout: post`. The news listing is at `/news/`. Posts support: title, date, author, categories, tags, description, cover image.

### 5.6 3D Robot Viewer

When `features.cad_viewer: true`, teams can include a Google Model Viewer component:
```liquid
{% include components/robot-viewer.html
   model_src="/assets/models/robot.glb"
   alt_text="Robot description"
%}
```
A GitHub Action converts CAD files (STEP/STL/IGES) to GLB automatically on push.

### 5.7 Circuit Viewer

When `features.circuit_viewer: true`, a GitHub Action converts KiCad/SPICE schematics to SVG for inline display.

### 5.8 Alumni Auto-Archive

When `features.alumni_auto_archive: true`, a scheduled GitHub Action runs at the start of each season. It compares `graduation_year` for each team member against the current season year and moves graduated members from `_data/team.yml` to `_data/alumni.yml`.

### 5.9 Search

When `features.search: true`, a `search.json` index is generated at build time. Client-side `assets/js/search.js` powers the search page at `/search/`.

### 5.10 Accessibility

When `features.accessibility_toggle: true`, a toggle button appears to switch to a high-contrast colour palette and/or reduced-motion mode. Preference is stored in `localStorage`.

### 5.11 Judge Mode

`/judge-mode/` is a printer-friendly, focused summary page for competition judges. It highlights robot achievements, awards, and engineering documentation without full site navigation.

---

## 6. Setup Wizard

The wizard is the recommended way to configure a new PitCrew site. It runs entirely in the browser — no server, no file uploads.

### 6.1 Access

- **Auto-launch:** When `startup_wizard: true` in `_config.yml`, `_layouts/default.html` injects a script that redirects non-wizard pages to `/wizard/` for visitors who haven't completed setup (tracked via `localStorage` key `pitcrew_wizard_done`)
- **Manual access:** Always available at `/wizard/`

### 6.2 Architecture

The wizard is isolated from the main site's CSS:

| | Main site | Wizard |
|---|---|---|
| Layout file | `_layouts/default.html` | `_layouts/wizard.html` |
| CSS source | `assets/css/output.css` (Tailwind compiled) | Inline `<style>` block in wizard layout |
| CSS vars | `--color-*` (long form) | `--p`, `--s`, `--sh`, `--bg`, `--surf`, `--text`, `--muted`, `--border`, `--ok`, `--bad` (short form) |
| JS | Various | `assets/js/wizard.js` (~1100 lines) |
| Zip library | — | JSZip from CDN (`cdnjs.cloudflare.com`) |

Data is injected from Jekyll into `window.WIZARD_DATA` via Liquid `jsonify`:
```html
<script>
window.WIZARD_DATA = {
  config: { title, description, site, theme, features, navigation, socials, fundraising },
  team:     [...],
  mentors:  [...],
  sponsors: [...],
  awards:   [...],
  events:   [...]
};
</script>
```

### 6.3 Steps (11 steps + review)

| Step | What it configures |
|---|---|
| 0. Welcome | Checklist of what to prepare; time estimate (2–3 hours); save-progress note |
| 1. Team Identity | `_config.yml` → title, description, site.* |
| 2. Brand Colors | `_config.yml` → theme.colors.*; live preview updates CSS vars in real time |
| 3. Features | `_config.yml` → features.* |
| 4. Social Links | `_config.yml` → socials.* |
| 5. Navigation | `_config.yml` → navigation (with ▲/▼ reorder) |
| 6. Team Members | `_data/team.yml` (CRUD via slide-out panel) |
| 7. Mentors | `_data/mentors.yml` |
| 8. Sponsors | `_data/sponsors.yml` |
| 9. Awards | `_data/awards.yml` |
| 10. Events | `_data/events.yml` |
| 11. Review & Download | Summary of all changes; "Skip wizard on startup" checkbox |

### 6.4 Save Progress (mid-wizard)

A **Save Progress** button appears in the footer on steps 1–10 (not on Welcome or Review). Clicking it:
- Generates `pitcrew-progress.zip` with all current state baked into correct file paths
- Keeps `startup_wizard: true` in the generated `_config.yml`
- Includes a README inside the zip explaining what to do

Teams copy the zip contents into their repo and commit. On next visit to `/wizard/`, step 1 renders but all saved data is already populated (because it comes from the files Jekyll reads).

### 6.5 Final Download

On the Review step, the **"Skip wizard on startup"** checkbox (checked by default) controls whether `startup_wizard: false` or `true` is written into the downloaded `_config.yml`. Clicking **Download pitcrew-config.zip** generates the full config archive and sets `pitcrew_wizard_done` in `localStorage`.

### 6.6 Live Color Preview

The color step updates CSS vars directly on `document.documentElement.style` as the user picks colors. Because the wizard layout uses the same short-form CSS vars (`--p`, `--s`, etc.) for its own nav bar, buttons, and cards, the preview is immediate — the wizard UI itself reflects the chosen colors.

HSL math utilities (`hexToHsl`, `hslToHex`, `darken`) auto-derive `primary_highlight`, `primary_darkest`, and `secondary_highlight` from the base primary/secondary colors.

### 6.7 YAML Generation

YAML files are generated from `state` in `wizard.js` using template literals. Key helpers:
- `ys(val)` — always double-quotes strings (prevents YAML parsing issues)
- `yb(val)` — outputs `true` or `false` as unquoted booleans
- `generateConfig(startupWizard)` — generates full `_config.yml` content
- Per-model serializers: `generateTeamYml()`, `generateMentorsYml()`, etc.

---

## 7. Deployment

### GitHub Pages (standard path)

1. Fork the repository
2. Settings → Pages → Source: GitHub Actions
3. Run the Setup Wizard or edit `_config.yml` + `_data/*.yml` directly
4. Push changes → GitHub Actions builds and deploys automatically

**First-time setup (after wizard download):**
```bash
# Extract pitcrew-config.zip into repo root
git add _config.yml _data/
git commit -m "Initial site setup via wizard"
git push
```

### GitHub Actions workflows

| Workflow | Trigger | Does |
|---|---|---|
| `deploy.yml` | Push to `main` | `npm run build:css` → `bundle exec jekyll build` → deploy to Pages |
| `alumni-archival.yml` | Cron (yearly) + manual | Moves graduated members to alumni.yml |
| `optimize-images.yml` | Push with image changes | Compresses images in assets/images/ |
| `convert-assets.yml` | Push with CAD/schematic changes | Converts STEP/STL → GLB, SPICE → SVG |

### Local preview

```bash
bundle install    # first time only
npm install       # first time only
npm run build:css # first time, or after main.css changes
bundle exec jekyll serve
# → http://localhost:4000
```

Note: `npm run build:css` is only needed locally if editing `main.css`. For content and color changes, just restart `jekyll serve`.

---

## 8. File Structure

```
pitcrew/
├── _config.yml             ← All site settings
├── _data/
│   ├── team.yml
│   ├── mentors.yml
│   ├── alumni.yml
│   ├── sponsors.yml
│   ├── awards.yml
│   ├── events.yml
│   └── docs_navigation.yml
├── _docs/                  ← Jekyll collection → /docs/
│   ├── index.md
│   ├── getting-started.md
│   ├── site-setup.md
│   ├── handbook.md
│   ├── robot.md
│   ├── programming.md
│   ├── electrical.md
│   ├── cad.md
│   ├── safety.md
│   ├── competition-checklist.md
│   ├── outreach.md
│   ├── links.md
│   └── glossary.md
├── _layouts/
│   ├── default.html        ← Base layout (startup wizard redirect)
│   ├── home.html           ← Homepage (events carousel)
│   ├── docs.html           ← Docs layout (sidebar, breadcrumb, TOC)
│   ├── wizard.html         ← Standalone wizard (no output.css)
│   ├── post.html
│   ├── page.html
│   ├── season.html
│   └── archive.html
├── _includes/
│   ├── navigation.html
│   ├── footer.html
│   └── components/
│       ├── event-card.html
│       ├── sponsor-grid.html
│       ├── team-member-card.html
│       ├── hero-section.html
│       ├── robot-viewer.html
│       ├── circuit-viewer.html
│       ├── gallery.html
│       ├── timeline.html
│       ├── stats-box.html
│       └── accessibility-toggle.html
├── _posts/                 ← Blog posts (YYYY-MM-DD-title.md)
├── seasons/
│   └── 2025-2026/
│       └── index.md
├── assets/
│   ├── css/
│   │   ├── main.css        ← Source (edit this)
│   │   └── output.css      ← Compiled (do not edit)
│   ├── js/
│   │   ├── wizard.js       ← All wizard logic
│   │   └── search.js
│   ├── images/
│   └── models/
├── .github/workflows/
│   ├── deploy.yml
│   ├── alumni-archival.yml
│   ├── optimize-images.yml
│   └── convert-assets.yml
├── scripts/                ← Python scripts (run via GitHub Actions only)
├── wizard.md               ← /wizard/ entry point
├── tailwind.config.js
├── CLAUDE.md               ← AI coding guidelines
├── SPEC.md                 ← This file
└── README.md               ← User-facing setup guide
```

---

## 9. Design Principles

1. **Markdown-first.** Content editors never touch HTML. All meaningful customization is YAML or Markdown.
2. **Fork and go.** A team should have a working site within one hour of forking, before the wizard is even complete.
3. **Zero local tooling required.** All CSS compilation, asset conversion, and deployment runs in GitHub Actions. Teams edit files on github.com if they choose.
4. **One source of truth for colors.** `_config.yml` → injected as CSS vars → every component uses vars. No hex values in templates.
5. **The wizard is optional.** Everything the wizard does maps to plain file edits. The files are the source of truth; the wizard is a UI for them.
6. **Disabled features are invisible.** `features.blog: false` means the blog section is not built and does not appear in navigation — teams don't get broken links or empty pages.
7. **Season-aware by default.** Content is organized under `/seasons/{YYYY-YYYY}/`. Changing `current_season` in `_config.yml` promotes that season to the homepage without any other changes.

---

## 10. Changelog

### v1.1 — Current

**Setup Wizard (new)**
- `wizard.md` — entry point at `/wizard/`
- `_layouts/wizard.html` — fully self-contained standalone layout; no `output.css` dependency; all CSS in an inline `<style>` block; colors via short-form CSS vars (`--p`, `--s`, etc.) injected from `_config.yml`
- `assets/js/wizard.js` — ~1100 lines; 12-step wizard; CRUD modals for all data types; live color preview via CSS var updates on `document.documentElement.style`; JSZip for zip generation; Save Progress (mid-wizard) and final Download flows; YAML generators for all data files
- `_config.yml` — added `startup_wizard: true` flag
- `_layouts/default.html` — added startup redirect script (checks `localStorage` → redirects to `/wizard/` if not done and `startup_wizard: true`)

**Documentation section (new)**
- `_docs/site-setup.md` — full `_config.yml` reference, all data file schemas, deployment instructions, troubleshooting
- `_docs/index.md` — updated with wizard callout at top, table-based section index
- `_docs/getting-started.md` — wizard-first quickstart, team orientation day-by-day breakdown, subteam guide
- `_data/docs_navigation.yml` — added "Site Configuration" entry under Getting Started

**README.md (rewritten)**
- Table of contents with anchor links at top
- Setup Wizard documented as Option A (recommended) in Quick Start
- Manual 4-step path as Option B
- Wizard added to features table
- Customization Guide condensed; all original content preserved
- Troubleshooting rewritten as Q&A bullets; wizard redirect issue added
- Advanced Features organized into subsections

**Breadcrumb fix**
- `_layouts/docs.html` — added `list-none pl-0 mb-0` to breadcrumb `<ol>` and `mb-0` to each `<li>` to override global base styles (`list-style-type: decimal`, `padding-left: 1.5rem`, `margin-bottom: 0.5rem`) that were causing visual overlap

**Events carousel (home page)**
- `_layouts/home.html` — replaced static `limit:3` grid with a date-aware JavaScript carousel
- All events injected as JSON via Liquid `jsonify`
- Client-side split: past events (date < today) / future events (date ≥ today)
- 3 cards per page; left/right arrow navigation with group transitions
- Starts on future page 0 (upcoming events)
- Heading changes: "Upcoming Events" / "Past Events"
- Dot indicators with past/future groups separated by a divider
- Arrow buttons disable and fade at navigation boundaries

---

## 11. Out of Scope

- Real-time collaboration or multi-user editing
- Backend/server-side rendering
- Authentication or team member login
- Analytics dashboard
- WYSIWYG editor (the wizard is the closest equivalent)
- Custom domain SSL automation (handled by GitHub Pages natively)
- Internationalization beyond the experimental `i18n` branch

---

*End of PitCrew Product Specification v1.1*
