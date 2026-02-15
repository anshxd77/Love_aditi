const fs = require('fs');
const path = require('path');

const aiJsPath = path.join(__dirname, 'public', 'js', 'ai.js');
const newMusicCode = `/* ═══════════════════════════════════════
   SPOTIFY-STYLE MUSIC PLAYER
   ═══════════════════════════════════════ */

let player;
let isMusicPlaying = false;
let isPlayerReady = false;
let recognition;
let musicPlaylist = [];
let currentTrackIndex = 0;
let progressInterval;

// Default Romantic Playlist
const defaultTracks = [
    'h1Fxjmg_KL4', 'GX9x62kFsVU', 'WglSfZJOPds', 'wpka0Q8hlXc', 'fG8nF53ceQc',
    '1SvBXEqgu6k', 'dQAuza7q1Wo', 'dawrQnvwMTY', '_hYsJ8I5kjw', 'o_1aF54DO60'
];

function initMusicPlayer() {
    // 1. YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // 2. Playlist
    musicPlaylist = [...defaultTracks];
    shufflePlaylist();

    // 3. API Ready
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtubePlayer', {
            height: '1', width: '1',
            videoId: musicPlaylist[0],
            playerVars: { 'playsinline': 1, 'controls': 0, 'disablekb': 1 },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    };

    // 4. Global Voice Init
    document.body.addEventListener('click', () => {
        if(player && isPlayerReady) { /* Context unlocked */ }
        initVoiceRecognition();
    }, { once: true });
}

function shufflePlaylist() {
    for (let i = musicPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [musicPlaylist[i], musicPlaylist[j]] = [musicPlaylist[j], musicPlaylist[i]];
    }
}

/* ─── UI Actions ─── */
window.openMusicPlayer = function() {
    const modal = document.getElementById('musicModal');
    if(modal) {
        modal.classList.add('active');
        updateAlbumArt();
    }
};

window.closeMusicPlayer = function() {
    const modal = document.getElementById('musicModal');
    if(modal) modal.classList.remove('active');
};

function updateAlbumArt(videoId = null) {
    const vid = videoId || (player && player.getVideoData ? player.getVideoData().video_id : musicPlaylist[currentTrackIndex]);
    if(vid) {
        const url = \`https://img.youtube.com/vi/\${vid}/hqdefault.jpg\`; 
        const art = document.getElementById('albumArt');
        if(art) art.style.backgroundImage = \`url('\${url}')\`;
    }
}

/* ─── Player Events ─── */
function onPlayerReady(event) {
    isPlayerReady = true;
    player.setVolume(50);
    updateAlbumArt();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    } else if (event.data === YT.PlayerState.PLAYING) {
        isMusicPlaying = true;
        updateUIState(true);
        startProgressLoop();
        
        // Metadata
        const data = player.getVideoData();
        if(data && data.title) {
            const titleEl = document.getElementById('largeSongTitle');
            if(titleEl) titleEl.textContent = data.title;
            // Also update album art if changed
            updateAlbumArt(data.video_id);
        }
        
    } else if (event.data === YT.PlayerState.PAUSED) {
        isMusicPlaying = false;
        updateUIState(false);
        stopProgressLoop();
    }
}

function onPlayerError() { playNextSong(); }

function updateUIState(playing) {
    const btn = document.getElementById('largePlayBtn');
    if(btn) btn.textContent = playing ? '⏸' : '▶';
    
    // Mini Widget Pulse
    const mini = document.getElementById('miniMusicWidget');
    if(mini) {
        if(playing) mini.classList.add('playing');
        else mini.classList.remove('playing');
    }
}

window.togglePlay = function() {
    if (!player || !isPlayerReady) return;
    isMusicPlaying ? player.pauseVideo() : player.playVideo();
};

window.playNextSong = function() {
    if (!player) return;
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    player.loadVideoById(musicPlaylist[currentTrackIndex]);
    player.playVideo();
};

window.playPrevSong = function() {
    if (!player) return;
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    player.loadVideoById(musicPlaylist[currentTrackIndex]);
    player.playVideo();
};

/* ─── Progress Bar ─── */
function startProgressLoop() {
    stopProgressLoop();
    progressInterval = setInterval(() => {
        if(!player || !isMusicPlaying) return;
        const current = player.getCurrentTime();
        const total = player.getDuration();
        if(total > 0) {
            const pct = (current / total) * 100;
            const bar = document.getElementById('progressBar');
            if(bar) bar.style.width = \`\${pct}%\`;
        }
    }, 1000);
}

function stopProgressLoop() {
    if(progressInterval) clearInterval(progressInterval);
}

/* ─── Voice Engine (Continuous) ─── */
function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; 

    // Visual Feedback
    recognition.onstart = () => {  
        const status = document.getElementById('modalVoiceStatus');
        if(status) status.style.color = "#ff007a";
    };
    recognition.onend = () => { 
        const status = document.getElementById('modalVoiceStatus');
        if(status) status.style.color = "rgba(255,255,255,0.6)";
        // Auto-restart
        try { recognition.start(); } catch(e){}
    };
    
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voice:", transcript);
        
        // Wake Words
        if (/cupid|baby|jaan|hello|sunao/.test(transcript)) {
            handleVoiceCommand(transcript);
        }
    };
    
    // Start immediately
    try { recognition.start(); } catch(e){}
}

async function handleVoiceCommand(text) {
    const status = document.getElementById('modalVoiceStatus');
    if(status) {
        status.textContent = \`🎤 "\${text}"\`;
        setTimeout(() => status.textContent = 'Say "Hey Cupid" to control', 3000);
    }

    let cmd = text;
    ['hey cupid', 'okay cupid', 'ansh baby', 'baby', 'jaan', 'cupid', 'sunao', 'please'].forEach(p => {
        if(cmd.startsWith(p)) cmd = cmd.substring(p.length).trim();
    });

    if (cmd.match(/next|skip/)) return playNextSong();
    if (cmd.match(/stop|pause|ruko/)) return player.pauseVideo();
    if (cmd.match(/resume|start|play$/)) return player.playVideo();
    if (cmd.match(/open|show player/)) return openMusicPlayer();
    if (cmd.match(/close|hide player/)) return closeMusicPlayer();

    // Search
    const playMatch = cmd.match(/(?:play|sunao|baja do)\s+(.*)/);
    const songQuery = playMatch ? playMatch[1] : cmd;

    if (songQuery.length < 3) return;

    await searchAndPlaySong(songQuery);
}

async function searchAndPlaySong(query) {
    const status = document.getElementById('modalVoiceStatus');
    if(status) status.textContent = \`🔎 Searching \${query}...\`;
    
    try {
        const res = await fetch('/api/music-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        if (data.result) {
            musicPlaylist.splice(currentTrackIndex + 1, 0, data.result);
            playNextSong();
            // Auto open player to show search result
            openMusicPlayer();
        } else {
            if(status) status.textContent = "Song not found 😕";
        }
    } catch (e) {
        console.error(e);
    }
}
`;

fs.readFile(aiJsPath, 'utf8', (err, data) => {
    if (err) { console.error('Error reading ai.js:', err); return; }

    // Find the marker
    const marker = '/* ═══════════════════════════════════════';
    const markerIndex = data.indexOf(marker);

    if (markerIndex === -1) {
        console.error('Marker not found! Keeping original file.');
        return;
    }

    // Keep everything BEFORE the marker
    const newContent = data.substring(0, markerIndex) + '\\n' + newMusicCode;

    fs.writeFile(aiJsPath, newContent, 'utf8', (err) => {
        if (err) console.error('Error writing ai.js:', err);
        else console.log('Successfully updated ai.js music player section!');
    });
});
