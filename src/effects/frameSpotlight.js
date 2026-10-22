//  FRAME SPOTLIGHT — passes the mouse position to any element with
//  [data-spotlight] as --spot-x / --spot-y, for the frame highlight in CSS.
//  Delegated from document, so it also covers the navbar, which is inserted later.
//
//  Touch screens have no hover or mouse movement, so a tap places the light
//  instead and adds .spot-active: [data-spotlight="hold"] keeps it until the
//  next tap (the navbar, like an app's tab bar); anything else lets it fade.
//  On a "hold" element the light snaps to the centre of the nearest link or
//  button, so it marks that item rather than the exact finger position, and it
//  clears once the user scrolls with a finger.


const TAP_GLOW    = 700;   // ms a tap lights up a card before it fades
const SCROLL_DRAG = 10;    // px a finger must move before it counts as scrolling


function setSpot(target, x, y) {
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', (x - rect.left) + 'px');
    target.style.setProperty('--spot-y', (y - rect.top) + 'px');
}


document.addEventListener('pointermove', function(e) {
    if (e.pointerType !== 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (target) setSpot(target, e.clientX, e.clientY);
}, { passive: true });


document.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (!target) return;

    if (target.dataset.spotlight === 'hold') {
        const item = nearestItem(target, e.clientX);
        if (!item) return;
        const r = item.getBoundingClientRect();
        setSpot(target, r.left + r.width / 2, r.top + r.height / 2);
        target.classList.add('spot-active');
        return;
    }

    setSpot(target, e.clientX, e.clientY);
    target.classList.add('spot-active');

    clearTimeout(target.spotTimer);
    target.spotTimer = setTimeout(function() { target.classList.remove('spot-active'); }, TAP_GLOW);
}, { passive: true });


// The link or button whose horizontal centre is closest to x, so a tap in the
// gap between two items still marks one of them
function nearestItem(container, x) {
    let best = null, bestDist = Infinity;
    for (const item of container.querySelectorAll('a, button')) {
        const r = item.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - x);
        if (dist < bestDist) { best = item; bestDist = dist; }
    }
    return best;
}


// A finger scroll clears the held mark. Taps on a nav link also scroll the page
// (smooth scroll to the section), so only real finger drags count, not scroll events.
let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (touchStartY === null || Math.abs(e.touches[0].clientY - touchStartY) < SCROLL_DRAG) return;
    touchStartY = null;
    for (const el of document.querySelectorAll('[data-spotlight="hold"].spot-active')) el.classList.remove('spot-active');
}, { passive: true });
