# PitCrew

A free, open-source website template for robotics teams. Get your team's professional portfolio website up and running in minutes — no coding experience required.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Jekyll](https://img.shields.io/badge/jekyll-4.3+-red.svg)
![Tailwind](https://img.shields.io/badge/tailwind-3.4+-38bdf8.svg)

> There is an experimental [`i18n`](https://github.com/braineatingmachines/pitcrew/tree/i18n) branch which supports `en, fr, de, es, zh, ja`. Try it if you want the labels in languages supported above.
---

## What is PitCrew?

PitCrew is a ready-to-use website template designed specifically for competitive robotics teams. Just like your pit crew keeps your robot running at competitions, this template keeps your online presence running smoothly.

**Perfect for:**
- FTC (FIRST Tech Challenge) teams
- FRC (FIRST Robotics Competition) teams
- VEX Robotics teams
- Any competitive robotics team

**No coding required** — just edit text files and your site updates automatically!

---

## Features

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Looks great on phones, tablets, and desktops |
| **Dark Mode** | Easy on the eyes with automatic dark/light switching |
| **Team Roster** | Showcase your team members with photos and bios |
| **Season Pages** | Organize content by competition season |
| **Blog/News** | Share updates, competition recaps, and announcements |
| **Sponsor Showcase** | Display sponsors in tiered sections (Platinum, Gold, Silver, Bronze) |
| **Awards Display** | Show off your team's achievements |
| **Event Calendar** | List upcoming competitions and outreach events |
| **Documentation** | Technical docs section for engineering portfolio |
| **3D Robot Viewer** | Interactive 3D model viewer for your robot CAD |
| **Judge Mode** | Printer-friendly page for competition judges |
| **Accessibility** | High contrast mode for better readability |
| **Search** | Find content across your entire site |
| **Auto-Deploy** | Push changes and your site updates automatically |
| **Alumni Archive** | Automatically moves graduated members to alumni page |

---

## Quick Start (5 Minutes)

### Step 1: Fork this Repository

1. Click the **"Fork"** button at the top-right of this page
2. This creates your own copy of the template
3. Your fork will be at `github.com/YOUR-USERNAME/pitcrew`

### Step 2: Enable GitHub Pages

1. Go to your forked repository
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** in the left sidebar
4. Under "Build and deployment", set **Source** to **"GitHub Actions"**
5. Click **Save**

### Step 3: Edit Your Team Info

1. Click on `_config.yml` in your repository
2. Click the **pencil icon** (Edit this file)
3. Change these lines to match your team:

```yaml
title: "Your Team Name Robotics"
description: "Your team's tagline or mission statement"

site:
  team_name: "Your Team Name"
  team_number: "12345"
  program: "FTC"  # Change to "FRC" if you're an FRC team
  current_season: "2025-2026"
```

4. Scroll down and click **"Commit changes"**

### Step 4: Wait for Deployment

1. Click the **Actions** tab in your repository
2. You'll see a workflow running (yellow dot)
3. Wait 2-3 minutes for it to complete (green checkmark)
4. Your site is now live at: `https://YOUR-USERNAME.github.io/pitcrew`

**That's it! You have a working website!**

---

## Customization Guide

Now let's make it truly yours. All customization is done by editing files directly on GitHub — no software installation needed.

### Changing Your Team Information

Edit `_config.yml`:

```yaml
# Basic Info
title: "Thunderbolts Robotics"
description: "Building robots, building futures"

site:
  team_name: "Thunderbolts"
  team_number: "12345"
  program: "FTC"
  current_season: "2025-2026"
  logo: "/assets/images/logo.png"  # Add your logo here

# Social Media Links
socials:
  instagram: "https://instagram.com/thunderbolts12345"
  github: "https://github.com/thunderbolts12345"
  youtube: "https://youtube.com/@thunderbolts12345"
  twitter: "https://twitter.com/thunderbolts"
  email: "team@thunderbolts.org"

# Fundraising Link (optional)
fundraising:
  enabled: true
  url: "https://gofundme.com/your-campaign"
  text: "Support Our Team"
```

### Adding Team Members

Edit `_data/team.yml`. Each team member looks like this:

```yaml
- name: Sarah Chen
  role: Team Captain
  grade: 12
  graduation_year: 2026
  bio: "3-year team member passionate about mechanical engineering. Leads strategy meetings and driver practice sessions."
  image: /assets/images/placeholder.svg  # Replace with actual photo
  skills:
    - Leadership
    - Strategy
    - CAD Design

- name: Marcus Johnson
  role: Programming Lead
  grade: 11
  graduation_year: 2027
  bio: "Specializes in autonomous routines and computer vision. Loves solving complex coding challenges."
  image: /assets/images/placeholder.svg
  skills:
    - Java
    - Python
    - Computer Vision
```

**Tip:** The `graduation_year` field is used for automatic alumni archival. When a member graduates, they're automatically moved to the alumni page!

### Adding Mentors

Edit `_data/mentors.yml`:

```yaml
- name: Dr. Emily Rodriguez
  role: Lead Mentor
  bio: "Mechanical engineer at Boeing with 10 years of robotics mentoring experience."
  image: /assets/images/placeholder.svg
  organization: Boeing

- name: James Park
  role: Programming Mentor
  bio: "Software developer who loves teaching students about real-world coding practices."
  image: /assets/images/placeholder.svg
  organization: Microsoft
```

### Adding Sponsors

Edit `_data/sponsors.yml`. Sponsors are organized by tier:

```yaml
# Platinum Sponsors (highest tier)
- name: TechCorp Industries
  tier: platinum
  logo: /assets/images/sponsors/techcorp.png
  url: https://techcorp.example.com

# Gold Sponsors
- name: Community Bank
  tier: gold
  logo: /assets/images/sponsors/bank.png
  url: https://communitybank.example.com

# Silver Sponsors
- name: Local Hardware Store
  tier: silver
  logo: /assets/images/placeholder.svg
  url: https://hardware.example.com

# Bronze Sponsors (can omit logo)
- name: Smith Family Foundation
  tier: bronze
  url: https://example.com
```

### Adding Awards

Edit `_data/awards.yml`:

```yaml
- name: Inspire Award
  event: State Championship
  season: 2024-2025
  description: "Highest honor recognizing teams that embody the mission of FIRST."

- name: Think Award
  event: League Championship
  season: 2024-2025
  description: "Excellence in engineering documentation and the design process."

- name: 1st Place Alliance
  event: Regional Qualifier
  season: 2024-2025
  description: "Tournament champions as alliance captains."
```

### Adding Events

Edit `_data/events.yml`:

```yaml
- name: League Meet 1
  date: 2026-01-18
  location: Lincoln High School
  type: competition  # competition, outreach, or event
  description: "First qualifying meet of the season."

- name: STEM Night at Elementary School
  date: 2026-01-25
  location: Maple Elementary
  type: outreach
  description: "Robot demonstration for elementary students."

- name: Sponsor Appreciation Dinner
  date: 2026-02-08
  location: Team Workshop
  type: event
  description: "Thank you event for our amazing sponsors."
```

### Writing Blog Posts

Create a new file in `_posts/` with the format: `YYYY-MM-DD-title-here.md`

Example: `_posts/2026-01-20-competition-recap.md`

```markdown
---
layout: post
title: "League Meet 1 Recap: Great Start to the Season!"
date: 2026-01-20
author: Sarah Chen
categories: [competition, recap]
tags: [league-meet, awards]
description: "A summary of our performance at League Meet 1."
image: /assets/images/placeholder.svg
---

We had an amazing time at League Meet 1 this weekend!

## Results

Our robot performed great, finishing with a 4-1 record in qualifying matches.

### Highlights

- Won the Think Award for our engineering notebook
- Highest autonomous score of the event (45 points)
- Made it to semifinals

## What We Learned

1. Our intake needs faster cycle times
2. Driver practice paid off - much smoother driving than scrimmages
3. Pit organization made repairs quick and easy

## Next Steps

We're already working on improvements for League Meet 2:

- Redesigning the intake rollers
- Adding sensors for automatic alignment
- More driver practice!

Thanks to everyone who came out to support us!
```

### Editing Pages

Each main page is a simple Markdown file:

| File | Page |
|------|------|
| `index.md` | Home page |
| `about.md` | About Us page |
| `sponsors.md` | Sponsors page |
| `awards.md` | Awards page |
| `contact.md` | Contact page |
| `season.md` | Current season overview |
| `news.md` | Blog/news listing |
| `handbook.md` | Team handbook |
| `judge-mode.md` | Judge-friendly summary |

Just click on any file, edit it, and commit your changes!

### Adding Your Logo

1. Create or export your team logo as a PNG file (recommended: 200x200 pixels)
2. Go to `assets/images/` in your repository
3. Click **"Add file"** → **"Upload files"**
4. Upload your logo (e.g., `logo.png`)
5. Update `_config.yml` to point to it:

```yaml
site:
  logo: "/assets/images/logo.png"
```

### Adding Team Photos

1. Go to `assets/images/`
2. Create a folder called `team/` (click "Add file" → "Create new file" → type `team/.gitkeep`)
3. Upload photos to `assets/images/team/`
4. Update `_data/team.yml` to reference them:

```yaml
- name: Sarah Chen
  image: /assets/images/team/sarah.jpg
```

**Photo Tips:**
- Square photos work best (e.g., 400x400 pixels)
- Keep file sizes under 500KB for fast loading
- Use JPG for photos, PNG for logos/graphics

---

## Updating Your Season Page

Each season has its own page. Edit `seasons/2025-2026/index.md`:

```markdown
---
layout: season
title: "2025-2026 Season"
season: "2025-2026"
game_name: "INTO THE DEEP"
robot_name: "Phoenix"
permalink: /seasons/2025-2026/
---

## Robot Overview

Phoenix is our competition robot featuring:

- **Drivetrain:** Mecanum wheels for omnidirectional movement
- **Lift:** Dual-stage linear slides reaching 36 inches
- **Intake:** Compliant wheel system for secure game piece control

## Competition Results

| Event | Date | Rank | Awards |
|-------|------|------|--------|
| League Meet 1 | Jan 18 | 3rd | Think Award |
| League Meet 2 | Feb 1 | TBD | - |

## Outreach

This season we've reached 400+ students through:
- 6 STEM workshops at local schools
- 3 library maker events
- Hospital children's ward visit
```

To archive last season, keep its page at `seasons/2024-2025/index.md` and it will appear in the archive.

---

## Local Development (Optional)

If you want to preview changes on your computer before publishing, follow these steps.

### Prerequisites

Install these on your computer:

1. **Ruby** (version 3.0 or higher)
   - Mac: `brew install ruby`
   - Windows: Download from [rubyinstaller.org](https://rubyinstaller.org/)

2. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

3. **Git**
   - Mac: `brew install git`
   - Windows: Download from [git-scm.com](https://git-scm.com/)

### Setup

```bash
# Clone your repository
git clone https://github.com/YOUR-USERNAME/pitcrew.git
cd pitcrew

# Install Ruby dependencies
bundle install

# Install Node dependencies
npm install

# Build the CSS
npm run build:css

# Start the local server
bundle exec jekyll serve
```

Open your browser to `http://localhost:4000` to see your site!

### Making Changes Locally

1. Edit files in your code editor
2. The site auto-refreshes when you save
3. When happy with changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

Your live site will update in 2-3 minutes.

### Watching CSS Changes

The CSS build (`npm run build:css` / `npm run watch:css`) compiles Tailwind utilities into `assets/css/output.css`. **You only need this if you're modifying `main.css` itself** (adding new component classes, changing layout styles, etc.).

**For color changes, skip the CSS build entirely.** Colors are controlled in `_config.yml` and injected by Jekyll — just restart `jekyll serve`.

If you are editing `main.css` styles, run this in a separate terminal to auto-recompile on save:

```bash
npm run watch:css
```

---

## File Structure

Here's what each folder contains:

```
pitcrew/
├── _config.yml           # ⭐ Main settings (team name, socials, etc.)
├── _data/                # ⭐ Your content data
│   ├── team.yml          #    Team member info
│   ├── mentors.yml       #    Mentor info
│   ├── alumni.yml        #    Graduated members
│   ├── sponsors.yml      #    Sponsor info
│   ├── awards.yml        #    Awards won
│   └── events.yml        #    Upcoming events
├── _posts/               # ⭐ Blog posts
├── _layouts/             #    Page templates (don't edit unless customizing)
├── _includes/            #    Reusable components
├── assets/
│   ├── images/           # ⭐ Your images and logos
│   ├── models/           #    3D robot models (GLTF/GLB)
│   ├── css/              #    Stylesheets
│   └── js/               #    JavaScript files
├── docs/                 # ⭐ Documentation pages
├── seasons/              # ⭐ Season-specific pages
│   ├── 2025-2026/
│   └── 2024-2025/
├── scripts/              #    Build scripts
├── .github/workflows/    #    Automated deployment
├── index.md              # ⭐ Home page
├── about.md              # ⭐ About page
├── sponsors.md           # ⭐ Sponsors page
├── awards.md             # ⭐ Awards page
├── contact.md            # ⭐ Contact page
└── ... (other pages)

⭐ = Files you'll commonly edit
```

---

## Advanced Features

### 3D Robot Viewer

Display an interactive 3D model of your robot:

1. Export your CAD as GLTF or GLB format
2. Upload to `assets/models/robot.glb`
3. Add to your season page:

```liquid
{% include components/robot-viewer.html
   model_src="/assets/models/robot.glb"
   alt_text="3D model of Phoenix robot"
%}
```

### Custom Colors

Edit `_config.yml` to match your team colors — **this is the only file you need to change**. No CSS rebuild required; just restart `jekyll serve` and every gradient, button, badge, and border updates automatically.

```yaml
theme:
  colors:
    # Brand colors
    primary: "#003974"              # Buttons, links, gradients
    primary_highlight: "#002855"    # Hover states, gradient midpoint
    primary_darkest: "#001a3d"      # Hero gradient end stop
    secondary: "#F57E25"            # Accent color (highlights, badges)
    secondary_highlight: "#d96a1f"  # Accent hover states
    # Semantic colors
    success: "#28a745"
    info: "#17a2b8"
    warning: "#f0b37e"
    danger: "#dc3545"
    # Sponsor tier border colors
    sponsor_platinum: "#9ca3af"
    sponsor_gold: "#eab308"
    sponsor_silver: "#d1d5db"
    sponsor_bronze: "#92400e"
```

Colors are injected into every page's `<head>` as CSS custom properties by Jekyll at build time, overriding any compiled values in `output.css`. All components reference these variables — never hardcoded hex values — so a single edit to `_config.yml` propagates everywhere.

### Disabling Features

Turn off features you don't need in `_config.yml`:

```yaml
features:
  blog: true           # News/blog section
  docs: true           # Documentation section
  cad_viewer: false    # 3D model viewer (disable if not using)
  circuit_viewer: false
  search: true
```

---

## Troubleshooting

### "My changes aren't showing up"

1. Go to the **Actions** tab in your repository
2. Check if the latest workflow has a green checkmark
3. If there's a red X, click on it to see the error
4. Wait 2-3 minutes after the green checkmark for changes to appear
5. Try a hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "The site looks broken"

This usually means a YAML syntax error. Check:
- All quotes are matched (`"text"` not `"text`)
- Colons have a space after them (`key: value` not `key:value`)
- Indentation uses spaces, not tabs

### "Images aren't loading"

1. Make sure the file path is correct (case-sensitive!)
2. Check that the image was actually uploaded
3. Paths should start with `/assets/images/`

### "I messed something up!"

Don't panic! GitHub keeps history of all changes:

1. Go to the file you want to restore
2. Click **History**
3. Find a version that worked
4. Click **"..."** → **"Revert changes"**

---

## Getting Help

- **Issues:** Open an issue on this repository
- **Discussions:** Use GitHub Discussions for questions
- **FIRST Forums:** Ask the broader community for help

---

## Contributing

Found a bug? Have an idea? Contributions are welcome!

1. Fork this repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## License

MIT License — free to use for any robotics team!

---

## Credits

Built with:
- [Jekyll](https://jekyllrb.com/) — Static site generator
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Google Model Viewer](https://modelviewer.dev/) — 3D viewer

Color scheme based on official FTC documentation styling.

---

**Good luck this season! 🤖**

*Made with ❤️ for the robotics community*
