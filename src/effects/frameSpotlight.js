//  FRAME SPOTLIGHT — passes the mouse position to any element with
//  [data-spotlight] as --spot-x / --spot-y, for the frame highlight in CSS.
//  Delegated from document, so it also covers the navbar, which is inserted later.
//
//  Touch screens have no hover or mouse movement, so a tap places the light
//  instead and adds .spot-active: [data-spotlight="hold"] keeps it until the
//  next tap (the navbar, like an app's tab bar); anything else lets it fade.


const TAP_GLOW = 700;   // ms a tap lights up a card before it fades


function setSpot(target, e) {
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
    target.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
}


document.addEventListener('pointermove', function(e) {
    if (e.pointerType !== 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (target) setSpot(target, e);
}, { passive: true });


document.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'mouse') return;
    const target = e.target.closest('[data-spotlight]');
    if (!target) return;

    setSpot(target, e);
    target.classList.add('spot-active');
    if (target.dataset.spotlight === 'hold') return;

    clearTimeout(target.spotTimer);
    target.spotTimer = setTimeout(function() { target.classList.remove('spot-active'); }, TAP_GLOW);
}, { passive: true });
