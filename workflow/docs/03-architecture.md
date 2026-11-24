# 03 — Architecture

How the system is put together, and the rules that keep its parts apart. What it does is in `02-product.md`; why it was built this way is in `05-decisions.md`.

## 1. The principle

Not settled (`global-standards/FORM.md` § 1). The folders are in place. The principle's words for them are not chosen: what the hall is, what the porticos are, which side is the front, and each part's level.

What is there now:

| Part | Where | What it does |
|---|---|---|
| Page | `index.html` | The five sections, the project cards, and the links to the stylesheets and to `src/main.js` |
| Entry | `src/main.js` | Starts the navbar and imports the effects, the particle scene and the project-card behaviour |
| Navbar | `src/components/navbar/` | The fixed bar, and the night-mode toggle |
| Particles | `src/components/particles/` | The canvas scene in night mode, and the colour-wave add-on |
| Project cards | `src/components/projectCards/` | The image carousel and the password field |
| Effects | `src/effects/` | Scroll offsets, the hero, the typewriter headings, the bio fade, and the frame highlight |
| Styles | `src/styles/` | Reset, shared properties, section layout, and night-mode overrides. A component's own styles sit next to it |
| Images | `assets/images/` | The portrait, the Project 1 image, and the architecture carousel |

## 2. Rules at the boundaries

- Page content stays in `index.html`. The scripts read it; they do not hold a second copy of a project, a school or a contact detail.
- `src/main.js` is the only file the page loads. Each other script starts because `main.js` imports it, or because a file that `main.js` imports then imports it. `colorWave.js` is the one case of the second: it imports from `particles.js`.
- Night mode is turned on in `src/components/navbar/navbar.js`. That file sets the class `night-mode` on `body` and dispatches `nightmode-toggle`. `particles.js` and `colorWave.js` listen for the event. They do not import the navbar.
- The password a card shows is the `data-password` on that card in `index.html`. `demoPassword.js` reads it and does not store another copy.
- Styles shared by the page live in `src/styles/`. A component's styles live in that component's folder.

## 3. Principles

- No build step: the browser loads the files as they are, as ES modules, so the site runs from any static host.
- The colour wave is optional. Removing its import from `src/main.js` turns it off, and the particle scene keeps working.

## 4. Open decisions

- How § 1 names the parts.
