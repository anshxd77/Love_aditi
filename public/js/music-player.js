/* ─── Futuristic AI Music Player Logic ─── */
/* Handles Player UI, YouTube API, and Voice Commands */

const MUSIC_CONFIG = {
    playlist: [
        'h1Fxjmg_KL4', 'GX9x62kFsVU', 'WglSfZJOPds', 'wpka0Q8hlXc',
        'fG8nF53ceQc', '1SvBXEqgu6k', 'dQAuza7q1Wo', 'dawrQnvwMTY',
        '_hYsJ8I5kjw', 'o_1aF54DO60', 'V1Pl8CzNzCw', 'x9EoXWJ_cWM',
        'nyuo9-OjNNg', 'N4CmiBP0-_E', '5idNBcKDtvA', '_w14bUcxl1c',
        'BV0-rrdPJKw', 'OV2jrgYSQcA', '1_WaSnOnu1Q', '9UDkYz64ehA'
    ],
    startVolume: 50,
    lastPlayedIndex: 0
};

// Cache for video metadata (id -> { title, author }) built on-demand
const MUSIC_METADATA = {};

let playerObject = null;
let isExpanded = false;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false; // false = sequence, true = repeat one
let recognition = null;
let recognitionRetryCount = 0;
let recognitionActive = false; // prevent duplicate starts
const RECOGNITION_LANGS = ['hi-IN', 'en-IN', 'en-US'];
let recognitionLangIndex = 0;
let playerReady = false; // Track if YouTube player is initialized

let playerInitialized = false; // Prevent duplicate initialization
let isSearchMode = false; // Track if we are playing a search playlist vs local playlist

// Standard YouTube API Callback
function onYouTubeIframeAPIReady() {
    console.log("🎵 YouTube API Ready");
    console.log("playerInitialized:", playerInitialized);
    if (!playerInitialized) {
        // Let the main initializer set the flag; call init so it can complete setup
        initFuturisticPlayer();
    } else {
        // If initialization already ran but the YT player wasn't created, ensure it's created
        if (!playerObject) {
            console.log('📺 Initialization previously ran but playerObject missing — creating YT player');
            createYouTubePlayer();
        }
    }
}

/**
 * Main Initialization Function
 */
function initFuturisticPlayer() {
    // Skip if already initializing or initialized
    if (playerInitialized) {
        console.log("⚠️ Already initialized, skipping...");
        return;
    }
    playerInitialized = true;

    console.log("⚡ Init Futuristic AI Music Player...");

    // 1. Force Random Start on Load
    MUSIC_CONFIG.lastPlayedIndex = Math.floor(Math.random() * MUSIC_CONFIG.playlist.length);
    console.log("🎲 Random Start Index:", MUSIC_CONFIG.lastPlayedIndex);

    injectPlayerHTML();
    setupVoiceRecognition();
    setupEventListeners();
    // Preload metadata for the playlist so voice matching works immediately
    preloadPlaylistMetadata();
    setupGlobalPlayListener(); // Ensure music starts on first interaction

    // Load YouTube API if not present
    if (!window.YT) {
        console.log("📺 Injecting YouTube API...");
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        // onYouTubeIframeAPIReady() will be called automatically by YouTube API
    } else {
        // YouTube API already loaded, create player immediately
        console.log("📺 YouTube API already loaded, creating player...");
        createYouTubePlayer();
    }
}

// Preload metadata for all playlist items via YouTube oEmbed (no API key required)
function preloadPlaylistMetadata() {
    if (!Array.isArray(MUSIC_CONFIG.playlist) || MUSIC_CONFIG.playlist.length === 0) return;
    MUSIC_CONFIG.playlist.forEach(id => {
        // skip if already cached
        if (MUSIC_METADATA[id] && MUSIC_METADATA[id].title) return;
        const url = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}&format=json`;
        fetch(url).then(res => {
            if (!res.ok) throw new Error('oEmbed fetch failed');
            return res.json();
        }).then(json => {
            MUSIC_METADATA[id] = { title: json.title, author: json.author_name };
            // console.debug('oEmbed cached', id, MUSIC_METADATA[id]);
        }).catch(err => {
            // non-fatal; some videos may not have oEmbed or be blocked
            console.debug('oEmbed error for', id, err);
        });
    });
}

// Invidious search fallback (tries a list of public instances)
// Invidious search fallback (DEPRECATED - Use direct playlist load instead)



/**
 * 1. Inject HTML Structure
 */
function injectPlayerHTML() {
    // Prevent double injection
    if (document.getElementById('ai-music-player-root')) return;

    const root = document.createElement('div');
    root.id = 'ai-music-player-root';
    root.innerHTML = `
        <!-- Floating Bubble -->
        <div class="music-bubble" id="musicBubble">
            <div class="bubble-icon"><i class="fas fa-music"></i></div>
            <div class="bubble-wave-visual">
                <div class="bubble-bar"></div><div class="bubble-bar"></div><div class="bubble-bar"></div><div class="bubble-bar"></div>
            </div>
        </div>

        <!-- Expanded Card -->
        <div class="music-card">
            <!-- Header -->
            <div class="card-header">
                <button class="btn-icon" id="btnMinimize"><i class="fas fa-chevron-down"></i></button>
                <span class="header-title">AI Player</span>
                <button class="btn-icon" id="btnMic"><i class="fas fa-microphone"></i></button>
            </div>

            <!-- Album Art -->
            <div class="album-art-area">
                <div class="album-glow"></div>
                <div class="album-art-disc" id="albumArtDisc"></div>
            </div>

            <!-- Song Info -->
            <div class="song-info">
                <div class="song-title" id="songTitle">Loading...</div>
                <div class="song-artist" id="songArtist">AI Selection</div>
            </div>

            <!-- Progress -->
            <div class="progress-area" id="progressArea">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="time-stamps">
                    <span id="currTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
            </div>

            <!-- Controls -->
            <div class="controls-area">
                <button class="btn-icon" id="btnShuffle" title="Shuffle"><i class="fas fa-random"></i></button>
                <button class="btn-icon" id="btnPrev" title="Previous"><i class="fas fa-step-backward"></i></button>
                <button class="btn-ctrl-main" id="btnPlayPause" title="Play/Pause"><i class="fas fa-play"></i></button>
                <button class="btn-icon" id="btnNext" title="Next"><i class="fas fa-step-forward"></i></button>
                <button class="btn-icon" id="btnRepeat" title="Repeat"><i class="fas fa-redo"></i></button>
            </div>

            <!-- Voice Overlay -->
            <div class="voice-overlay" id="voiceOverlay">
                <div class="voice-waves">
                    <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
                </div>
                <div class="voice-status" id="voiceStatus">Listening...</div>
            </div>
        </div>
        
        <!-- Hidden YT Player -->
        <div id="yt-player-placeholder" style="display:none;"></div>
    `;
    document.body.appendChild(root);
}

/**
 * 2. Create YouTube Player
 */
function createYouTubePlayer() {
    console.log("🎬 Creating YouTube Player...");
    console.log("YT object available:", !!window.YT);
    console.log("YT.Player available:", !!window.YT?.Player);

    if (!window.YT || !window.YT.Player) {
        console.error("❌ YouTube API YT.Player not available yet!");
        setTimeout(createYouTubePlayer, 500);
        return;
    }

    try {
        playerObject = new YT.Player('yt-player-placeholder', {
            height: '0',
            width: '0',
            videoId: MUSIC_CONFIG.playlist[MUSIC_CONFIG.lastPlayedIndex],
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'enablejsapi': 1,
                'origin': window.location.origin || 'http://localhost:3000'
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        console.log("✅ YouTube Player created successfully");
    } catch (err) {
        console.error("❌ Error creating YouTube player:", err);
    }
}

function onPlayerReady(event) {
    console.log("✅ Player Ready");
    playerReady = true;
    updateMetadata();
    startProgressLoop();
    event.target.setVolume(MUSIC_CONFIG.startVolume);
    event.target.playVideo();
}

function onPlayerError(event) {
    console.error("❌ Player Error:", event.data);
    // Error 100/101/150 usually means video blocked/not found
    if (isSearchMode && (event.data === 100 || event.data === 101 || event.data === 150)) {
        console.warn("⚠️ Search result video blocked, trying next video...");
        if (playerObject && typeof playerObject.nextVideo === 'function') {
            playerObject.nextVideo();
        }
    } else {
        setTimeout(nextSong, 2000);
    }
}

function onPlayerStateChange(event) {
    // UI Updates
    const playBtnIcon = document.querySelector('#btnPlayPause i');
    const bubblePlayBtnIcon = document.querySelector('.bubble-play-btn i');
    const disc = document.getElementById('albumArtDisc');
    const bubble = document.getElementById('musicBubble');

    if (event.data === YT.PlayerState.PLAYING) {
        console.log('▶️ Player State: PLAYING');
        isPlaying = true;
        if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
        if (bubblePlayBtnIcon) bubblePlayBtnIcon.className = 'fas fa-pause';
        if (disc) disc.classList.add('spinning');
        if (bubble) bubble.classList.add('playing');

        // Force metadata update when playing starts (crucial for search playlist)
        updateMetadata();
    } else {
        if (event.data === YT.PlayerState.PAUSED) console.log('⏸️ Player State: PAUSED');
        if (event.data === YT.PlayerState.BUFFERING) console.log('⏳ Player State: BUFFERING');
        isPlaying = false;
        if (playBtnIcon) playBtnIcon.className = 'fas fa-play';
        if (bubblePlayBtnIcon) bubblePlayBtnIcon.className = 'fas fa-play';
        if (disc) disc.classList.remove('spinning');
        if (bubble) bubble.classList.remove('playing');
    }

    // Auto Next / Loop Logic
    if (event.data === YT.PlayerState.ENDED) {
        if (isRepeat) {
            if (playerObject && typeof playerObject.seekTo === 'function' && typeof playerObject.playVideo === 'function') {
                playerObject.seekTo(0);
                playerObject.playVideo();
            } else {
                console.warn('⚠️ Repeat requested but playerObject methods unavailable', { playerObject });
            }
        } else {
            nextSong();
        }
    }
}

/**
 * 3. Interactions & Logic
 */
function setupEventListeners() {
    try {
        const btnPlayPause = document.getElementById('btnPlayPause');
        if (!btnPlayPause) {
            console.error("❌ btnPlayPause button not found in DOM!");
            console.log("📋 Available elements:", {
                musicBubble: !!document.getElementById('musicBubble'),
                musicCard: !!document.querySelector('.music-card'),
                allButtons: document.querySelectorAll('button').length
            });
            return;
        }

        console.log("✅ Found btnPlayPause element:", btnPlayPause);

        // Add a single click listener with logging
        btnPlayPause.addEventListener('click', function (e) {
            console.log("🖱️ BUTTON CLICKED! Event:", e);
            togglePlayerPlayback();
        });

        console.log("✅ Play/Pause button listeners attached (onclick + addEventListener)");

        // Bubble Play Button (for minimized player)
        const bubblePlayBtn = document.getElementById('bubblePlayBtn');
        if (bubblePlayBtn) {
            bubblePlayBtn.onclick = function (e) {
                e.stopPropagation();
                console.log("🎮 Bubble Play Button Clicked!");
                togglePlayerPlayback();
            };
        }

        document.getElementById('musicBubble').onclick = () => togglePlayer(true);
        document.getElementById('btnMinimize').onclick = () => togglePlayer(false);

        // Controls - Bind directly to avoid any missing listeners
        document.getElementById('btnNext').onclick = nextSong;
        document.getElementById('btnPrev').onclick = prevSong;

        // Shuffle
        document.getElementById('btnShuffle').onclick = (e) => {
            isShuffle = !isShuffle;
            e.currentTarget.style.color = isShuffle ? '#ff007a' : '#ffffff';
            e.currentTarget.style.opacity = isShuffle ? '1' : '0.5';
            console.log("Shuffle:", isShuffle);
        };
        document.getElementById('btnShuffle').style.opacity = '0.5';

        // Repeat
        document.getElementById('btnRepeat').onclick = (e) => {
            isRepeat = !isRepeat;
            e.currentTarget.style.color = isRepeat ? '#ff007a' : '#ffffff';
            e.currentTarget.style.opacity = isRepeat ? '1' : '0.5';
            console.log("Repeat:", isRepeat);
        };
        document.getElementById('btnRepeat').style.opacity = '0.5';

        // Mic
        document.getElementById('btnMic').onclick = startVoiceCommand;
    } catch (err) {
        console.error("❌ Error setting up event listeners:", err);
    }

    // Progress
    document.querySelector('.progress-bar').onclick = (e) => {
        if (!playerObject) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        playerObject.seekTo(playerObject.getDuration() * pct);
    };
}

/**
 * Global listener to force play on first interaction (fixes autoplay block)
 */
function setupGlobalPlayListener() {
    const events = ['click', 'touchstart', 'keydown'];

    const handler = () => {
        // If player not ready, keep waiting for next interaction
        if (!playerObject || typeof playerObject.playVideo !== 'function') return;

        console.log("🖱️ Global interaction detected: Attempting to play music...");
        playerObject.playVideo();

        // Remove listeners once we've successfully attempted to play
        events.forEach(e => document.removeEventListener(e, handler));
    };

    events.forEach(e => document.addEventListener(e, handler));
}

function togglePlayer(expand) {
    const root = document.getElementById('ai-music-player-root');
    if (expand) {
        root.classList.add('expanded');
        isExpanded = true;
    } else {
        root.classList.remove('expanded');
        isExpanded = false;
    }
}

function togglePlayerPlayback() {
    console.log("🎯 Toggle Play clicked!");
    console.log("playerObject:", playerObject ? "exists" : "null");
    console.log("playerReady:", playerReady);

    if (!playerObject) {
        console.warn("⚠️ Player object not initialized yet. Please wait...");
        return;
    }

    if (!playerReady) {
        console.warn("⚠️ Player not ready yet. Retrying in 500ms...", { playerReady, playerObject: !!playerObject });
        setTimeout(togglePlay, 500);
        return;
    }

    // Log available player methods for debugging
    console.log("player methods:", {
        getPlayerState: typeof playerObject.getPlayerState,
        playVideo: typeof playerObject.playVideo,
        pauseVideo: typeof playerObject.pauseVideo
    });

    try {
        let usedFallback = false;
        if (typeof playerObject.getPlayerState === 'function') {
            const state = playerObject.getPlayerState();
            console.log("⏯ Current YT State:", state);
            console.log("YT.PlayerState values:", { PLAYING: YT.PlayerState.PLAYING, PAUSED: YT.PlayerState.PAUSED, BUFFERING: YT.PlayerState.BUFFERING });

            if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                console.log("📍 Calling pauseVideo()");
                if (typeof playerObject.pauseVideo === 'function') playerObject.pauseVideo();
                else console.warn('pauseVideo method missing');
            } else {
                console.log("📍 Calling playVideo()");
                if (typeof playerObject.playVideo === 'function') playerObject.playVideo();
                else console.warn('playVideo method missing');
            }
        } else {
            // Fallback: toggle based on the last-known `isPlaying` flag
            usedFallback = true;
            console.warn('⚠️ getPlayerState unavailable — using isPlaying fallback:', isPlaying);
            if (isPlaying) {
                if (typeof playerObject.pauseVideo === 'function') {
                    console.log('📍 Fallback: pauseVideo()');
                    playerObject.pauseVideo();
                } else console.warn('pauseVideo method missing in fallback');
            } else {
                if (typeof playerObject.playVideo === 'function') {
                    console.log('📍 Fallback: playVideo()');
                    playerObject.playVideo();
                } else console.warn('playVideo method missing in fallback');
            }
        }

        if (usedFallback) console.log('⚙️ togglePlay used fallback toggle');
    } catch (err) {
        console.error("❌ Error in togglePlay:", err);
    }
}

function nextSong() {
    if (isSearchMode) {
        if (playerObject && typeof playerObject.nextVideo === 'function') {
            playerObject.nextVideo();
        }
        return;
    }

    if (isShuffle) {
        let newIndex = MUSIC_CONFIG.lastPlayedIndex;
        let attempts = 0;
        while (newIndex === MUSIC_CONFIG.lastPlayedIndex && MUSIC_CONFIG.playlist.length > 1 && attempts < 10) {
            newIndex = Math.floor(Math.random() * MUSIC_CONFIG.playlist.length);
            attempts++;
        }
        MUSIC_CONFIG.lastPlayedIndex = newIndex;
    } else {
        MUSIC_CONFIG.lastPlayedIndex = (MUSIC_CONFIG.lastPlayedIndex + 1) % MUSIC_CONFIG.playlist.length;
    }
    loadTrack(MUSIC_CONFIG.playlist[MUSIC_CONFIG.lastPlayedIndex]);
}

function prevSong() {
    if (isSearchMode) {
        if (playerObject && typeof playerObject.previousVideo === 'function') {
            playerObject.previousVideo();
        }
        return;
    }

    MUSIC_CONFIG.lastPlayedIndex = (MUSIC_CONFIG.lastPlayedIndex - 1 + MUSIC_CONFIG.playlist.length) % MUSIC_CONFIG.playlist.length;
    loadTrack(MUSIC_CONFIG.playlist[MUSIC_CONFIG.lastPlayedIndex]);
}

function loadTrack(id) {
    if (!playerObject) return;
    isSearchMode = false; // Reset to local mode whenever we load a specific track ID
    playerObject.loadVideoById(id);
    updateMetadata();
}

function updateMetadata() {
    const title = document.getElementById('songTitle');
    if (title) title.textContent = "Loading...";

    setTimeout(() => {
        if (!playerObject || typeof playerObject.getVideoData !== 'function') return;
        try {
            const data = playerObject.getVideoData();
            if (data && data.title) {
                document.getElementById('songTitle').textContent = data.title;
                document.getElementById('songArtist').textContent = data.author || "";

                // Cache metadata for voice search
                MUSIC_METADATA[data.video_id] = {
                    title: data.title,
                    author: data.author || ''
                };

                // Prefer maxres thumbnail but fall back to hqdefault/default if missing
                const disc = document.getElementById('albumArtDisc');
                if (disc) {
                    const tryThumbs = [`https://img.youtube.com/vi/${data.video_id}/maxresdefault.jpg`, `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`, `https://img.youtube.com/vi/${data.video_id}/default.jpg`];
                    const imgTest = new Image();
                    let idx = 0;
                    imgTest.onload = function () {
                        disc.style.backgroundImage = `url(${tryThumbs[idx]})`;
                    };
                    imgTest.onerror = function () {
                        idx++;
                        if (idx < tryThumbs.length) {
                            imgTest.src = tryThumbs[idx];
                        } else {
                            // no thumbnail found; clear background
                            disc.style.backgroundImage = '';
                        }
                    };
                    imgTest.src = tryThumbs[0];
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, 1500);
}

// Find best matching track id from playlist given a free-text query.
function findTrackByQuery(rawQuery) {
    if (!rawQuery) return null;
    const q = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
    if (!q) return null;

    // 1) Exact substring match against cached metadata titles
    for (const id of MUSIC_CONFIG.playlist) {
        const meta = MUSIC_METADATA[id];
        if (meta && meta.title && meta.title.toLowerCase().includes(q)) return id;
    }

    // 2) Word-match scoring against cached titles
    const qWords = q.split(/\s+/).filter(Boolean);
    let best = { id: null, score: 0 };
    for (const id of MUSIC_CONFIG.playlist) {
        const meta = MUSIC_METADATA[id];
        if (!meta || !meta.title) continue;
        const title = meta.title.toLowerCase();
        let score = 0;
        for (const w of qWords) {
            if (title.includes(w)) score += 2;
            // partial match
            if (w.length > 3 && title.indexOf(w) !== -1) score += 1;
        }
        if (score > best.score) best = { id, score };
    }
    if (best.id && best.score > 0) return best.id;

    // 3) Try matching against author names
    for (const id of MUSIC_CONFIG.playlist) {
        const meta = MUSIC_METADATA[id];
        if (meta && meta.author && meta.author.toLowerCase().includes(q)) return id;
    }

    return null;
}

function startProgressLoop() {
    setInterval(() => {
        if (!playerObject || typeof playerObject.getCurrentTime !== 'function') return;
        const curr = playerObject.getCurrentTime();
        const dur = playerObject.getDuration();
        if (dur > 0) {
            const pct = (curr / dur) * 100;
            const fill = document.getElementById('progressFill');
            if (fill) fill.style.width = `${pct}%`;

            const currEl = document.getElementById('currTime');
            const totEl = document.getElementById('totalTime');
            if (currEl) currEl.textContent = formatTime(curr);
            if (totEl) totEl.textContent = formatTime(dur);
        }
    }, 500);
}

function formatTime(s) {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

/**
 * 4. Voice Command System
 */
function setupVoiceRecognition() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return;

    recognition = new Speech();
    // Start with preferred language, fallbacks will be attempted on failures
    recognition.lang = RECOGNITION_LANGS[recognitionLangIndex] || navigator.language || 'en-US';
    recognition.continuous = false; // Stop after one command
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        console.log("🗣 Input:", text);
        // reset language index on success
        recognitionLangIndex = 0;
        const status = document.getElementById('voiceStatus');
        if (status) status.textContent = `"${text}"`;
        handleVoiceCommand(text);
    };

    recognition.onend = () => {
        recognitionActive = false;
        setTimeout(() => {
            const overlay = document.getElementById('voiceOverlay');
            if (overlay) overlay.classList.remove('active');
            const status = document.getElementById('voiceStatus');
            if (status) status.textContent = "Listening...";
        }, 2000);
    };

    recognition.onstart = () => {
        recognitionActive = true;
        console.log('🎙️ Speech recognition started (lang=' + recognition.lang + ')');
    };

    recognition.onerror = (event) => {
        console.error("Voice Error:", event.error);
        const status = document.getElementById('voiceStatus');
        // If no speech detected, try switching language once (Hinglish/Hindi -> English)
        if (event.error === 'no-speech') {
            if (recognitionLangIndex < RECOGNITION_LANGS.length - 1) {
                recognitionLangIndex++;
                recognition.lang = RECOGNITION_LANGS[recognitionLangIndex];
                console.log('🔁 Switching recognition language to', recognition.lang, 'and retrying');
                if (status) status.textContent = `No speech — retrying (${recognition.lang})...`;
                try { if (recognitionActive) { recognition.stop(); recognitionActive = false; } } catch (e) { }
                setTimeout(() => {
                    try { recognition.start(); recognitionActive = true; } catch (e) { console.error('Retry start failed', e); if (status) status.textContent = 'Voice unavailable.'; }
                }, 400);
                return;
            }

            // If we've already tried language fallbacks, allow one quick retry in same language
            if (recognitionRetryCount < 1) {
                recognitionRetryCount++;
                if (status) status.textContent = "No speech detected — retrying...";
                try { if (recognitionActive) { recognition.stop(); recognitionActive = false; } } catch (e) { }
                setTimeout(() => {
                    try { recognition.start(); recognitionActive = true; } catch (e) { console.error('Retry start failed', e); if (status) status.textContent = 'Voice unavailable.'; }
                }, 500);
                return;
            }

            if (status) status.textContent = "No speech detected.";
        } else {
            if (status) status.textContent = "Error. Try again.";
        }
    };
}

function startVoiceCommand() {
    if (!recognition) {
        alert("Voice not supported in this browser.");
        return;
    }
    // Pause if playing
    if (playerObject && typeof playerObject.pauseVideo === 'function') {
        playerObject.pauseVideo();
    }

    // Ensure microphone permission is requested before starting recognition
    recognitionRetryCount = 0;
    document.getElementById('voiceOverlay').classList.add('active');
    document.getElementById('voiceStatus').textContent = "Requesting microphone...";
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            document.getElementById('voiceStatus').textContent = "Listening...";
            try {
                if (recognitionActive) {
                    try { recognition.stop(); } catch (e) { /* ignore */ }
                    recognitionActive = false;
                }
                recognition.start();
            } catch (e) { console.error('Recognition start failed', e); }
        }).catch((err) => {
            console.error('Microphone permission denied', err);
            alert('Microphone access is required for voice commands. Please allow microphone access and try again.');
            const overlay = document.getElementById('voiceOverlay');
            if (overlay) overlay.classList.remove('active');
            const status = document.getElementById('voiceStatus');
            if (status) status.textContent = "Listening...";
        });
    } else {
        document.getElementById('voiceStatus').textContent = "Listening...";
        try { recognition.start(); } catch (e) { console.error('Recognition start failed', e); }
    }
}

function handleVoiceCommand(cmd) {
    const cleaned = cmd.toLowerCase();

    // If command explicitly contains pause/stop
    if (cleaned.includes('pause') || cleaned.includes('stop')) {
        if (playerObject && typeof playerObject.pauseVideo === 'function') playerObject.pauseVideo();
        document.getElementById('voiceStatus').textContent = "Paused.";
        return;
    }

    // If command explicitly contains next/prev/shuffle commands, handle them
    if (cleaned.includes('next') || cleaned.includes('skip')) { nextSong(); document.getElementById('voiceStatus').textContent = "Skipping... ⏭"; return; }
    if (cleaned.includes('previous') || cleaned.includes('back')) { prevSong(); document.getElementById('voiceStatus').textContent = "Rewinding... ⏮"; return; }
    if (cleaned.includes('shuffle') || cleaned.includes('random')) { document.getElementById('btnShuffle').click(); document.getElementById('voiceStatus').textContent = "Toggling Shuffle"; return; }

    // If the phrase contains 'play' or looks like a song name, extract possible search term
    let query = cleaned;
    // Hindi/Hinglish: play, please, bajao, chalao, sunao, laga, lagao, gana
    query = query.replace(/\b(play|song|please|the|a|an|start|please play|play the|bajao|chalao|sunao|laga|lagao|gana|ple|play)\b/g, '').trim();

    // Also strip Devnagari "play" etc - using direct characters for better matching
    // प्ले, बजाओ, चलाओ, सुनाओ, गाना
    const hindiKeywords = ['प्ले', 'बजाओ', 'चलाओ', 'सुनाओ', 'गाना', 'सॉन्ग'];
    hindiKeywords.forEach(kw => {
        query = query.replace(new RegExp(kw, 'g'), '');
    });
    query = query.trim();

    // If nothing left after stripping, just toggle play
    if (!query) {
        if (playerObject && typeof playerObject.playVideo === 'function') playerObject.playVideo();
        document.getElementById('voiceStatus').textContent = "Playing... 🎵";
        return;
    }

    // Search YouTube via server (scrapes YouTube search, returns video ID) and play that video.
    // YouTube IFrame API loadPlaylist(listType:'search') was deprecated Nov 2020 and no longer works.
    document.getElementById('voiceStatus').textContent = "Searching YouTube...";

    fetch('/api/music-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
    })
        .then(res => {
            if (!res.ok) throw new Error('Search failed');
            return res.json();
        })
        .then(data => {
            const videoId = data.result;
            if (!videoId || !playerObject) {
                document.getElementById('voiceStatus').textContent = "Could not find song.";
                return;
            }
            console.log('📼 Playing YouTube search result:', videoId, 'for query:', query);
            isSearchMode = false;
            loadTrack(videoId);
            setTimeout(() => {
                if (playerObject && typeof playerObject.playVideo === 'function') playerObject.playVideo();
            }, 400);
            document.getElementById('voiceStatus').textContent = "Playing from YouTube...";
        })
        .catch(err => {
            console.error('Music search error:', err);
            document.getElementById('voiceStatus').textContent = "Search failed. Opening YouTube...";
            const searchPage = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            window.open(searchPage, '_blank');
        });
}

// Auto Init
window.addEventListener('load', initFuturisticPlayer);
