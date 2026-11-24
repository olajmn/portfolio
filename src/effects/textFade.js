// Fades each bio line by how far it is from the centre of the screen.

// Contents
// 1. Fade
//    - bioLines
//    - updateBioWeights()

// 1. Fade

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