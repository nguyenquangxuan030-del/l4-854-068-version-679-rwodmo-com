(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        play();
      });
    }

    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector("[data-search-input]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      function run() {
        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matched = true;
          matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
          matched = matched && (!regionValue || normalize(card.getAttribute("data-region")) === regionValue);
          matched = matched && (!yearValue || normalize(card.getAttribute("data-year")) === yearValue);
          matched = matched && (!typeValue || normalize(card.getAttribute("data-type")) === typeValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("[data-video-player]");
      var button = shell.querySelector("[data-player-start]");
      var status = shell.parentElement ? shell.parentElement.querySelector("[data-player-status]") : null;
      var loaded = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function loadVideo() {
        if (!video || loaded) {
          return;
        }
        var stream = video.getAttribute("data-stream") || "";
        if (!stream) {
          setStatus("播放源暂不可用");
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          loaded = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          loaded = true;
          return;
        }
        video.src = stream;
        loaded = true;
      }

      function start() {
        loadVideo();
        if (!video) {
          return;
        }
        var promise = video.play();
        shell.classList.add("is-playing");
        setStatus("");
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
            setStatus("点击播放器继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (button && button.contains(event.target)) {
          return;
        }
        if (!shell.classList.contains("is-playing")) {
          start();
        }
      });

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
          setStatus("");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            shell.classList.remove("is-playing");
          }
        });
        video.addEventListener("ended", function () {
          shell.classList.remove("is-playing");
        });
        video.addEventListener("error", function () {
          shell.classList.remove("is-playing");
          setStatus("播放未能启动，请稍后重试");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
