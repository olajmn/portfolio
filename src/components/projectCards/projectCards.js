//  PROJECT CARDS — image carousel on the architecture card, and show/hide
//  and copy for the demo password (the frame spotlight is effects/frameSpotlight.js)


const EYE_ICON     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';
const COPY_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const CHECK_ICON   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12.5l5 5L20 6.5"/></svg>';

const CAROUSEL_INTERVAL = 3500;   // ms per image


document.querySelectorAll('.project-password').forEach(function(box) {
    const password = box.dataset.password;

    box.innerHTML = '<span class="password-text"></span>'
        + '<button type="button" class="project-link password-toggle"></button>'
        + `<button type="button" class="project-link password-copy" aria-label="Copy password">${COPY_ICON}</button>`;

    const text       = box.querySelector('.password-text');
    const toggle     = box.querySelector('.password-toggle');
    const copyButton = box.querySelector('.password-copy');
    let visible = false;
    text.textContent = password;

    function render() {
        text.hidden = !visible;
        copyButton.hidden = !visible;
        toggle.innerHTML = visible ? EYE_OFF_ICON : 'Show password ' + EYE_ICON;
        toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    }

    toggle.addEventListener('click', function() {
        visible = !visible;
        render();
    });

    copyButton.addEventListener('click', function() {
        // Clipboard needs https or localhost; the text stays selectable as a fallback
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(password).then(function() {
            // Show the check briefly, then close the password again
            copyButton.innerHTML = CHECK_ICON;
            setTimeout(function() {
                copyButton.innerHTML = COPY_ICON;
                visible = false;
                render();
            }, 1500);
        }).catch(function() {});
    });

    render();
});

// Cross-fade through the images, like a slow GIF. Reduced motion keeps the first image.
document.querySelectorAll('[data-carousel]').forEach(function(carousel) {
    const images = carousel.querySelectorAll('img');
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let current = 0;
    setInterval(function() {
        images[current].classList.remove('is-active');
        current = (current + 1) % images.length;
        images[current].classList.add('is-active');
    }, CAROUSEL_INTERVAL);
});
