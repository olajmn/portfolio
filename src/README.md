# src

The JavaScript that runs the site, and the styles the page loads. `main.js` starts the navbar and imports the effects, the particle scene and the project-card behaviour. `components/` holds a part of the page. `effects/` holds scroll and pointer behaviour. `styles/` holds the styles shared by the whole page.

A file here is started from `main.js`, or imported by a file that is. Page content stays in `index.html`.

The principle's word for this folder is not settled (`workflow/docs/03-architecture.md` § 1). It is held by the project and holds `main.js`, `components/`, `effects/` and `styles/`.
