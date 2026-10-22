//  FRAME SPOTLIGHT — places the frame highlight on any element with
//  [data-spotlight] by setting --spot-x / --spot-y (the light itself is CSS).
//  Delegated from document, so it also covers the navbar, which is inserted later.

// Contents
//  1. Helpers       - setSpot(), nearestItem()
//  2. Mouse         - the light follows the pointer
//  3. Touch tap     - [data-spotlight="hold"] (navbar) keeps a mark on the tapped
//                     item, like an app's tab bar; anything else glows briefly
//  4. Touch scroll  - a finger scroll clears the held mark


const TAP_GLOW    = 1000;  // ms a tap lights up a card before it fades
const SCROLL_DRAG = 10;    // px a finger must move before it counts as scrolling


// 1. Helpers

function setSpot(target, x, y) {
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', (x - rect.left) + 'px');
    target.style.setProperty('--spot-y', (y - rect.top) + 'px');
}

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


// 2. Mouse

document.addEventListener('pointermove', function(e) {
    if (e.pointerType !== 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (target) setSpot(target, e.clientX, e.clientY);
}, { passive: true });


// 3. Touch tap — touch screens have no hover, so a tap places the light and
//    adds .spot-active (shown by the components' CSS)

document.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (!target) return;

    if (target.dataset.spotlight === 'hold') {
        // Mark the item, not the exact finger position
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


// 4. Touch scroll — tapping a nav link also scrolls the page (smooth scroll to
//    the section), so only real finger drags clear the mark, not scroll events

let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (touchStartY === null || Math.abs(e.touches[0].clientY - touchStartY) < SCROLL_DRAG) return;
    touchStartY = null;
    for (const el of document.querySelectorAll('[data-spotlight="hold"].spot-active')) el.classList.remove('spot-active');
}, { passive: true });
