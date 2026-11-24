// Cross-fades the images in any [data-carousel]. The stacking and fade are in projectCards.css.

// Contents
// 1. Playback
//    - CAROUSEL_INTERVAL

// 1. Playback

const CAROUSEL_INTERVAL = 3500;   // ms per image


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
