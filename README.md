# Portfolio

Personal developer portfolio — built with plain HTML, CSS, and vanilla JavaScript (no framework, no build step).

**Live site:** https://olajmn.github.io/portfolio/

## Highlights

- Canvas-based particle animation background
- Dark/light mode toggle
- Scroll-driven effects (typewriter, fade, hero transform)

## Tech

- Vanilla JavaScript (ES modules)
- CSS (no preprocessor)
- No frameworks, no bundler — runs directly in the browser

## Structure

```
index.html          Page markup (home, about, education, work, contact)
main.js              Entry point — imports and initializes everything below
components/
  navbar/            Navbar markup + dark/light mode toggle
  particles/         Canvas particle animation
effects/
  anchorScroll.js    Smooth scroll to sections
  heroScroll.js      Hero title shrinks/moves on scroll
  typewriter.js      Section titles type themselves in on scroll
  textFade.js        Bio lines fade based on scroll position
styles/              Base, layout, and night-mode styles
```
