(() => {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(active + 1), 5000);
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(active + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const runFilter = (input) => {
    const scope = input.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const empty = scope.querySelector('[data-empty-state]');
    const query = normalize(input.value);
    let visible = 0;

    cards.forEach((card) => {
      const content = normalize(card.dataset.search + ' ' + card.textContent);
      const matched = !query || content.includes(query);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  document.querySelectorAll('[data-search-input]').forEach((input) => {
    input.addEventListener('input', () => runFilter(input));

    if (input.hasAttribute('data-autofill-query')) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query) {
        input.value = query;
        runFilter(input);
      }
    }
  });
})();
