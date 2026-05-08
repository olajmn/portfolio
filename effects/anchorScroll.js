//  Sørger for at nav-lenker alltid lander på riktig sted,


document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
});