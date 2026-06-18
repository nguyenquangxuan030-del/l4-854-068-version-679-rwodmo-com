import { H as Hls } from './video-player-dru42stk.js';

const initializePlayer = (shell) => {
  const video = shell.querySelector('video');
  const cover = shell.querySelector('[data-play]');
  const playToggle = shell.querySelector('[data-toggle-play]');
  const muteToggle = shell.querySelector('[data-toggle-mute]');
  const fullscreen = shell.querySelector('[data-fullscreen]');
  const src = shell.dataset.videoSrc;
  let hls = null;
  let ready = false;

  const attachSource = () => {
    if (ready || !video || !src) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal || !hls) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    ready = true;
  };

  const play = async () => {
    attachSource();
    shell.classList.add('is-started');
    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('is-playing');
    }
  };

  const togglePlay = () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (playToggle) {
    playToggle.addEventListener('click', togglePlay);
  }

  if (video) {
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', () => {
      shell.classList.add('is-started', 'is-playing');
      if (playToggle) {
        playToggle.textContent = '暂停';
      }
    });
    video.addEventListener('pause', () => {
      shell.classList.remove('is-playing');
      if (playToggle) {
        playToggle.textContent = '▶';
      }
    });
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      video.muted = !video.muted;
      muteToggle.textContent = video.muted ? '静音' : '声音';
    });
  }

  if (fullscreen) {
    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });
  }

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
};

document.querySelectorAll('.player-shell').forEach(initializePlayer);
