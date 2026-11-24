# effects

Scroll and pointer behaviour. Each file runs when `src/main.js` imports it, and none of them import another file.

- `anchorScroll.js` — a nav link scrolls to its section, with an offset per section.
- `heroScroll.js` — the home title shrinks and slides up on scroll.
- `typewriter.js` — the About, Projects, Education and Contact headings type themselves in when they enter the view.
- `textFade.js` — the About lines fade with scroll position.
- `frameSpotlight.js` — the frame highlight on `[data-spotlight]`, including the navbar, which is inserted later.

The principle's word for this folder is not settled (`workflow/docs/03-architecture.md` § 1). It is held by `src/` and holds the five files above.
