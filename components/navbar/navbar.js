function createNavbar() {
    return `
    <nav>
        <a href="#home" class="navbar-home" aria-label="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
            </svg>
        </a>

        <span class="navbar-divider"></span>

        <div class="navbar-links">
            <a href="#about">About</a>
            <a href="#education">Education</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
        </div>

        <span class="navbar-divider"></span>

        <button class="navbar-night-toggle" id="navbar-night-toggle">
            <svg class="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg class="icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
        </button>
    </nav>
    `;
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    document.dispatchEvent(new CustomEvent('nightmode-toggle'));
}

export function initNavbar() {
    const container = document.getElementById('navbar');
    if (container) container.innerHTML = createNavbar();

    const toggle = document.getElementById('navbar-night-toggle');
    if (toggle) toggle.addEventListener('click', toggleNightMode);

    const nameToggle = document.getElementById('name-toggle');
    if (nameToggle) nameToggle.addEventListener('click', toggleNightMode);
}
