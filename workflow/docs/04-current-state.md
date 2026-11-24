# 04 — Current State

What is true in the project now; update it in the same session that makes it untrue.

## 1. Run it

| What | Command |
|---|---|
| Open the site | In VS Code, right-click `index.html`, "Open with Live Server" |
| Check Markdown references | `python3 workflow/tools/check_references.py` |
| Review the latest step | "Review today's changes", or `/review-step` (`REVIEW.md`) |

## 2. Repository

| Path | State |
|---|---|
| `index.html` | The page: home, about, projects, education, contact |
| `src/main.js` | The entry. Imports the navbar, five effects, the particle scene, the colour wave, the carousel and the password field |
| `src/components/` | `navbar/`, `particles/`, `projectCards/` |
| `src/effects/` | `anchorScroll.js`, `heroScroll.js`, `typewriter.js`, `textFade.js`, `frameSpotlight.js` |
| `src/styles/` | `base.css`, `layout.css`, `night-mode.css` |
| `assets/images/` | `profile.jpg`, `project010.jpg`, and `architecture/` for the carousel. `passage.jpg` is in that folder and is commented out of the carousel |
| `README.md` | Public description of the site and its structure |

Folder readmes, per `global-standards/FORM.md` § 2: `src/README.md`, `src/components/README.md`, `src/components/projectCards/README.md`, `src/effects/README.md`, `src/styles/README.md`, `assets/images/README.md`. `src/components/particles/README.md` is the particle scene's own description, and it also names the principle. Each says the principle's word is not settled. `src/components/navbar/` holds one part, so it has none. `workflow/` has none.

`global-standards/` at the project root is gone. The standards live in `workflow/global-standards/`.

The source files are not rewritten to `global-standards/_CODE_STRUCTURE.md`. `particles.js`, `colorWave.js` and `frameSpotlight.js` already have a Contents block; the other source files do not. There is no structure checker (`05-decisions.md` #1).

| Path | State |
|---|---|
| `CLAUDE.md` | Loads Stellata and the project rules from `workflow/`. The four writing and code guides are given by the hook, not listed with `@` |
| `CLAUDE.local.md` | Private notes. Still the empty prompt. Listed in `.gitignore` |
| `.claude/settings.json` | The hook that runs `workflow/tools/before_writing.py` before a write |
| `.claude/settings.local.json` | Local Claude Code permissions. Not part of the template |
| `.claude/commands/` | `.claude/commands/review-step.md`, the `/review-step` shortcut to `REVIEW.md` |
| `workflow/COLLABORATION.md`, `workflow/CONVENTIONS.md` | The template's versions, with this project's rules merged in |
| `workflow/REVIEW.md` | How the latest changes are reviewed |
| `workflow/TODO.md` | Active is empty. Ideas hold two lines. Nothing is in Priority or Queue |
| `workflow/docs/` | 00, 02, 03, 04 and 05 filled in. `01-research.md` is still the empty prompt. `03-architecture.md` § 1 is not settled |
| `workflow/global-standards/` | Copied unchanged from `~/Desktop/wf-workflow`, including `STELLATA.md`, `STELLATA_DEFINITIONS.md` and `FORM.md` |
| `workflow/tools/` | `check_references.py` and `before_writing.py`, copied unchanged |

## 3. Environment

- Plain HTML, CSS and JavaScript (ES modules). No build step and no package dependencies.
- The text face is Helvetica Neue, set as `--font` in `src/styles/base.css`. IBM Plex Mono is loaded from Google Fonts and used as `--font-mono`.
- Hosted with GitHub Pages from `main`: https://olajmn.github.io/portfolio/
- The tools need Python 3. Nothing else is installed for the project.

## 4. Known limits

- `main` is the only branch, and it is the published site.
- On screens narrower than 768 px the particle scene draws 80 particles instead of 250, decided once, on page load. The canvas is CSS pixels, not device pixels (`src/components/particles/README.md`).
- Which browsers the page has been checked in is not recorded.
