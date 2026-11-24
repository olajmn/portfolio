// A click in night mode sends a pulse that recolours the particles. Remove its import in src/main.js to turn it off.

// Contents
// 1. Setup
//    - styles
//    - CLICK_IGNORE
//    - CLICK_COOLDOWN
//    - HINT_DURATION
//    - HINT_GAP
// 2. Hint
//    - hint
//    - showHint()
//    - hideHint()
// 3. Colour wave


import { addPulseAt, PALETTE_NAMES, DEFAULT_PALETTE } from './particles.js';


// 1. Setup

const styles = document.createElement('link');
styles.rel  = 'stylesheet';
styles.href = new URL('./colorWave.css', import.meta.url).href;
document.head.append(styles);

// Clicks meant for something else are skipped: links, buttons, the navbar,
// the name that toggles night mode, and clicks that end a text selection.
const CLICK_IGNORE = 'a, button, input, textarea, nav, #name-toggle';

// At most one wave per CLICK_COOLDOWN, so rapid clicking can't pile up rings
const CLICK_COOLDOWN = 300;    // ms
const HINT_DURATION  = 2000;   // ms the hint stays before fading on its own
const HINT_GAP       = 10;     // px between the navbar and the hint

let paletteIndex = PALETTE_NAMES.indexOf(DEFAULT_PALETTE);
let lastClick    = 0;
let hintDone     = false;   // once someone has made a wave, the hint never returns
let hintTimer    = null;


// 2. Hint

const hint = document.createElement('div');
hint.className   = 'color-wave-hint';
hint.textContent = 'Click anywhere to change color';
hint.setAttribute('aria-hidden', 'true');
document.body.append(hint);

function showHint() {
    if (hintDone) return;
    const nav = document.querySelector('nav');
    hint.style.top = ((nav ? nav.getBoundingClientRect().bottom : 70) + HINT_GAP) + 'px';
    hint.classList.add('is-shown');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, HINT_DURATION);
}

function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.remove('is-shown');
}

document.addEventListener('nightmode-toggle', () => {
    if (document.body.classList.contains('night-mode')) showHint();
    else hideHint();
});


// 3. Colour wave

document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('night-mode')) return;
    if (e.target.closest(CLICK_IGNORE)) return;
    if (window.getSelection().toString()) return;
    if (e.timeStamp - lastClick < CLICK_COOLDOWN) return;

    const next = (paletteIndex + 1) % PALETTE_NAMES.length;
    if (!addPulseAt(e.clientX, e.clientY, PALETTE_NAMES[next])) return;
    paletteIndex = next;
    lastClick    = e.timeStamp;

    hintDone = true;
    hideHint();
});
