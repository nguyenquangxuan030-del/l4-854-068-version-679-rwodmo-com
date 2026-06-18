(function () {
  function setupMobileMenu() {
    const button = document.querySelector('.mobile-menu-button');
    const nav = document.querySelector('.mobile-nav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroSlider() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prevButton = document.querySelector('.hero-prev');
    const nextButton = document.querySelector('.hero-next');

    if (!slides.length) {
      return;
    }

    let activeIndex = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });

    if (activeIndex < 0) {
      activeIndex = 0;
    }

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const targetIndex = Number(dot.dataset.slide);
        if (!Number.isNaN(targetIndex)) {
          showSlide(targetIndex);
        }
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6500);
  }

  function setupFilters() {
    const grid = document.getElementById('movieGrid');
    const searchInput = document.getElementById('searchInput');
    const yearFilter = document.getElementById('yearFilter');
    const regionFilter = document.getElementById('regionFilter');
    const visibleCount = document.getElementById('visibleCount');
    const resetButton = document.getElementById('resetFilters');
    const emptyState = document.getElementById('emptyState');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(searchInput ? searchInput.value : '');
      const year = normalize(yearFilter ? yearFilter.value : '');
      const region = normalize(regionFilter ? regionFilter.value : '');
      let matched = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));

        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !year || normalize(card.dataset.year).includes(year);
        const matchesRegion = !region || normalize(card.dataset.region).includes(region);
        const isVisible = matchesQuery && matchesYear && matchesRegion;

        card.hidden = !isVisible;
        if (isVisible) {
          matched += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(matched);
      }

      if (emptyState) {
        emptyState.hidden = matched !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        applyFilters();
      });
    }
  }

  function setupPlayer() {
    const buttons = Array.from(document.querySelectorAll('.play-button'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const videoId = button.dataset.target;
        const source = button.dataset.src;
        const video = document.getElementById(videoId);
        const shell = button.closest('.video-shell');
        const status = shell ? shell.querySelector('.player-status') : null;

        if (!video || !source) {
          return;
        }

        function showStatus(message) {
          if (status) {
            status.textContent = message;
            status.hidden = false;
          }
        }

        button.classList.add('is-hidden');
        showStatus('正在连接高清播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (status) {
              status.hidden = true;
            }
            video.play().catch(function () {
              showStatus('播放源已加载，请再次点击视频播放。');
            });
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                showStatus('网络加载异常，正在重新连接播放源。');
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                showStatus('媒体解码异常，正在尝试自动恢复。');
                hls.recoverMediaError();
              } else {
                showStatus('当前播放源暂时不可用，请稍后刷新重试。');
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            if (status) {
              status.hidden = true;
            }
            video.play().catch(function () {
              showStatus('播放源已加载，请再次点击视频播放。');
            });
          }, { once: true });
        } else {
          showStatus('当前浏览器需要 HLS 播放支持，建议使用新版 Chrome、Edge、Safari 或移动端浏览器。');
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayer();
  });
}());
