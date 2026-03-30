// ============================================================
//  app.js — Ola Jin Myhre Nymoen Portfolio
//  All JavaScript lives here, separate from the HTML
// ============================================================


// ============================================================
//  FORSIDEN: Hero-tittel krymper og sklir opp på scroll
// ============================================================

// ============================================================
//  ANCHOR SCROLL FIX
//  Sørger for at nav-lenker alltid lander på riktig sted,
//  uavhengig av hvor på siden du er.
// ============================================================

// ============================================================
//  NAV DISTORTION — lupe-effekt som følger musen
//  Oppdaterer CSS-variabler --mouse-x og --mouse-y i sanntid
//  ::before pseudo-elementet bruker disse til å flytte sirkelen
// ============================================================

const navEl = document.querySelector('nav');
if (navEl) {
    navEl.addEventListener('mousemove', function(e) {
        const rect = navEl.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
        navEl.style.setProperty('--mouse-x', x);
        navEl.style.setProperty('--mouse-y', y);
    });
}


document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
    });
});


const heroSection = document.getElementById('hero');

if (heroSection) {
    const heroH1    = heroSection.querySelector('h1');
    const heroTitle = heroSection.querySelector('.title');

    const startFontSize = 96;
    const scrollRange   = 340;

    window.addEventListener('scroll', function () {
        const progress = Math.min(window.scrollY / scrollRange, 1);

        const fontSize   = startFontSize - (startFontSize - 12) * progress;
        const translateY = -(progress * 220);

        heroH1.style.fontSize  = fontSize + 'px';
        heroH1.style.transform = `translateY(${translateY}px)`;
        heroH1.style.opacity   = progress >= 1 ? '0' : '1';

        if (heroTitle) {
            heroTitle.style.fontSize  = (13 - 3 * progress) + 'px';
            heroTitle.style.transform = `translateY(${translateY}px)`;
        }
    });
}


// ============================================================
//  ABOUT: innholdet fader og sklir ut når du scroller forbi
//
//  getBoundingClientRect().top gir oss hvor toppen av seksjonen
//  er relativt til vinduet. Når den blir negativ, er seksjonen
//  på vei ut av synet — da starter vi fade-effekten.
// ============================================================

const aboutSection = document.getElementById('about');



// ============================================================
//  TYPEWRITER — "About" skriver seg selv når siden laster
//
//  Slik fungerer det:
//  1. Vi tømmer h2-teksten med en gang
//  2. Vi bruker setInterval() — en funksjon som gjentar seg
//     med et fast tidsintervall (her: hver 120ms)
//  3. For hver gang legger vi til én bokstav
//  4. Når alle bokstavene er skrevet, stopper vi og viser markøren
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

// Bruk funksjonen på About og Projects
addTypewriter(document.querySelector('#about h2'));
addTypewriter(document.querySelector('#projects h2'));
addTypewriter(document.querySelector('#contact h2'));


// ============================================================
//  SHRINKING TITLE ON SCROLL (prosjektsider)
//  Tittelen krymper gradvis fra stor til liten når man scroller.
// ============================================================

// ============================================================
//  BIO LINES — font-weight animerer basert på scroll-posisjon
//
//  Slik fungerer det:
//  1. Vi henter midten av hvert avsnitt (getBoundingClientRect)
//  2. Vi regner ut avstand til midten av skjermen
//  3. Jo nærmere midten, jo høyere font-weight (tykkere)
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


const stickyHeader = document.querySelector('.project-header-sticky');
const stickyH1 = stickyHeader ? stickyHeader.querySelector('h1') : null;

if (stickyH1) {
    const maxFontSize = 72;
    const minFontSize = 22;
    const maxPadding = 160;
    const minPadding = 16;
    const scrollRange = 250;

    window.addEventListener('scroll', function() {
        const progress = Math.min(window.scrollY / scrollRange, 1);

        const fontSize = maxFontSize - (maxFontSize - minFontSize) * progress;
        const padding  = maxPadding  - (maxPadding  - minPadding)  * progress;

        stickyH1.style.fontSize       = fontSize + 'px';
        stickyHeader.style.paddingTop = padding  + 'px';
    });
}
