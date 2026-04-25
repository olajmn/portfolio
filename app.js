// ============================================================
//  app.js — Ola Jin Myhre Nymoen Portfolio
//  All JavaScript lives here, separate from the HTML
// ============================================================




// ============================================================
//  ANCHOR SCROLL FIX
//  Sørger for at nav-lenker alltid lander på riktig sted,
//  uavhengig av hvor på siden du er.
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
    });
});

// ============================================================
//  HERO — tittelen krymper og sklir opp på scroll
// ============================================================

const homeSection = document.getElementById('home');

if (homeSection) {
    const homeH1    = homeSection.querySelector('h1');
    const homeTitle = homeSection.querySelector('.title');

    const startFontSize = 96;
    const scrollRange   = 340;

    window.addEventListener('scroll', function () {
        const progress = Math.min(window.scrollY / scrollRange, 1);

        const fontSize   = startFontSize - (startFontSize - 12) * progress;
        const translateY = -(progress * 220);

        homeH1.style.fontSize  = fontSize + 'px';
        homeH1.style.transform = `translateY(${translateY}px)`;
        homeH1.style.opacity   = progress >= 1 ? '0' : '1';

        if (homeTitle) {
            homeTitle.style.fontSize  = (13 - 3 * progress) + 'px';
            homeTitle.style.transform = `translateY(${translateY}px)`;
        }
    });
}


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
    const cursor   = document.createElement('span');
    cursor.className   = 'typing-cursor';
    cursor.textContent = '.';

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
addTypewriter(document.querySelector('#work h2'));
addTypewriter(document.querySelector('#contact h2'));


// ============================================================
//  BIO LINES — teksten fader basert på scroll-posisjon
//
//  Slik fungerer det:
//  1. Vi henter midten av hvert avsnitt (getBoundingClientRect)
//  2. Vi regner ut avstand til midten av skjermen
//  3. Jo nærmere midten, jo tydeligere tekst (opacity nærmere 1)
//  4. Dette kjøres på hvert scroll-event
// ============================================================

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


