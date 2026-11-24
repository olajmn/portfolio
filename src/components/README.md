# components

A part of the page that has its own folder.

- `navbar/` — the fixed bar, and the night-mode toggle. One part, so it has no readme of its own.
- `particles/` — the canvas scene shown in night mode, and the colour-wave add-on. Its own description is `particles/README.md`.
- `projectCards/` — the image carousel and the password field on a project card.

Night mode is turned on in `navbar/navbar.js`, which sets `night-mode` on `body` and dispatches `nightmode-toggle`. `particles/` listens for that event. It does not import the navbar.

The principle's word for this folder is not settled (`workflow/docs/03-architecture.md` § 1). It is held by `src/` and holds the three folders above.
