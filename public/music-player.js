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

  // Playlists - persistent storage for user-created playlists
  let playlists = {}; // { playlistId: { name, items: [{ type: 'local'|'youtube', data, name }] } }
  let activePlaylistId = null;
  let playlistIndex = 0;

  async function init() {
    attachUI();
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported, falling back to HTMLAudioElement volume control.');
      audioCtx = null;
    }
    loadPlaylists();
    updatePlaylistUI(); // Update UI after loading playlists
  }

  // Playlist management functions
  function loadPlaylists() {
    try {
      const stored = localStorage.getItem('dreamweaver_playlists');
      if (stored) {
        playlists = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load playlists from localStorage:', e);
      playlists = {};
    }
  }

  function savePlaylists() {
    try {
      localStorage.setItem('dreamweaver_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists to localStorage:', e);
    }
  }

  function createPlaylist(name) {
    const id = 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    playlists[id] = {
      name: name || 'Untitled Playlist',
      items: [],
      created: Date.now()
    };
    savePlaylists();
    updatePlaylistUI();
    return id;
  }

  function deletePlaylist(playlistId) {
    if (activePlaylistId === playlistId) {
      activePlaylistId = null;
      playlistIndex = 0;
    }
    delete playlists[playlistId];
    savePlaylists();
    updatePlaylistUI();
  }

  function addToPlaylist(playlistId, type, data, name) {
    if (!playlists[playlistId]) return;
    playlists[playlistId].items.push({ type, data, name });
    savePlaylists();
    updatePlaylistUI();
  }

  function removeFromPlaylist(playlistId, itemIndex) {
    if (!playlists[playlistId]) return;
    playlists[playlistId].items.splice(itemIndex, 1);
    savePlaylists();
    updatePlaylistUI();
  }

  function loadPlaylist(playlistId) {
    if (!playlists[playlistId]) return;
    activePlaylistId = playlistId;
    playlistIndex = 0;
    updatePlaylistUI();
  }

  function playPlaylistItem(index) {
    if (!activePlaylistId || !playlists[activePlaylistId]) return;
    const playlist = playlists[activePlaylistId];
    if (index < 0 || index >= playlist.items.length) return;
    
    playlistIndex = index;
    const item = playlist.items[index];
    
    if (item.type === 'youtube') {
      setSource('youtube');
      loadYouTubeAndPlay(item.data);
    } else if (item.type === 'spotify') {
      // Spotify track - trigger playback via global state
      // The data contains { uri, id, name, artist, previewUrl }
      setSource('spotify');
      // Notify main app about Spotify track selection
      if (window.playSpotifyTrackFromPlaylist) {
        window.playSpotifyTrackFromPlaylist(item.data);
      } else {
        console.warn('Spotify playback not available - please ensure Spotify is connected');
        alert('Spotify playback requires being logged in to Spotify. Please connect Spotify first.');
      }
    } else if (item.type === 'local') {
      // Local files from playlist: store file metadata but not blob URL
      // User needs to re-upload the file or we need file persistence
      console.warn('Local file playback from saved playlists not fully supported - files are session-only');
      alert('Local files are only available during the current session. To play this file, please upload it again using the "Local Files" option.');
      nextPlaylistItem();
    }
  }

  function nextPlaylistItem() {
    if (!activePlaylistId || !playlists[activePlaylistId]) return;
    const playlist = playlists[activePlaylistId];
    if (playlist.items.length === 0) return;
    
    playlistIndex = (playlistIndex + 1) % playlist.items.length;
    playPlaylistItem(playlistIndex);
  }

  function prevPlaylistItem() {
    if (!activePlaylistId || !playlists[activePlaylistId]) return;
    const playlist = playlists[activePlaylistId];
    if (playlist.items.length === 0) return;
    
    playlistIndex = (playlistIndex - 1 + playlist.items.length) % playlist.items.length;
    playPlaylistItem(playlistIndex);
  }

  function replayCurrentItem() {
    if (activePlaylistId && playlists[activePlaylistId]) {
      playPlaylistItem(playlistIndex);
    } else if (source === 'youtube' && ytPlayer) {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    } else if (source === 'local' && localAudio) {
      localAudio.currentTime = 0;
      localAudio.play();
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
    
    // Attach playlist UI handlers
    attachPlaylistUI();
  }

  function attachPlaylistUI() {
    // Create playlist button
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    if (createPlaylistBtn) {
      createPlaylistBtn.addEventListener('click', () => {
        const name = prompt('Enter playlist name:', 'My Playlist');
        if (name) {
          createPlaylist(name);
        }
      });
    }

    // Note: Add to playlist button handler is in index.html as addCurrentTrackToPlaylist()
  }

  function updatePlaylistUI() {
    // Update playlist selector dropdown
    const playlistSelect = document.getElementById('playlist-select');
    if (playlistSelect) {
      playlistSelect.innerHTML = '<option value="">Select a playlist...</option>';
      Object.keys(playlists).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = playlists[id].name + ' (' + playlists[id].items.length + ' items)';
        if (id === activePlaylistId) option.selected = true;
        playlistSelect.appendChild(option);
      });
    }

    // Update playlist items display
    const playlistItemsContainer = document.getElementById('playlist-items-container');
    if (playlistItemsContainer && activePlaylistId && playlists[activePlaylistId]) {
      const playlist = playlists[activePlaylistId];
      playlistItemsContainer.innerHTML = '';
      
      if (playlist.items.length === 0) {
        playlistItemsContainer.innerHTML = '<div class="text-xs text-slate-400 p-2">No items in playlist. Add tracks from Spotify, YouTube, or local files.</div>';
      } else {
        playlist.items.forEach((item, index) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'flex items-center justify-between p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors';
          
          // Add icon based on source type
          const iconEl = document.createElement('span');
          iconEl.className = 'text-xs mr-2';
          if (item.type === 'spotify') {
            iconEl.innerHTML = '🎵'; // Spotify icon
            iconEl.title = 'Spotify Track';
          } else if (item.type === 'youtube') {
            iconEl.innerHTML = '▶️'; // YouTube icon
            iconEl.title = 'YouTube Video';
          } else if (item.type === 'local') {
            iconEl.innerHTML = '📁'; // Local file icon
            iconEl.title = 'Local File';
          }
          
          const nameEl = document.createElement('span');
          nameEl.className = 'text-xs text-slate-300 flex-1 truncate';
          nameEl.textContent = `${index + 1}. ${item.name}`;
          if (index === playlistIndex && activePlaylistId) {
            nameEl.className = 'text-xs text-green-400 flex-1 truncate font-bold';
          }
          
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'flex items-center flex-1 min-w-0';
          contentWrapper.appendChild(iconEl);
          contentWrapper.appendChild(nameEl);
          
          const btnContainer = document.createElement('div');
          btnContainer.className = 'flex gap-1';
          
          const playBtn = document.createElement('button');
          playBtn.className = 'px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs';
          playBtn.textContent = 'Play';
          playBtn.onclick = () => playPlaylistItem(index);
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs';
          removeBtn.textContent = 'Remove';
          removeBtn.onclick = () => {
            if (confirm('Remove this item from playlist?')) {
              removeFromPlaylist(activePlaylistId, index);
            }
          };
          
          btnContainer.appendChild(playBtn);
          btnContainer.appendChild(removeBtn);
          itemEl.appendChild(contentWrapper);
          itemEl.appendChild(btnContainer);
          playlistItemsContainer.appendChild(itemEl);
        });
      }
    }
    
    // Also update reader view playlist if available
    if (typeof window !== 'undefined' && window.updateReaderPlaylistDisplay) {
      window.updateReaderPlaylistDisplay();
    }
  }

  function setSource(s) {
    source = s;
    document.getElementById('local-files-input').style.display = s === 'local' ? 'inline-block' : 'none';
    document.getElementById('youtube-url-input').style.display = s === 'youtube' ? 'inline-block' : 'none';
    document.getElementById('youtube-load-btn').style.display = s === 'youtube' ? 'inline-block' : 'none';
    
    // Show/hide source-specific track info displays
    const spotifyTrackInfo = document.getElementById('spotify-track-info');
    const youtubeTrackInfo = document.getElementById('youtube-track-info');
    const localTrackList = document.getElementById('local-track-list');
    
    // Hide all track info displays first
    if (spotifyTrackInfo) {
      spotifyTrackInfo.style.display = 'none';
    }
    if (youtubeTrackInfo) {
      youtubeTrackInfo.style.display = 'none';
    }
    // Clear local track list only when switching away from local source
    if (localTrackList && s !== 'local') {
      localTrackList.innerHTML = '';
    }
    
    // Show only the selected source's track info
    if (s === 'spotify' && spotifyTrackInfo) {
      spotifyTrackInfo.style.display = 'block';
    } else if (s === 'youtube' && youtubeTrackInfo) {
      youtubeTrackInfo.style.display = 'block';
    } else if (s === 'local') {
      updateAvailableTracksUI();
    }

    // Update music source display on reader page
    const musicSourceDisplay = document.getElementById('music-source-display');
    if (musicSourceDisplay) {
      if (s === 'spotify') {
        musicSourceDisplay.textContent = 'Source: Spotify';
      } else if (s === 'local') {
        musicSourceDisplay.textContent = 'Source: Local Files';
      } else if (s === 'youtube') {
        musicSourceDisplay.textContent = 'Source: YouTube';
      }
    }

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
      // Don't auto-play - wait for user to press play button
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
    // Validate index is within bounds
    if (idx < 0 || idx >= localTracks.length) {
      console.warn(`Invalid local track index: ${idx}, resetting to 0`);
      idx = 0;
    }
    const audio = prepareLocalAudio(idx);
    localIndex = idx;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(err => console.warn('Failed to resume AudioContext:', err));
    audio.volume = 1.0;
    audio.play().catch(err => console.warn('Local audio play failed:', err));
    localAudio = audio;
    
    // Update music status display
    const musicStatus = document.getElementById('music-status');
    if (musicStatus) {
      musicStatus.textContent = localTracks[idx].name;
    }
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
    
    // Add to queue if not already there
    if (!ytQueue.includes(videoId)) {
      ytQueue.push(videoId);
    }
    // Set index to the position of this video
    ytIndex = ytQueue.indexOf(videoId);
    
    if (!ytPlayer) {
      const div = document.createElement('div');
      div.id = 'yt-player';
      div.style.display = 'none';
      document.body.appendChild(div);
      ytPlayer = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: { 'autoplay': 0, 'controls': 0, 'modestbranding': 1 },
        events: {
          'onReady': (e) => { 
            // Use cueVideoById to load without playing
            ytPlayer.cueVideoById(videoId);
            // Update music status display
            const musicStatus = document.getElementById('music-status');
            if (musicStatus) {
              musicStatus.textContent = `Video ID: ${videoId}`;
            }
            // Update YouTube track info on front page
            const ytTrackName = document.getElementById('youtube-track-name');
            if (ytTrackName) {
              ytTrackName.textContent = `Loaded: ${videoId} - Ready to play`;
              ytTrackName.classList.remove('text-slate-400');
              ytTrackName.classList.add('text-green-400');
            }
          },
          'onStateChange': (e) => { if (e.data === YT.PlayerState.ENDED) nextYouTube(); }
        }
      });
    } else {
      // Use cueVideoById instead of loadVideoById to prevent auto-play
      ytPlayer.cueVideoById(videoId);
      // Update music status display
      const musicStatus = document.getElementById('music-status');
      if (musicStatus) {
        musicStatus.textContent = `Video ID: ${videoId}`;
      }
      // Update YouTube track info on front page
      const ytTrackName = document.getElementById('youtube-track-name');
      if (ytTrackName) {
        ytTrackName.textContent = `Loaded: ${videoId} - Ready to play`;
        ytTrackName.classList.remove('text-slate-400');
        ytTrackName.classList.add('text-green-400');
      }
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
      // Strict hostname validation to prevent malicious domains
      if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com' || u.hostname === 'm.youtube.com') {
        return u.searchParams.get('v');
      }
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    } catch (e) {
      if (urlOrId.length === 11) return urlOrId;
    }
    return null;
  }

  // Unified controls
  function play() { if (source === 'local') playLocal(); else if (source === 'youtube') playYouTube(); else console.log('Spotify selected - use Spotify controls'); }
  function pause() { if (source === 'local') pauseLocal(); else if (source === 'youtube') pauseYouTube(); else console.log('Spotify selected - use Spotify controls'); }
  function next() { 
    if (activePlaylistId) {
      nextPlaylistItem();
    } else if (source === 'local') {
      nextLocal();
    } else if (source === 'youtube') {
      nextYouTube();
    } else {
      console.log('Spotify selected - use Spotify controls');
    }
  }
  
  function prev() {
    if (activePlaylistId) {
      prevPlaylistItem();
    } else if (source === 'local' && localTracks.length > 0) {
      localIndex = (localIndex - 1 + localTracks.length) % localTracks.length;
      playLocal(localIndex);
    } else if (source === 'youtube' && ytQueue.length > 0) {
      ytIndex = (ytIndex - 1 + ytQueue.length) % ytQueue.length;
      loadYouTubeAndPlay(ytQueue[ytIndex]);
    } else {
      console.log('Spotify selected or no tracks available');
    }
  }
  
  function replay() {
    replayCurrentItem();
  }

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
    
    if (localTracks.length === 0) {
      // Show message when local files selected but no files loaded
      if (source === 'local') {
        const msg = document.createElement('div');
        msg.className = 'mt-3 p-3 bg-slate-800 border border-blue-500/30 rounded-xl text-sm text-slate-300';
        msg.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span class="font-bold text-white">Local Files Selected</span>
          </div>
          <div class="text-xs text-slate-400">Click the file input above to select audio files from your computer</div>
        `;
        listEl.appendChild(msg);
      }
      return;
    }
    
    // Show loaded files with a header
    const container = document.createElement('div');
    container.className = 'mt-3 p-3 bg-slate-800 border border-blue-500/30 rounded-xl text-sm text-slate-300';
    
    const header = document.createElement('div');
    header.className = 'flex items-center gap-2 mb-2';
    header.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
      <span class="font-bold text-white">Local Files Loaded (${localTracks.length})</span>
    `;
    container.appendChild(header);
    
    const tracksContainer = document.createElement('div');
    tracksContainer.className = 'space-y-1';
    localTracks.forEach((t, i) => {
      const li = document.createElement('div');
      li.className = 'text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-slate-700 transition-colors';
      li.textContent = `${i+1}. ${t.name}`;
      li.onclick = () => { playLocal(i); };
      tracksContainer.appendChild(li);
    });
    
    container.appendChild(tracksContainer);
    listEl.appendChild(container);
  }

  return {
    init,
    setSource,
    play,
    pause,
    next,
    prev,
    replay,
    setVolume,
    loadYouTubeAndPlay,
    // Playlist functions
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    loadPlaylist,
    playPlaylistItem,
    getPlaylists: () => playlists,
    getActivePlaylist: () => activePlaylistId,
    _debugState: () => ({ source, localTracks, localIndex, ytQueue, ytIndex, playlists, activePlaylistId, playlistIndex }),
  };
})();
