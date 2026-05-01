// ============================================================
//  interactions.js — Ola Jin Myhre Nymoen Portfolio
//  All JavaScript lives here, separate from the HTML
// ============================================================




// ============================================================
//  NIGHT MODE — klikk på navnet for å slå på partikler
// ============================================================

function toggleNightMode() {
    const turningOn = !document.body.classList.contains('night-mode');
    document.body.classList.toggle('night-mode');

    if (turningOn) {
        particles.length = 0;
        for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());
        const _t9 = TIERS[9];
        particles.push({
            tier: 9, x: 0, y: 0, cx: 0, cy: 0,
            z: Z_CENTER, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, vz: 0,
            size: rnd(_t9.size[0], _t9.size[1]), mass: _t9.mass, inertia: _t9.inertia,
            glowMult: _t9.glowMult, centerPull: 0.00003, repelDist: CONFIG.attract.repelDist,
            lifeMax: Infinity, life: _t9.fadeIn, fadeIn: _t9.fadeIn,
            color: _t9.color, spin: 1, ecc: 0.6 + Math.random() * 0.8,
            orbitAngle: Math.random() * Math.PI * 2, isPulser: false, isDefaultTier9: true,
        });
        impulseRings.length = 0;
        firstPulse = true;
        firstPulseTimer = 0;
        pulseReady = false;
    }
}

const nameToggle = document.getElementById('name-toggle');
if (nameToggle) nameToggle.addEventListener('click', toggleNightMode);

const navNightToggle = document.getElementById('nav-night-toggle');
if (navNightToggle) navNightToggle.addEventListener('click', toggleNightMode);


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

    window.addEventListener('scroll', updateScroll);
    updateScroll();
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


