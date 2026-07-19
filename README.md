# patrickdwyer.com

Personal CV/resume website for Patrick Dwyer — a single-page vanilla HTML/CSS/JS site built with Vite, with PWA (offline) support via `vite-plugin-pwa`.

## Structure

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

- `npm run dev` — start the Vite dev server
- `npm run build` — build to `dist/`
- `npm run preview` — preview the production build

SCSS is compiled manually — nothing watches it automatically, and `cv.css` is committed directly.

## Deployment

On push to `main`, `.github/workflows/build.yml` builds a container image (Vite build → nginx) and pushes it to ECR as `patrickdwyer-com:<git-sha>`, keyless via GitHub OIDC. Promoting an image to the running dev site (`dev.patrickdwyer.com`) happens from the `platform-gitops` repo (`./deploy patrickdwyer-com`), not here.

The apex site (`patrickdwyer.com`) is currently served separately on a third-party host; the old `deploy.sh` rsync path was retired.

## Key patterns

- All content lives in `index.html` — no templating, no components.
- SVG icons are inlined as `<symbol>` sprites at the bottom of `index.html`, referenced via `<use href="#i-*">`.
- Print styles live in `_print.scss`; `.no-print` / `.print` classes toggle visibility.
- The CV PDF (`public/cv.pdf`) is generated manually (browser File → Print → Save as PDF) and linked from the footer download button.
- PWA theme color: `#D3D3FF`.
