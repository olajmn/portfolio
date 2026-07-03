// ============================================================
//  TYPEWRITER — "About" types itself out when the page loads
//
//  How it works:
//  1. We clear the h2 text immediately
//  2. We use setInterval() — a function that repeats itself
//     at a fixed time interval (here: every 40ms)
//  3. Each time, we add one letter
//  4. When all the letters have been typed, we stop
// ============================================================
// Reusable function — takes an h2 element and sets up a typewriter on it



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
        }, 40);  // 40ms per letter — fast "burst" effect
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) startTyping();
        });
    }, { threshold: 0.2 });

    observer.observe(element);
}

// Use the function on ABOUT WORK CONTACT
addTypewriter(document.querySelector('#about h2'));
addTypewriter(document.querySelector('#education h2'));
addTypewriter(document.querySelector('#work h2'));
addTypewriter(document.querySelector('#contact h2'));