//  HERO — the title shrinks and slides up on scroll


const homeSection = document.getElementById('home');

if (homeSection) {
    const homeH1    = homeSection.querySelector('h1');
    const homeTitle = homeSection.querySelector('.title');
    const scrollRange = 340;

    function updateScroll() {
        const progress   = Math.min(window.scrollY / scrollRange, 1);
        const scale      = 1 - 0.88 * progress;
        const translateY = -(progress * 220);

        homeH1.style.transform = `translateY(${translateY}px) scale(${scale})`;
        homeH1.style.opacity   = progress >= 1 ? '0' : '1';

        if (homeTitle) {
            homeTitle.style.transform = `translateY(${translateY}px)`;
            homeTitle.style.opacity   = progress >= 1 ? '0' : '1';
        }
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
}              