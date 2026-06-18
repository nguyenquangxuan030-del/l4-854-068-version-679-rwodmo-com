(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.mobile-toggle');
    if (header && toggle) {
        toggle.addEventListener('click', function () {
            var open = header.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-arrow.prev');
        var next = hero.querySelector('.hero-arrow.next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    filterRoots.forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var type = root.querySelector('[data-filter-type]');
        var region = root.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var noResults = root.querySelector('.no-results');

        function norm(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var q = norm(input && input.value);
            var t = norm(type && type.value);
            var r = norm(region && region.value);
            var visible = 0;
            cards.forEach(function (card) {
                var hay = norm(card.getAttribute('data-search'));
                var cardType = norm(card.getAttribute('data-type'));
                var cardRegion = norm(card.getAttribute('data-region'));
                var ok = true;
                if (q && hay.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    ok = false;
                }
                if (r && cardRegion.indexOf(r) === -1) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.style.display = visible ? 'none' : 'block';
            }
        }

        [input, type, region].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    });
})();
