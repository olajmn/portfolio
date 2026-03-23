// ============================================================
//  app.js — Ola Jin Myhre Nymoen Portfolio
//  All JavaScript lives here, separate from the HTML
// ============================================================


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
