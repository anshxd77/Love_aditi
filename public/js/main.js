/*
 * main.js
 *
 * This script powers the interactive Valentine’s Day page. It creates a
 * twinkling star field and floating hearts, reveals the gift prompt on
 * scroll, handles voice and text responses with the Web Speech API, uploads
 * photos, and orchestrates the gift slideshow and final proposal.
 *
 * The Web Speech API provides speech recognition via the SpeechRecognition
 * interface and text‑to‑speech via the SpeechSynthesis interface
 *【751932417317130†L190-L208】. File uploads are handled via a POST to
 * /upload and rely on Multer on the server side【733153657844934†L115-L133】.
 */

// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initShootingStars();
  initHearts();
  initFloatingLoveTexts();
  initCursorHeartTrail();
  initClickLoveBurst();
  initLoveReasonsTypewriter();
  setupScrollPrompt();
  setupUploads();
  setupPromptInteractions();
  animateMainMessage();
  initShayari();
});


/* ═══════════════════════════════════════
   Floating Love Text Phrases (background)
   ═══════════════════════════════════════ */
const lovePhrases = [
  'I Love Aditi ❤️', 'Forever Yours', 'Aadubadia 💖',
  'My Heart Beats For You', 'You Are My World 🌍',
  'Always & Forever', 'Ansh ♥ Aditi', 'My Valentine 💝',
  'Soulmates 💕', 'My Everything', 'You & Me 💫',
  'Love You Forever', 'My Queen 👑',
  'Made For Each Other', 'Endless Love 💓',
  'My Sunshine ☀️', 'My One & Only',
  'Dream Come True ✨', 'My Heartbeat',
  'Two Hearts One Love 💜', 'My Happiness 🥰'
];

function initFloatingLoveTexts() {
  // Initial burst
  for (let i = 0; i < 8; i++) {
    setTimeout(() => spawnFloatingLoveText(), i * 400);
  }
  // Continuous spawn — fast
  setInterval(spawnFloatingLoveText, 1500);
}

function spawnFloatingLoveText() {
  const container = document.getElementById('floatingTexts');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'floating-text-bg';
  el.textContent = lovePhrases[Math.floor(Math.random() * lovePhrases.length)];
  el.style.left = (5 + Math.random() * 85) + '%';
  el.style.bottom = '-5%';
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
  el.style.setProperty('--ft-rotate', (-15 + Math.random() * 30) + 'deg');
  el.style.animationDuration = (5 + Math.random() * 7) + 's';
  if (Math.random() > 0.5) el.classList.add('ft-glow');
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/**
 * Splits the main message into individual characters and assigns random animations
 * to create a high-energy, varied effect ("50+ animations" feel).
 */
function animateMainMessage() {
  const mainMessage = document.getElementById('main-message');
  if (mainMessage) {
    const text = mainMessage.innerText; // Use innerText to preserve spacing
    mainMessage.innerHTML = ''; // Clear existing content used innerHTML to allow tags if any, but mostly text

    const animations = [
      'anim-bounce', 'anim-flash', 'anim-pulse', 'anim-rubberBand',
      'anim-shakeX', 'anim-shakeY', 'anim-headShake', 'anim-swing',
      'anim-tada', 'anim-wobble', 'anim-jello', 'anim-heartBeat',
      'anim-flip', 'anim-rotateIn', 'anim-zoomIn'
    ];

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.classList.add('letter-animation');

      // Randomly pick an animation
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      span.classList.add(randomAnim);

      // Add random delays for chaos
      span.style.animationDelay = (Math.random() * 2) + 's';
      span.style.animationDuration = (1 + Math.random() * 2) + 's';

      mainMessage.appendChild(span);
    });
  }
}

/**
 * Create a twinkling star field using the Canvas API. Stars fade in and out
 * at different speeds to create a gentle shimmering effect.
 */
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const stars = [];
  const numStars = 120;

  // Handle resize events
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.length = 0;
    createStars();
  });

  function createStars() {
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.2 + 0.3;
      const alpha = Math.random();
      const speed = (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1);
      stars.push({ x, y, radius, alpha, speed });
    }
  }

  createStars();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.alpha += star.speed;
      if (star.alpha <= 0 || star.alpha >= 1) {
        star.speed *= -1;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/**
 * Generate floating hearts that drift down the page. The hearts are created
 * periodically and assigned random positions, sizes and durations. Hearts
 * automatically remove themselves when the animation ends.
 */
function initHearts() {
  const container = document.getElementById('hearts-container');
  if (!container) return;
  function addHeart() {
    const heart = document.createElement('div');
    heart.classList.add('falling-heart');

    // random love emoji
    const emojis = ['❤️', '💖', '💘', '💝', '💓', '💗', '😍', '🥰', '😘'];
    heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    // random horizontal start position
    heart.style.left = Math.random() * 100 + '%';

    // random size
    const size = 15 + Math.random() * 30;
    heart.style.fontSize = `${size}px`;

    // random animation duration and delay
    const duration = 5 + Math.random() * 5; // 5s to 10s
    heart.style.animationDuration = duration + 's';
    heart.style.animationDelay = Math.random() * 5 + 's';

    // remove heart after its animation completes
    heart.addEventListener('animationend', () => {
      heart.remove();
    });
    container.appendChild(heart);

  }
  // Create a new heart every 800ms
  setInterval(addHeart, 800);
}

/**
 * Once the user scrolls a certain distance down the page, reveal the
 * prompt asking if she wants to see her Valentine’s gift. This uses a
 * simple scroll listener instead of IntersectionObserver for simplicity.
 */
function setupScrollPrompt() {
  // No-op: prompt now appears only after both photos are uploaded
}

/**
 * Attach change listeners to the photo upload inputs. When a user selects
 * a file, it is uploaded to the server via fetch. The server responds
 * with a relative URL which is then used to replace the placeholder
 * images in the modal and slideshow.
 */
function setupUploads() {
  const maleInput = document.getElementById('malePhoto');
  const femaleInput = document.getElementById('femalePhoto');
  const maleImg = document.getElementById('maleImg');
  const slideshow = document.getElementById('slideshow');
  const slides = slideshow ? slideshow.getElementsByClassName('slide') : [];
  const femaleImgNormal = document.getElementById('femaleImg');
  const femaleImgBlur = document.getElementById('femaleImgBlur');

  let maleUploaded = false;
  let femaleUploaded = false;

  function checkBothUploaded() {
    if (maleUploaded && femaleUploaded) {
      const promptSection = document.getElementById('prompt-section');
      if (promptSection) {
        promptSection.classList.remove('hidden');
        promptSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (maleInput) {
    maleInput.addEventListener('change', () => {
      const file = maleInput.files[0];
      if (file) {
        showPreview(file, 'malePreview');
        uploadFile(file).then((url) => {
          console.log('Male photo uploaded:', url);
          maleImg.src = url;
          maleUploaded = true;
          checkBothUploaded();
        });
      }
    });
  }

  if (femaleInput) {
    femaleInput.addEventListener('change', () => {
      const file = femaleInput.files[0];
      if (file) {
        showPreview(file, 'femalePreview');
        uploadFile(file).then((url) => {
          console.log('Female photo uploaded:', url);
          if (femaleImgNormal) femaleImgNormal.src = url;
          if (femaleImgBlur) femaleImgBlur.src = url;
          femaleUploaded = true;
          checkBothUploaded();
        });
      }
    });
  }
}

/**
 * Show a blurred live preview of the selected file inside a preview container.
 */
function showPreview(file, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = 'Preview';
    img.style.filter = 'blur(6px)';
    img.style.transform = 'scale(1.15)'; // slight zoom to cover blur edges
    preview.appendChild(img);
  };
  reader.readAsDataURL(file);
}

/**
 * Create a local object URL for the selected file. This avoids a server
 * round-trip and works on platforms with read-only filesystems (e.g. Vercel).
 * Returns a promise for API compatibility with the rest of the code.
 */
function uploadFile(file) {
  return Promise.resolve(URL.createObjectURL(file));
}

/**
 * Set up the interactions for the prompt asking if she wants to see her
 * Valentine’s gift. Handles voice recognition via Web Speech API and
 * fallback text input. On a positive answer, the gift modal is shown.
 */
function setupPromptInteractions() {
  const voiceBtn = document.getElementById('voiceBtn');
  const textBtn = document.getElementById('textBtn');
  const textResponse = document.getElementById('textResponse');
  const giftModal = document.getElementById('giftModal');
  const closeBtn = document.getElementById('giftClose');
  const valentineQuestionBtn = document.getElementById('valentineQuestionBtn');

  // Helper to handle an answer string
  function handleAnswer(answer) {
    const normalized = answer.trim().toLowerCase();
    if (normalized.includes('yes') || normalized.includes('yeah') || normalized.includes('sure')) {
      showGiftModal();
    } else {
      alert("Oh no! Maybe next time.");
    }
  }

  // Mic overlay elements
  const micOverlay = document.getElementById('micOverlay');
  const micStatus = document.getElementById('micStatus');

  // Start voice recognition with animated mic overlay
  function startVoiceRecognition(onResultCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please type your response.');
      return;
    }

    // Show mic overlay
    if (micOverlay) {
      micOverlay.classList.remove('hidden');
      if (micStatus) {
        micStatus.textContent = 'Say "Yes" 💖';
        micStatus.className = 'mic-status';
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const normalized = transcript.trim().toLowerCase();

      if (micStatus) {
        if (normalized.includes('yes') || normalized.includes('yeah') || normalized.includes('sure')) {
          micStatus.textContent = '✅ "' + transcript + '" — Opening your gift!';
          micStatus.className = 'mic-status mic-success';
        } else {
          micStatus.textContent = '❌ Heard: "' + transcript + '"';
          micStatus.className = 'mic-status mic-error';
        }
      }

      // Delay to show the result, then hide overlay and proceed
      setTimeout(() => {
        if (micOverlay) micOverlay.classList.add('hidden');
        onResultCallback(transcript);
      }, 1200);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (micStatus) {
        micStatus.textContent = '⚠️ Error: ' + event.error;
        micStatus.className = 'mic-status mic-error';
      }
      setTimeout(() => {
        if (micOverlay) micOverlay.classList.add('hidden');
      }, 1500);
    };

    recognition.onend = () => {
      // If no result was captured, hide the overlay after a moment
      setTimeout(() => {
        if (micOverlay && !micOverlay.classList.contains('hidden')) {
          if (micStatus) {
            micStatus.textContent = 'No speech detected. Try again.';
            micStatus.className = 'mic-status mic-error';
          }
          setTimeout(() => {
            if (micOverlay) micOverlay.classList.add('hidden');
          }, 1500);
        }
      }, 500);
    };

    recognition.start();
  }

  // Voice button
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      startVoiceRecognition(handleAnswer);
    });
  }

  // Text button shows input
  if (textBtn) {
    textBtn.addEventListener('click', () => {
      textResponse.classList.toggle('hidden');
      textResponse.focus();
    });
  }

  // Enter key on text input
  if (textResponse) {
    textResponse.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAnswer(textResponse.value);
      }
    });
  }

  // Close the gift reveal and cleanup hearts
  let heartSpawnInterval = null;
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      giftModal.classList.add('hidden');
      // Clear floating hearts
      const container = document.getElementById('revealHearts');
      if (container) container.innerHTML = '';
      if (heartSpawnInterval) clearInterval(heartSpawnInterval);
    });
  }

  // Valentine button → speak question aloud, then pop up mic to listen for answer
  if (valentineQuestionBtn) {
    valentineQuestionBtn.addEventListener('click', () => {
      askValentineWithVoice();
    });
  }

  function askValentineWithVoice() {
    // Show mic overlay with "asking" state first
    if (micOverlay) {
      micOverlay.classList.remove('hidden');
      if (micStatus) {
        micStatus.textContent = '🗣️ Asking you something...';
        micStatus.className = 'mic-status';
      }
    }

    // Speak the question aloud
    const utterance = new SpeechSynthesisUtterance('Will you be my Valentine?');
    const voices = window.speechSynthesis.getVoices();
    // Try to pick a female voice
    const femaleVoice = voices.find((v) =>
      /female/i.test(v.name) || /zira/i.test(v.name) || /samantha/i.test(v.name) ||
      /victoria/i.test(v.name) || /karen/i.test(v.name) || /google.*female/i.test(v.name)
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.pitch = 1.2;
    utterance.rate = 0.95;

    // After speaking finishes, switch to listening mode
    utterance.onend = () => {
      if (micStatus) {
        micStatus.textContent = 'Say "Yes" 💖';
        micStatus.className = 'mic-status';
      }
      // Start listening for the answer
      startVoiceRecognition((answer) => {
        const normalized = answer.trim().toLowerCase();
        if (normalized.includes('yes') || normalized.includes('yeah') || normalized.includes('sure')) {
          window.location.href = 'valentine.html';
        } else {
          alert('Maybe another time! 💔');
        }
      });
    };

    utterance.onerror = () => {
      // If speech synthesis fails, just go straight to listening
      if (micStatus) {
        micStatus.textContent = 'Say "Yes" 💖';
        micStatus.className = 'mic-status';
      }
      startVoiceRecognition((answer) => {
        const normalized = answer.trim().toLowerCase();
        if (normalized.includes('yes') || normalized.includes('yeah') || normalized.includes('sure')) {
          window.location.href = 'valentine.html';
        } else {
          alert('Maybe another time! 💔');
        }
      });
    };

    window.speechSynthesis.speak(utterance);
  }

  // Show the full-screen gift reveal with floating hearts
  function showGiftModal() {
    giftModal.classList.remove('hidden');
    spawnRevealHearts();
  }

  function spawnRevealHearts() {
    const container = document.getElementById('revealHearts');
    if (!container) return;
    container.innerHTML = '';
    const emojis = ['❤️', '💖', '💗', '💕', '💘', '💝', '🌹', '✨', '💫', '🥰'];

    // Initial burst
    for (let i = 0; i < 20; i++) {
      setTimeout(() => addRevealHeart(container, emojis), i * 150);
    }
    // Continuous ambient hearts
    heartSpawnInterval = setInterval(() => addRevealHeart(container, emojis), 600);
  }

  function addRevealHeart(container, emojis) {
    const el = document.createElement('span');
    el.className = 'reveal-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
    el.style.animationDuration = (4 + Math.random() * 4) + 's';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    container.appendChild(el);
    // Remove after animation ends
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ═══════════════════════════════════════
   Shayari — Speech & Background Music
   ═══════════════════════════════════════ */

/**
 * Initialise the shayari play button. Clicking it plays a romantic
 * background melody first, then speaks the shayari in Hindi with a
 * slow, melodic delivery that sounds like singing.
 */
function initShayari() {
  const btn = document.getElementById('shayariPlayBtn');
  if (!btn) return;

  // Spawn ambient sparkle particles around the shayari text
  const sparkleContainer = document.getElementById('shayariSparkles');
  if (sparkleContainer) {
    const sparkleChars = ['✦', '✧', '·', '✦', '✧', '·', '✦', '✧'];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.className = 'shayari-sparkle';
      s.textContent = sparkleChars[i % sparkleChars.length];
      s.style.left = (5 + Math.random() * 90) + '%';
      s.style.top = (10 + Math.random() * 80) + '%';
      s.style.animationDelay = (Math.random() * 3) + 's';
      s.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      sparkleContainer.appendChild(s);
    }
  }

  let isPlaying = false;
  let audioCtx = null;
  let musicGain = null;
  let musicTimeout = null;
  const speakerPopup = document.getElementById('speakerPopup');

  function showSpeaker() {
    if (speakerPopup) {
      speakerPopup.classList.remove('hidden');
      // Force reflow then add visible
      void speakerPopup.offsetWidth;
      speakerPopup.classList.add('visible');
    }
  }

  function hideSpeaker() {
    if (speakerPopup) {
      speakerPopup.classList.remove('visible');
      setTimeout(() => speakerPopup.classList.add('hidden'), 500);
    }
  }

  btn.addEventListener('click', () => {
    if (isPlaying) return;
    isPlaying = true;
    btn.classList.add('playing');
    btn.querySelector('.shayari-play-text').textContent = 'Playing…';

    // Show speaker popup
    showSpeaker();

    // Create audio context for background music
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Start sweet background music
    musicGain = playSweetMelody(audioCtx);

    // After a short musical intro, speak the shayari
    musicTimeout = setTimeout(() => {
      speakShayari(() => {
        // After speech ends, let music play for a bit then fade
        setTimeout(() => {
          fadeOutMusic(musicGain, audioCtx, () => {
            isPlaying = false;
            btn.classList.remove('playing');
            btn.querySelector('.shayari-play-text').textContent = 'Suniye';
            hideSpeaker();
          });
        }, 2000);
      });
    }, 2000);
  });
}

/**
 * Speak the Hindi shayari using Web Speech API with a slow, melodic
 * delivery. We split it into two utterances (one per line) with a
 * pause between them for dramatic effect.
 */
function speakShayari(onComplete) {
  const line1 = 'थोड़े गुस्से वाले, थोड़े नादान हो तुम';
  const line2 = 'लेकिन जैसे भी हो, मेरी जान हो तुम';

  const el1 = document.getElementById('shayariLine1');
  const el2 = document.getElementById('shayariLine2');

  // Helper to create a singing-style utterance
  function makeSinging(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.9;     // Slightly slow for melodic, poetic feel
    u.pitch = 1.15;   // Slightly high for melodic feel
    u.volume = 1;

    // Try to pick a Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v =>
      v.lang && v.lang.startsWith('hi')
    );
    if (hindiVoice) u.voice = hindiVoice;
    return u;
  }

  // Highlight effect
  function highlight(el) {
    if (el) {
      el.style.transition = 'all 0.5s ease';
      el.style.textShadow = '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,45,117,0.4)';
      el.style.transform = 'scale(1.05)';
    }
  }
  function unhighlight(el) {
    if (el) {
      el.style.textShadow = '';
      el.style.transform = '';
    }
  }

  // Speak line 1
  const u1 = makeSinging(line1);
  u1.onstart = () => highlight(el1);
  u1.onend = () => {
    unhighlight(el1);
    // Pause between lines for dramatic effect
    setTimeout(() => {
      const u2 = makeSinging(line2);
      u2.onstart = () => highlight(el2);
      u2.onend = () => {
        unhighlight(el2);
        if (onComplete) onComplete();
      };
      u2.onerror = () => {
        unhighlight(el2);
        if (onComplete) onComplete();
      };
      window.speechSynthesis.speak(u2);
    }, 800);
  };
  u1.onerror = () => {
    unhighlight(el1);
    if (onComplete) onComplete();
  };

  // Voices may need time to load
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.speak(u1);
    }, { once: true });
  } else {
    window.speechSynthesis.speak(u1);
  }
}

/**
 * Sweet romantic background melody — warm, lullaby-like.
 * Uses triangle waves with detune for a soft chorus/pad effect,
 * gentle descending melody notes over sustained chords.
 */
function playSweetMelody(ctx) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);
  masterGain.connect(ctx.destination);

  // Warm reverb via delay feedback
  const reverbDelay = ctx.createDelay();
  reverbDelay.delayTime.value = 0.2;
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.25;
  const reverbFilter = ctx.createBiquadFilter();
  reverbFilter.type = 'lowpass';
  reverbFilter.frequency.value = 1500;
  reverbDelay.connect(reverbGain);
  reverbGain.connect(reverbFilter);
  reverbFilter.connect(reverbDelay);
  reverbFilter.connect(masterGain);

  // Soft pad layer — low sustained notes
  const padChords = [
    [261.63, 329.63, 392.00],  // Cmaj
    [220.00, 261.63, 329.63],  // Am
    [174.61, 220.00, 261.63],  // Fmaj
    [196.00, 246.94, 293.66],  // G
  ];

  let time = ctx.currentTime + 0.2;
  const chordLen = 2.5;

  // Play 3 cycles (~30s)
  for (let cycle = 0; cycle < 3; cycle++) {
    padChords.forEach((chord, ci) => {
      // Soft pad — sustained triangle wave chord
      chord.forEach(freq => {
        playSweetNote(ctx, freq, time, chordLen * 0.95, 0.08, 'triangle', masterGain, reverbDelay);
        // Detune layer for chorus warmth
        playSweetNote(ctx, freq * 1.003, time, chordLen * 0.95, 0.04, 'sine', masterGain, reverbDelay);
      });

      // Melody — gentle descending lullaby notes on top
      const melodyNotes = [
        [523.25, 0, 0.6],    // C5
        [493.88, 0.5, 0.5],  // B4
        [440.00, 1.0, 0.6],  // A4
        [392.00, 1.5, 0.8],  // G4
      ];
      // Shift melody for each chord
      const melodyShift = [0, -2, -4, -2]; // semitone offsets
      const shift = Math.pow(2, melodyShift[ci] / 12);
      melodyNotes.forEach(([freq, offset, dur]) => {
        playSweetNote(ctx, freq * shift, time + offset, dur, 0.12, 'triangle', masterGain, reverbDelay);
      });

      time += chordLen;
    });
  }

  return masterGain;
}

/**
 * Play a sweet, warm note with gentle attack and smooth release.
 */
function playSweetNote(ctx, freq, startTime, duration, volume, waveType, destination, reverb) {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.setValueAtTime(freq, startTime);

  // Very gentle attack and smooth release
  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.15);
  noteGain.gain.setValueAtTime(volume, startTime + duration * 0.6);
  noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(noteGain);
  noteGain.connect(destination);
  if (reverb) noteGain.connect(reverb);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

/**
 * Gradually fade out the music and close the audio context.
 */
function fadeOutMusic(gainNode, ctx, onDone) {
  if (!gainNode || !ctx) {
    if (onDone) onDone();
    return;
  }
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(0, now + 2);
  setTimeout(() => {
    ctx.close().catch(() => { });
    if (onDone) onDone();
  }, 2200);
}

/* ═══════════════════════════════════════
   Shooting Stars
   ═══════════════════════════════════════ */
function initShootingStars() {
  const canvas = document.getElementById('shooting-stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const shootingStars = [];

  function spawnShootingStar() {
    const x = Math.random() * w * 0.8;
    const y = Math.random() * h * 0.4;
    const len = 80 + Math.random() * 120;
    const speed = 4 + Math.random() * 4;
    const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6); // 30-60 deg
    shootingStars.push({ x, y, len, speed, angle, life: 1, trail: [] });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.008;
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 20) s.trail.shift();

      // Draw trail
      for (let t = 0; t < s.trail.length; t++) {
        const alpha = (t / s.trail.length) * s.life * 0.8;
        const radius = (t / s.trail.length) * 1.5;
        ctx.beginPath();
        ctx.arc(s.trail[t].x, s.trail[t].y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // Draw head glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
      ctx.fill();

      if (s.life <= 0) shootingStars.splice(i, 1);
    }
    requestAnimationFrame(animate);
  }

  animate();
  // Spawn shooting stars at random intervals
  function scheduleNext() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      spawnShootingStar();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
  // First one appears quickly
  setTimeout(spawnShootingStar, 1500);
}

/* ═══════════════════════════════════════
   Cursor Heart Trail
   ═══════════════════════════════════════ */
function initCursorHeartTrail() {
  const container = document.getElementById('cursorTrail');
  if (!container) return;

  const hearts = ['💗', '💕', '✨', '💖', '❤️', '💫', '🌸'];
  let lastTime = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < 80) return; // Throttle — one every 80ms
    lastTime = now;

    const heart = document.createElement('span');
    heart.className = 'cursor-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    heart.style.fontSize = (0.6 + Math.random() * 0.8) + 'rem';
    container.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  });
}

/* ═══════════════════════════════════════
   Click / Touch Love Burst
   ═══════════════════════════════════════ */
function initClickLoveBurst() {
  const container = document.getElementById('loveBurst');
  if (!container) return;

  const emojis = ['❤️', '💖', '💗', '💕', '✨', '💘', '🌹', '💫', '🥰', '😘'];

  document.addEventListener('click', (e) => {
    // Don't burst on buttons or interactive elements
    if (e.target.closest('button, input, a, .photo-card')) return;

    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'love-burst-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = e.clientX + 'px';
      p.style.top = e.clientY + 'px';
      // Random direction
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 40 + Math.random() * 60;
      p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--by', Math.sin(angle) * dist + 'px');
      p.style.fontSize = (0.7 + Math.random() * 0.8) + 'rem';
      container.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  });
}

/* ═══════════════════════════════════════
   Love Reasons Typewriter
   ═══════════════════════════════════════ */
function initLoveReasonsTypewriter() {
  const el = document.getElementById('loveReasonText');
  if (!el) return;

  const reasons = [
    'your smile lights up my world ✨',
    'you make every day feel special 💖',
    'you believe in me when I don\'t 🌟',
    'your laugh is my favorite song 🎵',
    'you\'re my best friend and soulmate 💕',
    'you understand me without words 💫',
    'every moment with you is magic 🪄',
    'you make my heart race, still 💓',
    'your hugs feel like home 🏠',
    'you\'re the reason I smile 😊',
    'you love me for who I am 🌹',
    'you\'re my dream come true ✨',
    'everything is better with you 💝',
    'you\'re my today and all my tomorrows 🌅',
    'meri jaan ho tum 💗',
  ];

  let reasonIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  function type() {
    const current = reasons[reasonIndex];

    if (!isDeleting) {
      // Typing
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex >= current.length) {
        // Pause before deleting
        pauseTimer = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2500);
        return;
      }
      setTimeout(type, 50 + Math.random() * 40);
    } else {
      // Deleting
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex <= 0) {
        isDeleting = false;
        reasonIndex = (reasonIndex + 1) % reasons.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 25);
    }
  }

  // Start after a delay
  setTimeout(type, 2000);
}