//  BIO LINES — teksten fader basert på scroll-posisjon
//
//  Slik fungerer det:
//  1. Vi henter midten av hvert avsnitt (getBoundingClientRect)
//  2. Vi regner ut avstand til midten av skjermen
//  3. Jo nærmere midten, jo tydeligere tekst (opacity nærmere 1)
//  4. Dette kjøres på hvert scroll-event


const bioLines = document.querySelectorAll('.bio-line');

if (bioLines.length) {
    function updateBioWeights() {
        const viewportCenter = window.innerHeight / 2;

        bioLines.forEach(function(line) {
            const rect       = line.getBoundingClientRect();
            const lineCenter = rect.top + rect.height / 2;
            const distance   = Math.abs(lineCenter - viewportCenter);

            // normalized: 0 = helt i midten, 1 = langt unna
            const normalized = Math.min(distance / (window.innerHeight * 0.45), 1);

            // opacity: 1 i midten, 0.2 når langt unna
            const opacity = 1 - 0.8 * normalized;
            line.style.opacity = opacity;
        });
    }

    window.addEventListener('scroll', updateBioWeights);
    updateBioWeights(); // kjør én gang ved lasting
}