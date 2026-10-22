//  COLOR WAVE — optional add-on: clicking the page in night mode sends a pulse
//  from the click point. Everything for this feature lives in this file; to
//  turn it off, remove its import from src/main.js.


import { addPulseAt } from './particles.js';


// Clicks meant for something else are skipped: links, buttons, the navbar,
// the name that toggles night mode, and clicks that end a text selection.
const CLICK_IGNORE = 'a, button, input, textarea, nav, #name-toggle';


document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('night-mode')) return;
    if (e.target.closest(CLICK_IGNORE)) return;
    if (window.getSelection().toString()) return;

    addPulseAt(e.clientX, e.clientY);
});
