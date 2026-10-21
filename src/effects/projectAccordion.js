//  PROJECT CARDS — animate the <details> open/close as a smooth slide
//  instead of the native instant show/hide.


document.querySelectorAll('.project-card').forEach(function(card) {
    const summary = card.querySelector('.project-summary');
    const body = card.querySelector('.project-body');
    if (!summary || !body) return;

    summary.addEventListener('click', function(e) {
        e.preventDefault();
        if (card.classList.contains('is-animating')) return;

        card.classList.add('is-animating');

        if (card.open) {
            closeCard();
        } else {
            openCard();
        }

        function openCard() {
            card.open = true;
            const endHeight = body.getBoundingClientRect().height;
            body.style.height = '0px';
            requestAnimationFrame(function() {
                body.style.height = endHeight + 'px';
            });
            body.addEventListener('transitionend', function onEnd() {
                body.style.transition = 'none';
                body.style.height = '';
                body.offsetHeight; // force reflow so the snap happens before transition is restored
                body.style.transition = '';
                card.classList.remove('is-animating');
                body.removeEventListener('transitionend', onEnd);
            });
        }

        function closeCard() {
            const startHeight = body.getBoundingClientRect().height;
            body.style.height = startHeight + 'px';
            requestAnimationFrame(function() {
                body.style.height = '0px';
            });
            body.addEventListener('transitionend', function onEnd() {
                card.open = false;
                body.style.height = '';
                card.classList.remove('is-animating');
                body.removeEventListener('transitionend', onEnd);
            });
        }
    });
});
