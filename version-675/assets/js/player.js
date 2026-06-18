import { H as Hls } from './hls.local.js';

function loadPlayer(playerBox) {
  var video = playerBox.querySelector('video');
  var overlay = playerBox.querySelector('[data-play-overlay]');
  var src = playerBox.getAttribute('data-video-src');
  var hlsInstance = null;

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  function attachSource() {
    if (!src || playerBox.dataset.loaded === 'true') {
      playVideo();
      return;
    }
    playerBox.dataset.loaded = 'true';
    video.setAttribute('controls', 'controls');

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
          video.src = src;
          playVideo();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    } else {
      video.src = src;
      playVideo();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      attachSource();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      attachSource();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(loadPlayer);
});
