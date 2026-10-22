//  DEMO PASSWORD — Bitwarden-style field in each .project-password: the
//  password masked as dots, an eye to show/hide it, and a copy button that
//  works without revealing it. The password itself is the element's
//  data-password in index.html; styles in projectCards.css, section 5.


const EYE_ICON     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';
const COPY_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const CHECK_ICON   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12.5l5 5L20 6.5"/></svg>';


document.querySelectorAll('.project-password').forEach(function(box) {
    const password = box.dataset.password;
    const masked   = '•'.repeat(password.length);   // one dot per character

    box.innerHTML = '<span class="password-text" aria-label="Demo password"></span>'
        + '<button type="button" class="project-link password-toggle" data-tooltip="Toggle visibility"></button>'
        + `<button type="button" class="project-link password-copy" aria-label="Copy password" data-tooltip="Copy password">${COPY_ICON}</button>`;

    const text       = box.querySelector('.password-text');
    const toggle     = box.querySelector('.password-toggle');
    const copyButton = box.querySelector('.password-copy');
    let visible = false;

    function render() {
        text.textContent = visible ? password : masked;
        text.classList.toggle('is-visible', visible);
        toggle.innerHTML = visible ? EYE_OFF_ICON : EYE_ICON;
        toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    }

    toggle.addEventListener('click', function() {
        visible = !visible;
        render();
    });

    copyButton.addEventListener('click', function() {
        // Clipboard needs https or localhost
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(password).then(function() {
            // Show the check briefly, then mask the password again
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
