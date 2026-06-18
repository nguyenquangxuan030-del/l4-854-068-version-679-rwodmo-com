(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        });

        hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        });

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var empty = document.querySelector('[data-empty-state]');

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var applyFilter = function () {
            var query = normalize(input ? input.value : '');
            var typeValue = normalize(typeSelect ? typeSelect.value : '');
            var yearValue = normalize(yearSelect ? yearSelect.value : '');
            var regionValue = normalize(regionSelect ? regionSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var region = normalize(card.getAttribute('data-region'));
                var matches = true;

                if (query && text.indexOf(query) === -1) {
                    matches = false;
                }

                if (typeValue && type.indexOf(typeValue) === -1) {
                    matches = false;
                }

                if (yearValue && year !== yearValue) {
                    matches = false;
                }

                if (regionValue && region.indexOf(regionValue) === -1) {
                    matches = false;
                }

                card.style.display = matches ? '' : 'none';

                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    var hlsLoader = null;

    var loadHls = function () {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoader) {
            return hlsLoader;
        }

        hlsLoader = new Promise(function (resolve) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls || null);
            };
            script.onerror = function () {
                resolve(null);
            };
            document.head.appendChild(script);
        });

        return hlsLoader;
    };

    var setupVideo = function (video) {
        var source = video.getAttribute('data-src');
        var overlay = video.parentElement ? video.parentElement.querySelector('.play-overlay') : null;
        var message = video.parentElement ? video.parentElement.querySelector('.player-message') : null;
        var ready = false;
        var pending = null;

        if (!source) {
            return;
        }

        var showMessage = function (text) {
            if (message) {
                message.textContent = text;
                message.classList.add('is-visible');
                window.setTimeout(function () {
                    message.classList.remove('is-visible');
                }, 4200);
            }
        };

        var initialize = function () {
            if (ready) {
                return Promise.resolve();
            }

            if (pending) {
                return pending;
            }

            pending = new Promise(function (resolve) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    ready = true;
                    resolve();
                    return;
                }

                loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });

                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal) {
                                return;
                            }

                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                                showMessage('网络连接不稳定，正在重新加载');
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                                showMessage('播放加载中，请稍候');
                            } else {
                                showMessage('播放暂时不可用，请稍后重试');
                            }
                        });
                        video._hls = hls;
                        ready = true;
                        resolve();
                        return;
                    }

                    video.src = source;
                    ready = true;
                    resolve();
                });
            });

            return pending;
        };

        var play = function () {
            initialize().then(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        showMessage('点击播放器即可开始播放');
                    });
                }
            });
        };

        initialize();

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-hidden');
                play();
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };

    document.querySelectorAll('.video-player').forEach(setupVideo);
})();
