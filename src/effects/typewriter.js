// Types a heading out when it scrolls into view.

// Contents
// 1. Typewriter
//    - addTypewriter()

// 1. Typewriter

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

addTypewriter(document.querySelector('#about h2'));
addTypewriter(document.querySelector('#education h2'));
addTypewriter(document.querySelector('#projects h2'));
addTypewriter(document.querySelector('#contact h2'));