(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSliders() {
    $all('[data-hero-slider]').forEach(function (slider) {
      var slides = $all('[data-hero-slide]', slider);
      var dots = $all('[data-hero-dot]', slider);
      var prev = $('[data-hero-prev]', slider);
      var next = $('[data-hero-next]', slider);
      var active = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }

      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(value) {
    var keyword = normalize(value);
    var lists = $all('[data-filter-list]');
    lists.forEach(function (list) {
      var items = $all('[data-search-text]', list);
      var visible = 0;
      items.forEach(function (item) {
        var text = normalize(item.getAttribute('data-search-text'));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        item.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      var empty = $('[data-empty-state]');
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  function initSearch() {
    $all('[data-search-form]').forEach(function (form) {
      var input = $('input[name="keyword"]', form);
      var redirect = form.getAttribute('data-search-redirect');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var keyword = input ? input.value.trim() : '';
        if (redirect) {
          window.location.href = redirect + (keyword ? '?keyword=' + encodeURIComponent(keyword) : '');
          return;
        }
        filterCards(keyword);
      });
    });

    var filterInput = $('[data-card-filter]');
    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('keyword') || '';
      if (keyword) {
        filterInput.value = keyword;
        filterCards(keyword);
      }
      filterInput.addEventListener('input', function () {
        filterCards(filterInput.value);
      });
    }

    $all('[data-filter-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || '';
        var input = $('[data-card-filter]');
        if (input) {
          input.value = value;
          filterCards(value);
        }
      });
    });
  }

  function initPlayerScroll() {
    $all('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = $('[data-player]');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var button = $('.player-start', player);
          if (button) {
            button.focus();
          }
        }
      });
    });
  }

  function initSite() {
    initNavigation();
    initHeroSliders();
    initSearch();
    initPlayerScroll();
  }

  function initMoviePlayer(sourceUrl) {
    var root = $('[data-player]');
    if (!root) {
      return;
    }
    var video = $('.movie-video', root);
    var overlay = $('.player-overlay', root);
    var loading = $('.player-loading', root);
    var message = $('.player-message', root);
    var hls = null;
    var ready = false;

    function setLoading(isLoading) {
      if (loading) {
        loading.hidden = !isLoading;
      }
    }

    function showMessage(show) {
      if (message) {
        message.hidden = !show;
      }
    }

    function attachSource() {
      if (ready || !video || !sourceUrl) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage(true);
          }
        });
        return;
      }
      video.src = sourceUrl;
    }

    function play() {
      if (!video) {
        return;
      }
      showMessage(false);
      setLoading(true);
      attachSource();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          setLoading(false);
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('playing', function () {
      setLoading(false);
      showMessage(false);
    });
    video.addEventListener('waiting', function () {
      setLoading(true);
    });
    video.addEventListener('pause', function () {
      setLoading(false);
    });
    video.addEventListener('error', function () {
      setLoading(false);
      showMessage(true);
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initSite = initSite;
  window.initMoviePlayer = initMoviePlayer;
})();
