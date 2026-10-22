//  CAROUSEL — cross-fades through the images in any [data-carousel], like a
//  slow GIF (used on the architecture card). Reduced motion keeps the first image.
//  The stacking and fade live in projectCards.css, section 2.


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
