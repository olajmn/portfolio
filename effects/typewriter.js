// ============================================================
//  TYPEWRITER — "About" skriver seg selv når siden laster
//
//  Slik fungerer det:
//  1. Vi tømmer h2-teksten med en gang
//  2. Vi bruker setInterval() — en funksjon som gjentar seg
//     med et fast tidsintervall (her: hver 40ms)
//  3. For hver gang legger vi til én bokstav
//  4. Når alle bokstavene er skrevet, stopper vi
// ============================================================
// Gjenbrukbar funksjon — tar et h2-element og setter opp typewriter på det



function addTypewriter(element) {
    if (!element) return;

    const fullText = element.textContent;
    let activeInterval = null;

    function startTyping() {
        clearInterval(activeInterval);
        element.textContent = '';

        let i = 0;
        activeInterval = setInterval(function () {
            element.textContent += fullText[i];
            i++;
            if (i === fullText.length) clearInterval(activeInterval);
        }, 40);  // 40ms per bokstav — rask "skudd"-effekt
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) startTyping();
        });
    }, { threshold: 0.2 });

    observer.observe(element);
}

// Bruk funksjonen på ABOUT WORK CONTACT
addTypewriter(document.querySelector('#about h2'));
addTypewriter(document.querySelector('#education h2'));
addTypewriter(document.querySelector('#work h2'));
addTypewriter(document.querySelector('#contact h2'));