//  FRAME SPOTLIGHT — passes the mouse position to any element with
//  [data-spotlight] as --spot-x / --spot-y, for the frame highlight in CSS.
//  Delegated from document, so it also covers the navbar, which is inserted later.


document.addEventListener('pointermove', function(e) {
    const target = e.target.closest('[data-spotlight]');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
    target.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
}, { passive: true });
