// ============================================================
//  app.js — Ola Jin Myhre Nymoen Portfolio
//  All JavaScript lives here, separate from the HTML
// ============================================================


// ============================================================
//  SHRINKING TITLE ON SCROLL
//  Når brukeren scroller, krymper tittelen gradvis fra stor til liten.
//
//  Slik fungerer det:
//  1. Vi lytter på "scroll"-hendelser (hver gang siden scrolles)
//  2. Vi beregner hvor langt brukeren har scrollet (scrollY)
//  3. Vi bruker det til å interpolere (blande) mellom stor og liten font
//  4. "progress" er et tall mellom 0 og 1 — 0 = topp, 1 = ferdig krympet
// ============================================================

const stickyHeader = document.querySelector('.project-header-sticky');
const stickyH1 = stickyHeader ? stickyHeader.querySelector('h1') : null;
const stickyInner = stickyHeader ? stickyHeader.querySelector('.project-header-inner') : null;

if (stickyH1) {
    const maxFontSize = 72;   // startsstørrelse (px)
    const minFontSize = 22;   // sluttstørrelse når sticky (px)
    const maxPadding = 160;   // startpadding øverst (px)
    const minPadding = 16;    // sluttpadding når sticky (px)
    const scrollRange = 250;  // antall piksler scroll for å fullføre effekten

    window.addEventListener('scroll', function() {
        // progress går fra 0.0 til 1.0 basert på scroll
        const progress = Math.min(window.scrollY / scrollRange, 1);

        // interpoler fontstørrelse mellom max og min
        const fontSize = maxFontSize - (maxFontSize - minFontSize) * progress;

        // interpoler padding øverst mellom max og min
        const padding = maxPadding - (maxPadding - minPadding) * progress;

        stickyH1.style.fontSize = fontSize + 'px';
        stickyHeader.style.paddingTop = padding + 'px';
    });
}


// This function runs when the user clicks EN or NO in the nav
function setLanguage(lang) {

    // Find every element on the page that has a "data-en" attribute
    // These are all the elements we want to translate
    document.querySelectorAll('[data-en]').forEach(function(element) {
        // Replace the text with whichever language was chosen
        element.textContent = element.getAttribute('data-' + lang);
    });

    // Update the nav buttons: make the clicked one bold, the other grey
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
