# patrickdwyer.com — Claude Code Context

## Project Docs

| File | Purpose |
| ---- | ------- |
| [TASKS.md](TASKS.md) | Structured task backlog — numbered tasks with phases and sub-items |
| [TODO.md](TODO.md) | Free-form scratchpad for quick notes, reminders, and in-progress thoughts |
| [GAPS.md](GAPS.md) | Known code stubs, unimplemented functions, and placeholder values |
| [IDEAS.md](IDEAS.md) | Long-term ideas and future directions, no commitment implied |

## Overview

Personal CV/resume website for Patrick Dwyer at patrickdwyer.com. A single-page vanilla HTML/CSS/JS site built with Vite, with PWA (offline) support via vite-plugin-pwa. Deployed via rsync to a remote server at rulepop.com.

Structure:
- `index.html` — the entire CV page (single HTML file, no framework)
- `src/scripts/main.js` — entry point JS
- `src/scripts/pwa.js` — PWA service worker registration
- `src/styles/cv.scss` → compiled to `src/styles/cv.css` — main stylesheet
- `src/styles/coverLetter.scss` → `coverLetter.css` — cover letter styles
- `src/styles/_boilerplate.scss`, `_fonts.scss`, `_print.scss`, `_theme.scss` — partials
- `public/` — static assets (images, CV PDF, etc.)
- `dist/` — build output (not committed)
- `pwa-assets.config.js` — PWA icon generation config

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — build to `dist/`
- `npm run preview` — preview the production build
- `./deploy.sh` — rsync `dist/` to `root@rulepop.com:/var/www/_extra/patrickdwyer.com`

Note: SCSS files must be compiled manually (no build step watches them automatically — `cv.css` is committed directly).

## Key Patterns

- All content lives in `index.html` — no templating, no components
- SVG icons are inlined as `<symbol>` sprites at the bottom of `index.html` and referenced via `<use href="#i-*">`
- Print styles are handled via `_print.scss`; some elements use `.no-print` / `.print` classes to toggle visibility
- CV PDF is at `public/cv.pdf` and linked from the footer download button — generated manually by printing the site in the browser (File → Print → Save as PDF), not via any automated tool
- PWA theme color: `#D3D3FF`
