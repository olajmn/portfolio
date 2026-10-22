//  COLOR WAVE — optional add-on: clicking the page in night mode sends a pulse
//  from the click point that recolours the particles as it spreads, moving to
//  the next palette in PALETTES each time. Everything for this feature lives in
//  this file; to turn it off, remove its import from src/main.js.


import { addPulseAt, PALETTE_NAMES, DEFAULT_PALETTE } from './particles.js';


// Clicks meant for something else are skipped: links, buttons, the navbar,
// the name that toggles night mode, and clicks that end a text selection.
const CLICK_IGNORE = 'a, button, input, textarea, nav, #name-toggle';

let paletteIndex = PALETTE_NAMES.indexOf(DEFAULT_PALETTE);


document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('night-mode')) return;
    if (e.target.closest(CLICK_IGNORE)) return;
    if (window.getSelection().toString()) return;

    const next = (paletteIndex + 1) % PALETTE_NAMES.length;
    if (addPulseAt(e.clientX, e.clientY, PALETTE_NAMES[next])) paletteIndex = next;
});
