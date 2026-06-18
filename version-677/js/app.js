(function () {
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector(".hero-carousel");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var active = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var filterPage = document.querySelector("[data-filter-page]");
  if (filterPage) {
    var input = filterPage.querySelector("[data-filter-input]");
    var year = filterPage.querySelector("[data-filter-year]");
    var region = filterPage.querySelector("[data-filter-region]");
    var category = filterPage.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(filterPage.querySelectorAll(".movie-card"));
    var empty = filterPage.querySelector(".no-result");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input && input.value);
      var selectedYear = year && year.value ? year.value : "";
      var selectedRegion = region && region.value ? region.value : "";
      var selectedCategory = category && category.value ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        var matchCategory = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
        var matched = matchKeyword && matchYear && matchRegion && matchCategory;
        card.style.display = matched ? "" : "none";
        if (matched) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [input, year, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function startPlayback(box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    var source = box.getAttribute("data-video-src");

    if (!video || !source) return;

    if (!video.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        box.hlsPlayer = hls;
      } else {
        video.src = source;
      }
      video.setAttribute("data-ready", "1");
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playAction = video.play();
    if (playAction && playAction.catch) {
      playAction.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (box) {
    var overlay = box.querySelector(".player-overlay");
    var video = box.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function () {
        startPlayback(box);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!video.getAttribute("data-ready") || video.paused) {
          startPlayback(box);
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) overlay.classList.add("is-hidden");
      });
    }
  });
})();
