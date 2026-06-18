(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var search = qs('[data-search-input]', panel);
    var type = qs('[data-type-filter]', panel);
    var region = qs('[data-region-filter]', panel);
    var year = qs('[data-year-filter]', panel);
    var cards = qsa('[data-movie-card]');
    var count = qs('[data-result-count]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var term = normalize(search && search.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        var matched = true;
        if (term && haystack.indexOf(term) === -1) {
          matched = false;
        }
        if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
          matched = false;
        }
        if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
          matched = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
    filterCards();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
