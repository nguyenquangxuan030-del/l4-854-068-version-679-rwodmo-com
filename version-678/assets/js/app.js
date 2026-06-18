(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const start = function () {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const scope = panel.closest('section') || document;
    let cards = Array.from(scope.querySelectorAll('.cards-to-filter .movie-card, .cards-to-filter .rank-row'));
    if (!cards.length) {
      cards = Array.from(document.querySelectorAll('.cards-to-filter .movie-card, .cards-to-filter .rank-row'));
    }
    const search = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-region-filter]');
    const type = panel.querySelector('[data-type-filter]');
    const category = panel.querySelector('[data-category-filter]');

    const apply = function () {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value.trim().toLowerCase() : '';
      const typeValue = type ? type.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        const okKeyword = !keyword || haystack.includes(keyword);
        const okRegion = !regionValue || (card.dataset.region || '').toLowerCase().includes(regionValue);
        const okType = !typeValue || (card.dataset.type || '').toLowerCase().includes(typeValue);
        const okCategory = !categoryValue || (card.dataset.tags || '').toLowerCase().includes(categoryValue);
        card.classList.toggle('is-filter-hidden', !(okKeyword && okRegion && okType && okCategory));
      });
    };

    [search, region, type, category].forEach(function (item) {
      if (item) item.addEventListener('input', apply);
      if (item) item.addEventListener('change', apply);
    });
  });

  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playOverlay');

  if (video && overlay && typeof VIDEO_URL === 'string' && VIDEO_URL) {
    let ready = false;
    let hls = null;

    const loadVideo = function () {
      if (ready) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = VIDEO_URL;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(VIDEO_URL);
        hls.attachMedia(video);
      } else {
        video.src = VIDEO_URL;
      }
      ready = true;
    };

    const playVideo = function () {
      loadVideo();
      overlay.classList.add('is-hidden');
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (!ready) playVideo();
    });

    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  }
})();
