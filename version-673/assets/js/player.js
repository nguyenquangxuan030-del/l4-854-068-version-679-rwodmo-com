(function () {
    function attachPlayer(wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('.player-button');
        if (!video) {
            return;
        }
        var url = video.getAttribute('data-video-url');
        var loaded = false;

        function load() {
            if (loaded || !url) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function play() {
            load();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        wrap.addEventListener('click', function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                return;
            }
            play();
        });

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener('play', function () {
            wrap.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            wrap.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            wrap.classList.remove('is-playing');
        });
        video.addEventListener('loadedmetadata', function () {
            if (video.paused) {
                wrap.classList.remove('is-playing');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(attachPlayer);
})();
