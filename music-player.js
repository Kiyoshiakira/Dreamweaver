// music-player.js -- minimal music-player module: local files + YouTube IFrame + unified controls
const MusicPlayer = (function () {
  // state
  let source = 'spotify'; // 'spotify' | 'local' | 'youtube'
  let localTracks = []; // {blob, url, name, audioEl, _gainNode}
  let localIndex = 0;
  let localAudio = null;
  let audioCtx = null;

  // YouTube
  let ytPlayer = null;
  let ytQueue = [];
  let ytIndex = 0;

  async function init() {
    attachUI();
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported, falling back to HTMLAudioElement volume control.');
      audioCtx = null;
    }
  }

  function attachUI() {
    const sel = document.getElementById('music-source-select');
    const fileInput = document.getElementById('local-files-input');
    const ytInput = document.getElementById('youtube-url-input');
    const ytLoadBtn = document.getElementById('youtube-load-btn');

    if (sel) sel.addEventListener('change', (e) => setSource(e.target.value));
    if (fileInput) fileInput.addEventListener('change', (ev) => handleLocalFiles(ev.target.files));
    if (ytLoadBtn) ytLoadBtn.addEventListener('click', () => {
      const val = ytInput.value.trim();
      if (!val) return;
      const id = parseYouTubeId(val);
      if (!id) return alert('Please paste a valid YouTube URL or ID.');
      loadYouTubeAndPlay(id);
    });
  }

  function setSource(s) {
    source = s;
    document.getElementById('local-files-input').style.display = s === 'local' ? 'inline-block' : 'none';
    document.getElementById('youtube-url-input').style.display = s === 'youtube' ? 'inline-block' : 'none';
    document.getElementById('youtube-load-btn').style.display = s === 'youtube' ? 'inline-block' : 'none';

    if (s !== 'local') pauseLocal();
    if (s !== 'youtube') pauseYouTube();
  }

  // Local playback
  function handleLocalFiles(fileList) {
    cleanupLocal();
    localTracks = Array.from(fileList).map(f => ({
      blob: f,
      name: f.name,
      url: URL.createObjectURL(f),
      audioEl: null
    }));
    if (localTracks.length > 0) {
      localIndex = 0;
      prepareLocalAudio(localIndex);
      setSource('local');
      playLocal();
      updateAvailableTracksUI();
    }
  }

  function prepareLocalAudio(index) {
    const t = localTracks[index];
    if (!t) return;
    if (t.audioEl) return t.audioEl;
    const audio = new Audio();
    audio.src = t.url;
    audio.preload = 'auto';
    audio.onended = () => nextLocal();
    t.audioEl = audio;
    if (audioCtx) {
      try {
        const srcNode = audioCtx.createMediaElementSource(audio);
        const gain = audioCtx.createGain();
        gain.gain.value = 1.0;
        srcNode.connect(gain).connect(audioCtx.destination);
        t._gainNode = gain;
      } catch (e) {
        console.warn('Failed to wire WebAudio for local file:', e);
      }
    }
    return audio;
  }

  function playLocal(idx = localIndex) {
    if (!localTracks.length) return;
    const audio = prepareLocalAudio(idx);
    localIndex = idx;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(err => console.warn('Failed to resume AudioContext:', err));
    audio.volume = 1.0;
    audio.play().catch(err => console.warn('Local audio play failed:', err));
    localAudio = audio;
  }
  function pauseLocal() { if (localAudio) localAudio.pause(); }
  function nextLocal() {
    if (!localTracks.length) return;
    localIndex = (localIndex + 1) % localTracks.length;
    playLocal(localIndex);
  }
  function cleanupLocal() {
    localTracks.forEach(t => {
      try { URL.revokeObjectURL(t.url); } catch (e) { console.warn('Failed to revoke URL:', e); }
      if (t.audioEl) { t.audioEl.pause(); t.audioEl.src = ''; }
    });
    localTracks = [];
    localAudio = null;
  }

  // YouTube IFrame API
  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    return new Promise((resolve) => {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => resolve();
      document.head.appendChild(tag);
    });
  }

  async function loadYouTubeAndPlay(videoId) {
    await loadYouTubeApi();
    if (!ytPlayer) {
      const div = document.createElement('div');
      div.id = 'yt-player';
      div.style.display = 'none';
      document.body.appendChild(div);
      ytPlayer = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: { 'autoplay': 1, 'controls': 0, 'modestbranding': 1 },
        events: {
          'onReady': (e) => { e.target.playVideo(); },
          'onStateChange': (e) => { if (e.data === YT.PlayerState.ENDED) nextYouTube(); }
        }
      });
    } else {
      ytPlayer.loadVideoById(videoId);
    }
    setSource('youtube');
  }

  function playYouTube() { if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo(); }
  function pauseYouTube() { if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); }
  function nextYouTube() { if (!ytQueue.length) return; ytIndex = (ytIndex + 1) % ytQueue.length; loadYouTubeAndPlay(ytQueue[ytIndex]); }

  function parseYouTubeId(urlOrId) {
    try {
      if (urlOrId.length === 11 && /^[A-Za-z0-9_-]+$/.test(urlOrId)) return urlOrId;
      const u = new URL(urlOrId);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    } catch (e) {
      if (urlOrId.length === 11) return urlOrId;
    }
    return null;
  }

  // Unified controls
  function play() { if (source === 'local') playLocal(); else if (source === 'youtube') playYouTube(); else console.log('Spotify selected - use Spotify controls'); }
  function pause() { if (source === 'local') pauseLocal(); else if (source === 'youtube') pauseYouTube(); else console.log('Spotify selected - use Spotify controls'); }
  function next() { if (source === 'local') nextLocal(); else if (source === 'youtube') nextYouTube(); else console.log('Spotify selected - use Spotify controls'); }

  function setVolume(vol) {
    if (source === 'local' && localTracks[localIndex] && localTracks[localIndex]._gainNode) {
      localTracks[localIndex]._gainNode.gain.value = vol;
    } else if (source === 'local' && localAudio) {
      localAudio.volume = vol;
    } else if (source === 'youtube' && ytPlayer) {
      ytPlayer.setVolume(Math.round(vol * 100));
    }
  }

  function updateAvailableTracksUI() {
    const listEl = document.getElementById('local-track-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    localTracks.forEach((t, i) => {
      const li = document.createElement('div');
      li.textContent = `${i+1}. ${t.name}`;
      li.style.cursor = 'pointer';
      li.onclick = () => { playLocal(i); };
      listEl.appendChild(li);
    });
  }

  return {
    init,
    setSource,
    play,
    pause,
    next,
    setVolume,
    loadYouTubeAndPlay,
    _debugState: () => ({ source, localTracks, localIndex, ytQueue }),
  };
})();
