//  COLOR WAVE — optional add-on: clicking the page in night mode sends a pulse
//  from the click point that recolours the particles as it spreads, moving to
//  the next palette in PALETTES each time. A small "Click anywhere" hint under
//  the navbar shows that it's possible. Everything for this feature lives in
//  this file and colorWave.css (loaded from here); to turn it off, remove its
//  import from src/main.js.

// Contents
//  1. Setup        - styles, settings, state
//  2. Hint         - showHint(), hideHint()
//  3. Colour wave  - the click handler


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
const HINT_DURATION  = 5000;   // ms the hint stays before fading on its own
const HINT_GAP       = 10;     // px between the navbar and the hint

let paletteIndex = PALETTE_NAMES.indexOf(DEFAULT_PALETTE);
let lastClick    = 0;
let hintDone     = false;   // once someone has made a wave, the hint never returns
let hintTimer    = null;


// 2. Hint

const hint = document.createElement('div');
hint.className   = 'color-wave-hint';
hint.textContent = 'Click anywhere';
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
