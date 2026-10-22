//  FRAME SPOTLIGHT — passes the mouse position to any element with
//  [data-spotlight] as --spot-x / --spot-y, for the frame highlight in CSS.
//  Delegated from document, so it also covers the navbar, which is inserted later.
//
//  Touch screens have no hover or mouse movement, so a tap places the light
//  instead and adds .spot-active: [data-spotlight="hold"] keeps it until the
//  next tap (the navbar, like an app's tab bar); anything else lets it fade.
//  On a "hold" element the light snaps to the centre of the tapped link or
//  button, so it marks that item rather than the exact finger position.


const TAP_GLOW = 700;   // ms a tap lights up a card before it fades


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
        // Only taps on an item count; taps between items leave the mark where it is
        const item = e.target.closest('a, button');
        if (!item || !target.contains(item)) return;
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
