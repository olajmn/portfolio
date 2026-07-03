//  BIO LINES — text fades based on scroll position
//
//  How it works:
//  1. We get the center of each paragraph (getBoundingClientRect)
//  2. We calculate the distance to the center of the screen
//  3. The closer to the center, the more visible the text (opacity closer to 1)
//  4. This runs on every scroll event


const bioLines = document.querySelectorAll('.bio-line');

if (bioLines.length) {
    function updateBioWeights() {
        const viewportCenter = window.innerHeight / 2;

        bioLines.forEach(function(line) {
            const rect       = line.getBoundingClientRect();
            const lineCenter = rect.top + rect.height / 2;
            const distance   = Math.abs(lineCenter - viewportCenter);

            // normalized: 0 = right in the center, 1 = far away
            const normalized = Math.min(distance / (window.innerHeight * 0.45), 1);

            // opacity: 1 in the center, 0.2 when far away
            const opacity = 1 - 0.8 * normalized;
            line.style.opacity = opacity;
        });
    }

    window.addEventListener('scroll', updateBioWeights, { passive: true });
    updateBioWeights(); // run once on load
}