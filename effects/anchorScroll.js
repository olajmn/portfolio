//  Sørger for at nav-lenker alltid lander på riktig sted,


document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const href = anchor.getAttribute('href');
    const offsets = {
        '#home':      70,
        '#about':     70,
        '#education': 30,
        '#work':       0,
        '#contact':   70,
    };
    const offset = offsets[href] ?? 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
});