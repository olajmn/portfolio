# Portfolio

Personal developer portfolio — built with plain HTML, CSS, and vanilla JavaScript (no framework, no build step).

**Live site:** https://olajmn.github.io/portfolio/

## Highlights

- Custom canvas particle system (pseudo-3D projection, physics-based movement, no library) — revealed in dark mode
- Dark/light mode toggle
- Scroll-driven effects (typewriter, fade, hero transform)

## Tech

- Vanilla JavaScript (ES modules)
- CSS (no preprocessor)
- No frameworks, no bundler — runs directly in the browser

## Structure

```
index.html              Page markup (home, about, projects, education, contact)
assets/images/          Images
src/
  main.js               Entry point — imports and initializes everything below
  components/
    navbar/             Navbar markup + dark/light mode toggle
    particles/          Canvas particle animation (has its own README)
    projectCards/       Project grid and hover, carousel.js, demoPassword.js/.css
  effects/
    anchorScroll.js     Smooth scroll to sections
    heroScroll.js       Hero title shrinks/moves on scroll
    typewriter.js       Section titles type themselves in on scroll
    textFade.js         Bio lines fade based on scroll position
    frameSpotlight.js   Frame highlight for cards and navbar (mouse and touch)
  styles/               Base, layout, and night-mode styles
```

## How this project is worked on

The way of working is in `workflow/`: the plan in `workflow/TODO.md`, the documentation in `workflow/docs/` (start with `00-brief.md`), and the rules in `workflow/CONVENTIONS.md` and `workflow/COLLABORATION.md`.
