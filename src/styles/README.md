# styles

Styles for the whole page. `index.html` loads them in this order: `base.css`, `layout.css`, `night-mode.css`. A component's own styles live next to that component, not here.

`base.css` holds the reset and the shared custom properties, including `--font` and `--font-mono`. `layout.css` holds the sections. `night-mode.css` holds the night-mode overrides.

The principle's word for this folder is not settled (`workflow/docs/03-architecture.md` § 1). It is held by `src/` and holds the three files above.
