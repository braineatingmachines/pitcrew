'use strict';
// ============================================================
// PitCrew Setup Wizard
// ============================================================

// ── 1. State ─────────────────────────────────────────────────
const raw = window.WIZARD_DATA;
const state = {
  config:   JSON.parse(JSON.stringify(raw.config)),
  team:     JSON.parse(JSON.stringify(raw.team     || [])),
  mentors:  JSON.parse(JSON.stringify(raw.mentors  || [])),
  sponsors: JSON.parse(JSON.stringify(raw.sponsors || [])),
  awards:   JSON.parse(JSON.stringify(raw.awards   || [])),
  events:   JSON.parse(JSON.stringify(raw.events   || [])),
};

let currentStep  = 0;
let modalCallback = null;

const STEPS = [
  { id: 'welcome',    title: 'Welcome'            },
  { id: 'identity',   title: 'Team Identity'      },
  { id: 'colors',     title: 'Brand Colors'       },
  { id: 'features',   title: 'Features'           },
  { id: 'socials',    title: 'Social Links'       },
  { id: 'navigation', title: 'Navigation'         },
  { id: 'team',       title: 'Team Members'       },
  { id: 'mentors',    title: 'Mentors'            },
  { id: 'sponsors',   title: 'Sponsors'           },
  { id: 'awards',     title: 'Awards'             },
  { id: 'events',     title: 'Events'             },
  { id: 'review',     title: 'Review & Download'  },
];

// ── 2. Color utilities ────────────────────────────────────────
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255,
      g = parseInt(hex.slice(3,5),16)/255,
      b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h = (g-b)/d + (g < b ? 6 : 0); break;
      case g: h = (b-r)/d + 2; break;
      default: h = (r-g)/d + 4;
    }
    h /= 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1-l);
  const f = n => {
    const k = (n + h/30) % 12;
    const c = l - a * Math.max(Math.min(k-3, 9-k, 1), -1);
    return Math.round(255*c).toString(16).padStart(2,'0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function darken(hex, amount) {
  const [h,s,l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

function updateDerivedColors() {
  const c = state.config.theme.colors;
  c.primary_highlight   = darken(c.primary, 10);
  c.primary_darkest     = darken(c.primary, 25);
  c.secondary_highlight = darken(c.secondary, 10);
}

function applyPreviewColors() {
  const c = state.config.theme.colors;
  const s = document.documentElement.style;
  s.setProperty('--p',  c.primary);
  s.setProperty('--ph', c.primary_highlight);
  s.setProperty('--pd', c.primary_darkest);
  s.setProperty('--s',  c.secondary);
  s.setProperty('--sh', c.secondary_highlight);
  s.setProperty('--sg', c.secondary + '33');
}

// ── 3. YAML helpers ───────────────────────────────────────────
function ys(val) {
  if (val === null || val === undefined || val === '') return '""';
  const s = String(val);
  return '"' + s.replace(/\\/g,'\\\\').replace(/"/g,'\\"') + '"';
}
function yb(val) { return val ? 'true' : 'false'; }

// ── 4. YAML generators ────────────────────────────────────────
function generateConfig(startupWizard = false) {
  const c   = state.config;
  const col = c.theme.colors;
  const f   = c.features;
  const nav = c.navigation;
  const soc = c.socials;
  const fun = c.fundraising || {};

  const navYaml = nav.length
    ? nav.map(n => `  - title: ${ys(n.title)}\n    url: ${ys(n.url)}`).join('\n')
    : '  []';

  return `# Site settings
title: ${ys(c.title)}
description: ${ys(c.description)}
url: ""
baseurl: ""

# Team configuration
site:
  team_name: ${ys(c.site.team_name)}
  team_number: ${ys(c.site.team_number)}
  program: ${ys(c.site.program)}
  current_season: ${ys(c.site.current_season)}
  logo: ${ys(c.site.logo)}
${c.site.hero_image ? `  hero_image: ${ys(c.site.hero_image)}` : `  # hero_image: "/assets/images/hero.jpg"  # Optional: replaces the hero gradient with a photo`}

# Theme configuration
# Edit colors here. Changes take effect after restarting Jekyll.
theme:
  colors:
    # Brand colors
    primary: ${ys(col.primary)}
    primary_highlight: ${ys(col.primary_highlight)}
    primary_darkest: ${ys(col.primary_darkest)}
    secondary: ${ys(col.secondary)}
    secondary_highlight: ${ys(col.secondary_highlight)}
    # Semantic colors
    success: ${ys(col.success)}
    info: ${ys(col.info)}
    warning: ${ys(col.warning)}
    danger: ${ys(col.danger)}
    # Sponsor tier border colors
    sponsor_platinum: ${ys(col.sponsor_platinum)}
    sponsor_gold: ${ys(col.sponsor_gold)}
    sponsor_silver: ${ys(col.sponsor_silver)}
    sponsor_bronze: ${ys(col.sponsor_bronze)}
  dark_mode: ${yb(c.theme.dark_mode)}

# Features toggle
features:
  blog: ${yb(f.blog)}
  docs: ${yb(f.docs)}
  cad_viewer: ${yb(f.cad_viewer)}
  circuit_viewer: ${yb(f.circuit_viewer)}
  code_links: ${yb(f.code_links)}
  data_visualizations: ${yb(f.data_visualizations)}
  alumni_auto_archive: ${yb(f.alumni_auto_archive)}
  accessibility_toggle: ${yb(f.accessibility_toggle)}
  search: ${yb(f.search)}

# Navigation
navigation:
${navYaml}

# Social links
socials:
  instagram: ${ys(soc.instagram)}
  github: ${ys(soc.github)}
  youtube: ${ys(soc.youtube)}
  twitter: ${ys(soc.twitter)}
  email: ${ys(soc.email)}

# Fundraising/Donations
fundraising:
  enabled: ${yb(fun.enabled)}
  url: ${ys(fun.url)}
  text: ${ys(fun.text)}

# Startup wizard — set to false after initial setup
startup_wizard: ${yb(startupWizard)}

# Collections
collections:
  posts:
    output: true
    permalink: /news/:year/:month/:day/:title/
  seasons:
    output: true
    permalink: /seasons/:path/
  docs:
    output: true
    permalink: /docs/:path/

# Defaults
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
  - scope:
      path: ""
      type: "pages"
    values:
      layout: "page"
  - scope:
      path: ""
      type: "seasons"
    values:
      layout: "season"
  - scope:
      path: ""
      type: "docs"
    values:
      layout: "docs"

# Build settings
markdown: kramdown
kramdown:
  input: GFM
  syntax_highlighter: rouge

# Plugins
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap
  - jekyll-redirect-from

# Exclude from build
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
  - package.json
  - package-lock.json
  - tailwind.config.js
  - README.md
  - SPEC.md
  - CLAUDE.md
  - scripts
  - "*.py"
  - requirements.txt
`;
}

function generateTeamYml() {
  return state.team.map(m => {
    const skills = m.skills || [];
    const skillsYaml = skills.length
      ? `  skills:\n${skills.map(s => `    - ${ys(s)}`).join('\n')}`
      : `  skills: []`;
    return `- name: ${ys(m.name)}
  role: ${ys(m.role)}
  grade: ${m.grade || ''}
  graduation_year: ${m.graduation_year || ''}
  bio: ${ys(m.bio)}
  image: ${ys(m.image || '/assets/images/placeholder.svg')}
${skillsYaml}`;
  }).join('\n\n') + '\n';
}

function generateMentorsYml() {
  return state.mentors.map(m =>
`- name: ${ys(m.name)}
  role: ${ys(m.role)}
  bio: ${ys(m.bio)}
  image: ${ys(m.image || '/assets/images/placeholder.svg')}
  organization: ${ys(m.organization)}`
  ).join('\n\n') + '\n';
}

function generateSponsorsYml() {
  return state.sponsors.map(s => {
    let out = `- name: ${ys(s.name)}\n  tier: ${ys(s.tier)}\n`;
    if (s.logo) out += `  logo: ${ys(s.logo)}\n`;
    out += `  url: ${ys(s.url)}`;
    return out;
  }).join('\n\n') + '\n';
}

function generateAwardsYml() {
  return state.awards.map(a =>
`- name: ${ys(a.name)}
  event: ${ys(a.event)}
  season: ${ys(a.season)}
  description: ${ys(a.description)}`
  ).join('\n\n') + '\n';
}

function generateEventsYml() {
  return state.events.map(e =>
`- name: ${ys(e.name)}
  date: ${e.date || ''}
  location: ${ys(e.location)}
  type: ${ys(e.type)}
  description: ${ys(e.description)}
  url: ${e.url ? ys(e.url) : ''}`
  ).join('\n\n') + '\n';
}

// ── 5. HTML helpers ───────────────────────────────────────────
function eh(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fld(label, id, value, type='text', extra='') {
  const tag = type === 'textarea' ? 'textarea' : 'input';
  if (type === 'textarea') {
    return `<div class="wiz-field">
      <label for="${id}">${label}</label>
      <textarea id="${id}" rows="3" class="input">${eh(value)}</textarea>
    </div>`;
  }
  return `<div class="wiz-field">
    <label for="${id}">${label}</label>
    <input type="${type}" id="${id}" value="${eh(value)}" class="input" ${extra}>
  </div>`;
}

function tog(label, id, checked, desc='') {
  return `<div class="wiz-toggle">
    <label class="toggle-switch">
      <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
      <span class="toggle-slider"></span>
    </label>
    <div>
      <div class="toggle-label">${label}</div>
      ${desc ? `<div class="toggle-desc">${desc}</div>` : ''}
    </div>
  </div>`;
}

function sel(label, id, opts, current) {
  const options = opts.map(([val, txt]) =>
    `<option value="${val}" ${current === val ? 'selected' : ''}>${txt}</option>`
  ).join('');
  return `<div class="wiz-field">
    <label for="${id}">${label}</label>
    <select id="${id}" class="input">${options}</select>
  </div>`;
}

// ── 6. Step renderers ─────────────────────────────────────────
function renderWelcome() {
  return `<div class="welcome-box">
    <div class="welcome-icon">&#x1F916;</div>
    <h1 style="margin-bottom:.5rem">Welcome to PitCrew Setup Wizard</h1>
    <p class="welcome-intro">
      Customize your team website — colors, features, and all team data.
      At the end, download a zip of updated config files, drop them into your project,
      and push to GitHub to deploy.
    </p>
    <div class="wiz-time-badge">&#x23F1;&nbsp; Estimated time: 2&ndash;3 hours</div>

    <div class="needs-section">
      <h2 style="font-size:1.1rem;margin-bottom:.875rem">Before you begin, have these ready:</h2>
      <div class="needs-grid">
        <div class="needs-group">
          <div class="needs-group-title">Team Info</div>
          <ul class="needs-list">
            <li>Team name &amp; number</li>
            <li>Program type (FTC, FRC, VEX, FLL)</li>
            <li>Current season (e.g. "2025-2026")</li>
            <li>Contact email address</li>
          </ul>
        </div>
        <div class="needs-group">
          <div class="needs-group-title">Brand &amp; Online Presence</div>
          <ul class="needs-list">
            <li>Brand colors — hex codes, or use the color picker</li>
            <li>Instagram, GitHub, YouTube, Twitter URLs</li>
            <li>Logo file path (once you've uploaded it)</li>
          </ul>
        </div>
        <div class="needs-group">
          <div class="needs-group-title">Team Members &amp; Mentors</div>
          <ul class="needs-list">
            <li>Each member: name, role, grade, graduation year</li>
            <li>A short bio for each member</li>
            <li>Each mentor: name, role, organization, bio</li>
          </ul>
        </div>
        <div class="needs-group">
          <div class="needs-group-title">Season Data</div>
          <ul class="needs-list">
            <li>Each sponsor: name, tier (Platinum&ndash;Bronze), URL</li>
            <li>Awards: award name, event name, season</li>
            <li>Events: name, date, location, type</li>
          </ul>
        </div>
      </div>
      <div class="needs-note">
        <strong>&#x1F5BC;&nbsp;Photos &amp; logos:</strong>
        Images are referenced by file path (e.g. <code>/assets/images/photo.jpg</code>).
        You upload the image files to your project separately &mdash; the wizard only stores the path.
        Any field left blank will use a placeholder image automatically.
      </div>
    </div>

    <div class="wiz-info-box" style="text-align:left;margin-top:1.25rem">
      <strong>&#x1F4BE;&nbsp;Saving your progress:</strong>
      A <strong>Save Progress</strong> button is available in the footer on every step.
      If you need to stop, download the zip and upload those files to your project &mdash;
      your data will be preserved. When you return to <code>/wizard/</code> it starts from the
      beginning, but all saved data will already be in place so you only need to fill in
      what's still missing.
    </div>
  </div>`;
}

function renderIdentity() {
  const s = state.config.site;
  const c = state.config;
  const programs = ['FTC','FRC','VEX','FLL'];
  return `<h2>Team Identity</h2>
  <p class="step-desc">Tell us about your team and site.</p>
  <div class="wiz-grid-2">
    ${fld('Site Title', 'id-title', c.title, 'text', 'placeholder="e.g. Voltage Robotics"')}
    ${fld('Team Number', 'id-team-number', s.team_number, 'text', 'placeholder="e.g. 271828"')}
  </div>
  ${fld('Site Description', 'id-desc', c.description, 'text', 'placeholder="Short description shown in search results"')}
  <div class="wiz-grid-2">
    ${fld('Team Name', 'id-team-name', s.team_name, 'text', 'placeholder="e.g. Voltage Robotics"')}
    <div class="wiz-field">
      <label>Program</label>
      <div class="wiz-radio-group">
        ${programs.map(p => `<label class="wiz-radio">
          <input type="radio" name="program" value="${p}" ${s.program === p ? 'checked' : ''}> ${p}
        </label>`).join('')}
      </div>
    </div>
  </div>
  <div class="wiz-grid-2">
    ${fld('Current Season', 'id-season', s.current_season, 'text', 'placeholder="e.g. 2025-2026"')}
    ${fld('Logo Path', 'id-logo', s.logo, 'text', 'placeholder="/assets/images/logo.png"')}
  </div>
  ${fld('Hero Background Image', 'id-hero', s.hero_image || '', 'text', 'placeholder="/assets/images/hero.jpg — leave blank to use gradient"')}
  <p style="margin-top:-0.5rem;font-size:0.8rem;color:var(--muted)">Recommended: 1920×600 px or wider, landscape. Leave blank to use the default color gradient.</p>`;
}

function renderColors() {
  const c = state.config.theme.colors;
  return `<h2>Brand Colors</h2>
  <p class="step-desc">Choose your colors — the preview updates live as you pick.</p>

  <div class="wiz-color-grid">
    <div class="wiz-color-item">
      <label>Primary Color</label>
      <p class="color-hint">Headers, nav bar, primary buttons</p>
      <div class="color-picker-row">
        <input type="color" id="color-primary" value="${c.primary}" class="color-picker">
        <input type="text"  id="color-primary-hex" value="${c.primary}" class="input color-hex-input" maxlength="7" placeholder="#003974">
      </div>
    </div>
    <div class="wiz-color-item">
      <label>Secondary / Accent Color</label>
      <p class="color-hint">Badges, highlights, secondary buttons</p>
      <div class="color-picker-row">
        <input type="color" id="color-secondary" value="${c.secondary}" class="color-picker">
        <input type="text"  id="color-secondary-hex" value="${c.secondary}" class="input color-hex-input" maxlength="7" placeholder="#F57E25">
      </div>
    </div>
  </div>

  <div class="wiz-toggle" style="margin:1.25rem 0">
    <label class="toggle-switch">
      <input type="checkbox" id="auto-derive" checked>
      <span class="toggle-slider"></span>
    </label>
    <div>
      <div class="toggle-label">Auto-derive hover &amp; dark variants</div>
      <div class="toggle-desc">Automatically compute darker shades for hover states. Uncheck to set manually.</div>
    </div>
  </div>

  <div id="manual-colors" style="display:none;margin-bottom:1rem">
    <div class="wiz-grid-3">
      <div class="wiz-color-item">
        <label>Primary Hover</label>
        <div class="color-picker-row">
          <input type="color" id="color-primary-highlight" value="${c.primary_highlight}" class="color-picker">
          <input type="text"  id="color-primary-highlight-hex" value="${c.primary_highlight}" class="input color-hex-input" maxlength="7">
        </div>
      </div>
      <div class="wiz-color-item">
        <label>Primary Dark</label>
        <div class="color-picker-row">
          <input type="color" id="color-primary-darkest" value="${c.primary_darkest}" class="color-picker">
          <input type="text"  id="color-primary-darkest-hex" value="${c.primary_darkest}" class="input color-hex-input" maxlength="7">
        </div>
      </div>
      <div class="wiz-color-item">
        <label>Secondary Hover</label>
        <div class="color-picker-row">
          <input type="color" id="color-secondary-highlight" value="${c.secondary_highlight}" class="color-picker">
          <input type="text"  id="color-secondary-highlight-hex" value="${c.secondary_highlight}" class="input color-hex-input" maxlength="7">
        </div>
      </div>
    </div>
  </div>

  <div class="wiz-field">
    <label>Dark Mode Default</label>
    <div class="wiz-radio-group">
      <label class="wiz-radio">
        <input type="radio" name="dark-mode" value="true"  ${state.config.theme.dark_mode ? 'checked' : ''}> Dark mode on by default
      </label>
      <label class="wiz-radio">
        <input type="radio" name="dark-mode" value="false" ${!state.config.theme.dark_mode ? 'checked' : ''}> Light mode on by default
      </label>
    </div>
  </div>

  <div class="wiz-preview-box">
    <div class="preview-nav">
      <span style="font-weight:700">&#x1F916; ${eh(state.config.site.team_name || 'Team Name')}</span>
      <div style="display:flex;gap:.25rem">
        <span class="preview-nav-link">Home</span>
        <span class="preview-nav-link">About</span>
        <span class="preview-nav-link">Season</span>
      </div>
    </div>
    <div class="preview-body">
      <button class="btn btn-primary"          style="cursor:default">Primary</button>
      <button class="btn btn-secondary"        style="cursor:default">Secondary</button>
      <button class="btn btn-outline"          style="cursor:default">Outline</button>
      <span   class="badge badge-primary">Primary</span>
      <span   class="badge badge-secondary">Secondary</span>
      <span   class="badge badge-success">Success</span>
    </div>
  </div>`;
}

function renderFeatures() {
  const f   = state.config.features;
  const fun = state.config.fundraising || {};
  return `<h2>Features</h2>
  <p class="step-desc">Enable or disable sections. Disabled features won't appear in navigation or be built.</p>

  <div class="wiz-section-group">
    <h3>Site Features</h3>
    ${tog('News / Blog',           'feat-blog',   f.blog,                 'A news feed with blog posts')}
    ${tog('Documentation',         'feat-docs',   f.docs,                 'Technical docs section for your robot')}
    ${tog('CAD Viewer',            'feat-cad',    f.cad_viewer,           'Interactive 3D CAD model viewer')}
    ${tog('Circuit Viewer',        'feat-circuit',f.circuit_viewer,       'Display electrical schematics')}
    ${tog('Code Links',            'feat-code',   f.code_links,           'Links to your code repositories')}
    ${tog('Data Visualizations',   'feat-dataviz',f.data_visualizations,  'Charts and graphs for match data')}
    ${tog('Alumni Auto-Archive',   'feat-alumni', f.alumni_auto_archive,  'Auto-move graduated members to alumni page')}
    ${tog('Accessibility Toggle',  'feat-a11y',   f.accessibility_toggle, 'High-contrast and reduced-motion controls')}
    ${tog('Search',                'feat-search', f.search,               'Site-wide search functionality')}
  </div>

  <div class="wiz-section-group" style="margin-top:1.25rem">
    <h3>Fundraising</h3>
    ${tog('Enable Fundraising Banner', 'feat-fund', fun.enabled, 'Show a donation link in the header')}
    <div id="fund-details" style="display:${fun.enabled ? 'block' : 'none'};margin-top:1rem;padding-left:1rem;border-left:3px solid var(--s)">
      ${fld('Fundraising URL', 'fund-url', fun.url, 'url', 'placeholder="https://gofundme.com/your-team"')}
      ${fld('Button Text',     'fund-text', fun.text, 'text', 'placeholder="Support Our Team"')}
    </div>
  </div>`;
}

function renderSocials() {
  const s = state.config.socials;
  return `<h2>Social Links</h2>
  <p class="step-desc">Add your team's social media profiles. Leave blank to hide the link.</p>
  <div class="wiz-grid-2">
    ${fld('Instagram URL', 'soc-instagram', s.instagram, 'url', 'placeholder="https://instagram.com/yourteam"')}
    ${fld('GitHub URL',    'soc-github',    s.github,    'url', 'placeholder="https://github.com/yourteam"')}
    ${fld('YouTube URL',   'soc-youtube',   s.youtube,   'url', 'placeholder="https://youtube.com/@yourteam"')}
    ${fld('Twitter / X',   'soc-twitter',   s.twitter,   'url', 'placeholder="https://twitter.com/yourteam"')}
  </div>
  ${fld('Email Address', 'soc-email', s.email, 'email', 'placeholder="team@school.edu"')}`;
}

function renderNavigation() {
  const nav = state.config.navigation;
  return `<h2>Navigation</h2>
  <p class="step-desc">Customize which pages appear in the top nav and their order.</p>
  <div id="nav-list">
    ${nav.map((item, i) => `
    <div class="nav-item-row" data-index="${i}">
      <div class="nav-order-btns">
        <button class="nav-order-btn" data-action="nav-up"   data-index="${i}" title="Move up">&#x25B2;</button>
        <button class="nav-order-btn" data-action="nav-down" data-index="${i}" title="Move down">&#x25BC;</button>
      </div>
      <input type="text" class="input nav-title-input" value="${eh(item.title)}" placeholder="Title"
             data-nav-field="title" data-nav-index="${i}">
      <input type="text" class="input nav-url-input"   value="${eh(item.url)}"   placeholder="/page/"
             data-nav-field="url"   data-nav-index="${i}">
      <button class="btn-icon-danger" data-action="remove-nav" data-index="${i}" title="Remove">&#x2715;</button>
    </div>`).join('')}
  </div>
  <button class="btn btn-outline" data-action="add-nav" style="margin-top:.75rem">+ Add Navigation Item</button>
  <div class="wiz-info-box" style="margin-top:1.25rem">
    <strong>Tip:</strong> URLs should match the page's permalink (e.g., <code>/about/</code>, <code>/season/</code>).
    Only include pages that exist in your site.
  </div>`;
}

// ── Generic CRUD list section ─────────────────────────────────
function listSection(title, items, section, cardFn) {
  const singular = title.replace(/s$/, '');
  const empty = `<p style="color:var(--muted);font-style:italic">No ${title.toLowerCase()} yet. Add one below.</p>`;
  const cards = items.map((item, i) => `
    <div class="list-card">
      <div class="list-card-content">${cardFn(item)}</div>
      <div class="list-card-actions">
        <button class="btn-outline-sm" data-action="edit-${section}"   data-index="${i}">Edit</button>
        <button class="btn-danger-sm"  data-action="remove-${section}" data-index="${i}">Remove</button>
      </div>
    </div>`).join('');

  return `<h2>${title}</h2>
  <p class="step-desc">Manage your ${title.toLowerCase()}. Click Edit to update details.</p>
  <div id="${section}-list">${items.length ? cards : empty}</div>
  <button class="btn btn-outline" data-action="add-${section}" style="margin-top:.75rem">+ Add ${singular}</button>`;
}

function renderTeam() {
  return listSection('Team Members', state.team, 'team', m =>
    `<strong>${eh(m.name||'Unnamed')}</strong> &middot; ${eh(m.role||'')} &middot; Grade&nbsp;${m.grade||'?'}`
  );
}
function renderMentors() {
  return listSection('Mentors', state.mentors, 'mentors', m =>
    `<strong>${eh(m.name||'Unnamed')}</strong> &middot; ${eh(m.role||'')}
     <span style="color:var(--muted)">${eh(m.organization||'')}</span>`
  );
}
function renderSponsors() {
  const tierBadge = t => ({platinum:'badge-info',gold:'badge-warning',silver:'badge-primary',bronze:'badge-secondary'}[t]||'badge-primary');
  return listSection('Sponsors', state.sponsors, 'sponsors', s =>
    `<strong>${eh(s.name||'Unnamed')}</strong> &middot;
     <span class="badge ${tierBadge(s.tier)}">${eh(s.tier||'bronze')}</span>`
  );
}
function renderAwards() {
  return listSection('Awards', state.awards, 'awards', a =>
    `<strong>${eh(a.name||'Unnamed')}</strong> &middot; ${eh(a.event||'')}
     <span style="color:var(--muted)">${eh(a.season||'')}</span>`
  );
}
function renderEvents() {
  const typeBadge = t => ({competition:'badge-danger',outreach:'badge-success',event:'badge-primary'}[t]||'badge-primary');
  return listSection('Events', state.events, 'events', e =>
    `<strong>${eh(e.name||'Unnamed')}</strong> &middot; ${eh(e.date||'')}
     <span class="badge ${typeBadge(e.type)}">${eh(e.type||'event')}</span>`
  );
}

function renderReview() {
  return `<h2>Review &amp; Download</h2>
  <p class="step-desc">Everything looks good! Download your config files and apply them to your project.</p>

  <div class="review-summary">
    <div class="review-stat"><div class="review-stat-value">${state.team.length}</div><div class="review-stat-label">Team Members</div></div>
    <div class="review-stat"><div class="review-stat-value">${state.mentors.length}</div><div class="review-stat-label">Mentors</div></div>
    <div class="review-stat"><div class="review-stat-value">${state.sponsors.length}</div><div class="review-stat-label">Sponsors</div></div>
    <div class="review-stat"><div class="review-stat-value">${state.awards.length}</div><div class="review-stat-label">Awards</div></div>
    <div class="review-stat"><div class="review-stat-value">${state.events.length}</div><div class="review-stat-label">Events</div></div>
  </div>

  <div class="wiz-info-box">
    <strong>Files included in the download:</strong>
    <ul>
      <li><code>_config.yml</code> &mdash; Site settings, colors, features, navigation</li>
      <li><code>_data/team.yml</code> &mdash; Team members</li>
      <li><code>_data/mentors.yml</code> &mdash; Mentors</li>
      <li><code>_data/sponsors.yml</code> &mdash; Sponsors</li>
      <li><code>_data/awards.yml</code> &mdash; Awards</li>
      <li><code>_data/events.yml</code> &mdash; Events</li>
    </ul>
  </div>

  <div class="skip-check-wrap">
    <div style="flex:1">
      <label class="skip-check-label">
        <input type="checkbox" id="skip-on-startup" checked>
        Skip wizard on startup <span style="font-weight:400;color:var(--muted)">(recommended)</span>
      </label>
      <p class="skip-check-desc">
        When checked, your site won't auto-redirect visitors to <code>/wizard/</code> after you deploy.
        You can always return to <code>/wizard/</code> manually to make further changes.
        Uncheck if you want the wizard to keep launching until you've finished every section.
      </p>
    </div>
  </div>

  <div style="text-align:center;margin:1.5rem 0">
    <button id="btn-download" class="btn btn-primary" data-action="download"
            style="font-size:1.05rem;padding:.875rem 2rem">
      &#x2B07; Download pitcrew-config.zip
    </button>
    <p style="color:var(--muted);margin-top:.6rem;font-size:.875rem">6 files &mdash; drop them into your project and push to GitHub</p>
  </div>

  <div class="wiz-section-group">
    <h3>Next Steps</h3>
    <ol>
      <li>Extract <strong>pitcrew-config.zip</strong></li>
      <li>Copy all files into your PitCrew project, overwriting the existing ones</li>
      <li>Run <code>bundle exec jekyll serve</code> to preview locally</li>
      <li>Push to GitHub to deploy your updated site</li>
    </ol>
  </div>`;
}

// ── 7. Modal forms ───────────────────────────────────────────
function teamForm(item = {}) {
  return `<div class="wiz-grid-2">
    ${fld('Name', 'm-name', item.name)}
    ${fld('Role', 'm-role', item.role)}
  </div>
  <div class="wiz-grid-2">
    ${fld('Grade (9–12)', 'm-grade', item.grade, 'number', 'min="9" max="12"')}
    ${fld('Graduation Year', 'm-year', item.graduation_year, 'number', 'min="2024" max="2035"')}
  </div>
  ${fld('Bio', 'm-bio', item.bio, 'textarea')}
  ${fld('Skills (comma-separated)', 'm-skills', (item.skills||[]).join(', '), 'text', 'placeholder="Java, CAD, Leadership"')}
  ${fld('Photo Path (optional)', 'm-image', item.image, 'text', 'placeholder="/assets/images/photo.jpg"')}`;
}

function mentorForm(item = {}) {
  return `<div class="wiz-grid-2">
    ${fld('Name', 'm-name', item.name)}
    ${fld('Role', 'm-role', item.role)}
  </div>
  ${fld('Organization', 'm-org', item.organization)}
  ${fld('Bio', 'm-bio', item.bio, 'textarea')}
  ${fld('Photo Path (optional)', 'm-image', item.image, 'text', 'placeholder="/assets/images/photo.jpg"')}`;
}

function sponsorForm(item = {}) {
  return `${fld('Sponsor Name', 'm-name', item.name)}
  ${sel('Sponsorship Tier', 'm-tier',
    [['platinum','Platinum'],['gold','Gold'],['silver','Silver'],['bronze','Bronze']],
    item.tier || 'bronze')}
  ${fld('Website URL', 'm-url', item.url, 'url', 'placeholder="https://example.com"')}
  ${fld('Logo Path (optional)', 'm-logo', item.logo, 'text', 'placeholder="/assets/images/sponsor.png"')}`;
}

function awardForm(item = {}) {
  return `${fld('Award Name', 'm-name', item.name)}
  <div class="wiz-grid-2">
    ${fld('Event', 'm-event', item.event, 'text', 'placeholder="State Championship"')}
    ${fld('Season', 'm-season', item.season, 'text', 'placeholder="2024-2025"')}
  </div>
  ${fld('Description', 'm-desc', item.description, 'textarea')}`;
}

function eventForm(item = {}) {
  return `${fld('Event Name', 'm-name', item.name)}
  <div class="wiz-grid-2">
    ${fld('Date', 'm-date', item.date, 'date')}
    ${sel('Event Type', 'm-type',
      [['competition','Competition'],['event','Event'],['outreach','Outreach']],
      item.type || 'event')}
  </div>
  ${fld('Location', 'm-location', item.location, 'text', 'placeholder="Lincoln High School"')}
  ${fld('Description', 'm-desc', item.description, 'textarea')}
  ${fld('Event URL (optional)', 'm-url', item.url, 'url', 'placeholder="https://..."')}`;
}

function gv(id) { return (document.getElementById(id)||{}).value || ''; }
function gc(id) { return !!(document.getElementById(id)||{}).checked; }

function collectTeam() {
  return {
    name:            gv('m-name'),
    role:            gv('m-role'),
    grade:           parseInt(gv('m-grade')) || '',
    graduation_year: parseInt(gv('m-year'))  || '',
    bio:             gv('m-bio'),
    skills:          gv('m-skills').split(',').map(s=>s.trim()).filter(Boolean),
    image:           gv('m-image') || '/assets/images/placeholder.svg',
  };
}
function collectMentor() {
  return { name: gv('m-name'), role: gv('m-role'), organization: gv('m-org'),
           bio: gv('m-bio'), image: gv('m-image') || '/assets/images/placeholder.svg' };
}
function collectSponsor() {
  return { name: gv('m-name'), tier: gv('m-tier'), url: gv('m-url'), logo: gv('m-logo') };
}
function collectAward() {
  return { name: gv('m-name'), event: gv('m-event'), season: gv('m-season'), description: gv('m-desc') };
}
function collectEvent() {
  return { name: gv('m-name'), date: gv('m-date'), type: gv('m-type'),
           location: gv('m-location'), description: gv('m-desc'), url: gv('m-url') };
}

const SECTIONS = {
  team:     { arr: () => state.team,     form: teamForm,    collect: collectTeam,    label: 'Team Member' },
  mentors:  { arr: () => state.mentors,  form: mentorForm,  collect: collectMentor,  label: 'Mentor'      },
  sponsors: { arr: () => state.sponsors, form: sponsorForm, collect: collectSponsor, label: 'Sponsor'     },
  awards:   { arr: () => state.awards,   form: awardForm,   collect: collectAward,   label: 'Award'       },
  events:   { arr: () => state.events,   form: eventForm,   collect: collectEvent,   label: 'Event'       },
};

// ── 8. Modal ─────────────────────────────────────────────────
function showModal(title, body, onSave) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('edit-modal').classList.remove('hidden');
  modalCallback = onSave;
}
function hideModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  modalCallback = null;
}

// ── 9. Save current step's form data ─────────────────────────
function saveCurrentStep() {
  const id = STEPS[currentStep].id;

  if (id === 'identity') {
    const s = state.config.site;
    state.config.title       = gv('id-title')       || state.config.title;
    state.config.description = gv('id-desc')        || state.config.description;
    s.team_name              = gv('id-team-name')   || s.team_name;
    s.team_number            = gv('id-team-number') || s.team_number;
    s.current_season         = gv('id-season')      || s.current_season;
    s.logo                   = gv('id-logo')        || s.logo;
    s.hero_image             = gv('id-hero');
    const prog = document.querySelector('input[name="program"]:checked');
    if (prog) s.program = prog.value;
  }

  else if (id === 'colors') {
    const c = state.config.theme.colors;
    const primary   = gv('color-primary')   || c.primary;
    const secondary = gv('color-secondary') || c.secondary;
    c.primary   = primary;
    c.secondary = secondary;
    const autoDeriveEl = document.getElementById('auto-derive');
    if (autoDeriveEl && !autoDeriveEl.checked) {
      c.primary_highlight   = gv('color-primary-highlight')   || c.primary_highlight;
      c.primary_darkest     = gv('color-primary-darkest')     || c.primary_darkest;
      c.secondary_highlight = gv('color-secondary-highlight') || c.secondary_highlight;
    } else {
      updateDerivedColors();
    }
    const dm = document.querySelector('input[name="dark-mode"]:checked');
    if (dm) state.config.theme.dark_mode = dm.value === 'true';
  }

  else if (id === 'features') {
    const f   = state.config.features;
    const fun = state.config.fundraising || (state.config.fundraising = {});
    f.blog                = gc('feat-blog');
    f.docs                = gc('feat-docs');
    f.cad_viewer          = gc('feat-cad');
    f.circuit_viewer      = gc('feat-circuit');
    f.code_links          = gc('feat-code');
    f.data_visualizations = gc('feat-dataviz');
    f.alumni_auto_archive = gc('feat-alumni');
    f.accessibility_toggle= gc('feat-a11y');
    f.search              = gc('feat-search');
    fun.enabled = gc('feat-fund');
    if (fun.enabled) {
      fun.url  = gv('fund-url')  || fun.url;
      fun.text = gv('fund-text') || fun.text;
    }
  }

  else if (id === 'socials') {
    const s = state.config.socials;
    s.instagram = gv('soc-instagram');
    s.github    = gv('soc-github');
    s.youtube   = gv('soc-youtube');
    s.twitter   = gv('soc-twitter');
    s.email     = gv('soc-email');
  }
  // navigation: updated live via input events
}

// ── 10. Download zip ─────────────────────────────────────────
async function buildAndDownload({ startupWizard, filename, readme, triggerBtn }) {
  if (triggerBtn) { triggerBtn.textContent = 'Generating…'; triggerBtn.disabled = true; }
  try {
    const zip  = new JSZip();
    zip.file('_config.yml', generateConfig(startupWizard));
    const data = zip.folder('_data');
    data.file('team.yml',     generateTeamYml());
    data.file('mentors.yml',  generateMentorsYml());
    data.file('sponsors.yml', generateSponsorsYml());
    data.file('awards.yml',   generateAwardsYml());
    data.file('events.yml',   generateEventsYml());
    zip.file('README.txt', readme.join('\n'));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (triggerBtn) {
      triggerBtn.textContent = '\u2713 Downloaded!';
      triggerBtn.style.backgroundColor = 'var(--ok)';
      triggerBtn.disabled = false;
    }
  } catch (err) {
    if (triggerBtn) { triggerBtn.textContent = triggerBtn.dataset.label || 'Download'; triggerBtn.disabled = false; }
    alert('Error generating zip: ' + err.message);
  }
}

async function downloadZip() {
  // Final download from the Review step
  saveCurrentStep();
  const skipChecked = document.getElementById('skip-on-startup')?.checked ?? true;
  const startupWizard = !skipChecked; // checked = skip = startup_wizard: false
  const btn = document.getElementById('btn-download');
  if (btn) btn.dataset.label = btn.textContent;

  await buildAndDownload({
    startupWizard,
    filename: 'pitcrew-config.zip',
    triggerBtn: btn,
    readme: [
      'PitCrew Configuration',
      '======================',
      '',
      'Files included:',
      '  _config.yml           Site settings, colors, features, navigation',
      '  _data/team.yml        Team members',
      '  _data/mentors.yml     Mentors',
      '  _data/sponsors.yml    Sponsors',
      '  _data/awards.yml      Awards',
      '  _data/events.yml      Events',
      '',
      'Instructions:',
      '  1. Extract this zip',
      '  2. Copy all files into your pitcrew project, overwriting existing ones',
      '  3. Run: bundle exec jekyll serve',
      '  4. Preview at http://localhost:4000',
      '  5. Push to GitHub to deploy',
      '',
      startupWizard
        ? 'startup_wizard is still TRUE — the wizard will auto-launch on your next visit.'
        : 'startup_wizard is set to FALSE — the wizard will not auto-redirect visitors.',
      '',
      'Generated by PitCrew Setup Wizard on ' + new Date().toLocaleDateString(),
    ],
  });
  localStorage.setItem('pitcrew_wizard_done', 'true');
}

async function saveProgress() {
  // Mid-wizard save — startup_wizard stays true (setup not complete)
  saveCurrentStep();
  const btn = document.getElementById('btn-save');
  if (btn) btn.dataset.label = btn.textContent;

  await buildAndDownload({
    startupWizard: true,  // wizard still needed on next load
    filename: 'pitcrew-progress.zip',
    triggerBtn: btn,
    readme: [
      'PitCrew Progress Save',
      '======================',
      'This is a MID-WIZARD save. Setup is not yet complete.',
      '',
      'Files included:',
      '  _config.yml           (partially configured)',
      '  _data/team.yml',
      '  _data/mentors.yml',
      '  _data/sponsors.yml',
      '  _data/awards.yml',
      '  _data/events.yml',
      '',
      'To preserve your work:',
      '  1. Extract this zip',
      '  2. Copy all files into your pitcrew project, overwriting existing ones',
      '  3. Commit and push to GitHub (optional — keeps data safe)',
      '',
      'To continue the wizard later:',
      '  - Visit /wizard/ — it will start from Step 1',
      '  - Your saved data is already in place; just fill in whatever is still missing',
      '',
      'Note: startup_wizard is TRUE — the wizard will auto-launch until',
      'you complete setup and download the final pitcrew-config.zip.',
      '',
      'Saved on ' + new Date().toLocaleDateString() + ' at step ' + (currentStep + 1) + ' of ' + STEPS.length + ' (' + STEPS[currentStep].title + ')',
    ],
  });
}

// ── 11. Render & navigation ───────────────────────────────────
const RENDER = {
  welcome:    renderWelcome,
  identity:   renderIdentity,
  colors:     renderColors,
  features:   renderFeatures,
  socials:    renderSocials,
  navigation: renderNavigation,
  team:       renderTeam,
  mentors:    renderMentors,
  sponsors:   renderSponsors,
  awards:     renderAwards,
  events:     renderEvents,
  review:     renderReview,
};

function renderStep() {
  const content = document.getElementById('wizard-content');
  content.innerHTML = RENDER[STEPS[currentStep].id]();
  bindStepEvents(STEPS[currentStep].id);
  updateProgress();
  updateFooter();
  window.scrollTo(0, 0);
}

function updateProgress() {
  const pct   = currentStep === 0 ? 0 : Math.round(currentStep / (STEPS.length - 1) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('step-label');
  const title = document.getElementById('step-title-label');
  if (fill)  fill.style.width  = pct + '%';
  if (label) label.textContent = `Step ${currentStep + 1} of ${STEPS.length}`;
  if (title) title.textContent = STEPS[currentStep].title;
}

function updateFooter() {
  const prev = document.getElementById('btn-prev');
  const next = document.getElementById('btn-next');
  const skip = document.getElementById('btn-skip');
  const save = document.getElementById('btn-save');
  const isFirst = currentStep === 0;
  const isLast  = currentStep === STEPS.length - 1;

  if (prev) prev.style.display = isFirst ? 'none' : '';
  if (next) {
    next.style.display = isLast ? 'none' : '';
    next.textContent   = isFirst ? 'Get Started \u2192' : 'Next \u2192';
  }
  if (skip) skip.style.display = isFirst ? '' : 'none';
  // Save Progress: show on steps 1–10 (not welcome, not review — review has main download)
  if (save) save.style.display = (!isFirst && !isLast) ? '' : 'none';
}

function goToStep(n) {
  if (n < 0 || n >= STEPS.length) return;
  saveCurrentStep();
  currentStep = n;
  renderStep();
}

// ── 12. Color step event binding ─────────────────────────────
function bindColorSync(pickerId, hexId, colorKey) {
  const picker   = document.getElementById(pickerId);
  const hexInput = document.getElementById(hexId);
  if (!picker || !hexInput) return;

  const syncAndPreview = (val) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) return;
    picker.value   = val;
    hexInput.value = val;
    state.config.theme.colors[colorKey] = val;
    const autoEl = document.getElementById('auto-derive');
    if (autoEl && autoEl.checked) {
      updateDerivedColors();
      // Reflect derived values in manual inputs even when hidden
      ['primary_highlight','primary_darkest','secondary_highlight'].forEach(k => {
        const el = document.getElementById('color-' + k.replace(/_/g,'-'));
        const hx = document.getElementById('color-' + k.replace(/_/g,'-') + '-hex');
        if (el) el.value = state.config.theme.colors[k];
        if (hx) hx.value = state.config.theme.colors[k];
      });
    }
    applyPreviewColors();
  };

  picker.addEventListener('input',  () => syncAndPreview(picker.value));
  hexInput.addEventListener('input', () => syncAndPreview(hexInput.value));
}

function bindStepEvents(stepId) {
  if (stepId === 'colors') {
    bindColorSync('color-primary',            'color-primary-hex',            'primary');
    bindColorSync('color-secondary',          'color-secondary-hex',          'secondary');
    bindColorSync('color-primary-highlight',  'color-primary-highlight-hex',  'primary_highlight');
    bindColorSync('color-primary-darkest',    'color-primary-darkest-hex',    'primary_darkest');
    bindColorSync('color-secondary-highlight','color-secondary-highlight-hex','secondary_highlight');

    document.getElementById('auto-derive')?.addEventListener('change', e => {
      document.getElementById('manual-colors').style.display = e.target.checked ? 'none' : 'block';
      if (e.target.checked) { updateDerivedColors(); applyPreviewColors(); }
    });
  }

  if (stepId === 'features') {
    document.getElementById('feat-fund')?.addEventListener('change', e => {
      document.getElementById('fund-details').style.display = e.target.checked ? 'block' : 'none';
    });
  }
}

// ── 13. Event delegation ─────────────────────────────────────
document.getElementById('wizard-content').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const idx    = parseInt(btn.dataset.index);
  const nav    = state.config.navigation;

  if (action === 'download') { downloadZip(); return; }

  // Navigation management
  if (action === 'add-nav') {
    nav.push({ title: 'New Page', url: '/new-page/' });
    renderStep(); return;
  }
  if (action === 'remove-nav') {
    if (confirm('Remove this nav item?')) { nav.splice(idx, 1); renderStep(); }
    return;
  }
  if (action === 'nav-up') {
    if (idx > 0) { [nav[idx-1], nav[idx]] = [nav[idx], nav[idx-1]]; renderStep(); }
    return;
  }
  if (action === 'nav-down') {
    if (idx < nav.length - 1) { [nav[idx], nav[idx+1]] = [nav[idx+1], nav[idx]]; renderStep(); }
    return;
  }

  // CRUD sections
  for (const [section, cfg] of Object.entries(SECTIONS)) {
    if (action === `add-${section}`) {
      showModal(`Add ${cfg.label}`, cfg.form(), () => {
        cfg.arr().push(cfg.collect());
        hideModal(); renderStep();
      });
      return;
    }
    if (action === `edit-${section}`) {
      showModal(`Edit ${cfg.label}`, cfg.form(cfg.arr()[idx]), () => {
        cfg.arr()[idx] = cfg.collect();
        hideModal(); renderStep();
      });
      return;
    }
    if (action === `remove-${section}`) {
      if (confirm(`Remove this ${cfg.label.toLowerCase()}?`)) {
        cfg.arr().splice(idx, 1); renderStep();
      }
      return;
    }
  }
});

// Nav inputs update state live
document.getElementById('wizard-content').addEventListener('input', e => {
  const input = e.target;
  if (input.dataset.navField !== undefined) {
    const i = parseInt(input.dataset.navIndex);
    if (state.config.navigation[i]) {
      state.config.navigation[i][input.dataset.navField] = input.value;
    }
  }
});

// Footer
document.getElementById('btn-next')?.addEventListener('click', () => goToStep(currentStep + 1));
document.getElementById('btn-prev')?.addEventListener('click', () => goToStep(currentStep - 1));
document.getElementById('btn-save')?.addEventListener('click', saveProgress);
document.getElementById('btn-skip')?.addEventListener('click', () => {
  if (confirm('Skip the wizard? You can return anytime at /wizard/')) {
    localStorage.setItem('pitcrew_wizard_done', 'true');
    window.location.href = '/';
  }
});

// Modal
document.getElementById('modal-save')?.addEventListener('click',   () => { if (modalCallback) modalCallback(); });
document.getElementById('modal-cancel')?.addEventListener('click',  hideModal);
document.getElementById('modal-close')?.addEventListener('click',   hideModal);
document.getElementById('modal-backdrop')?.addEventListener('click', hideModal);

// ── 14. Init ─────────────────────────────────────────────────
updateDerivedColors();
applyPreviewColors();
renderStep();
