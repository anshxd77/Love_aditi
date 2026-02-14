/*
 * Valentine page JS — Special features:
 * 1. Confetti burst on page load
 * 2. Floating love text phrases
 * 3. Scroll-reveal for promise cards
 * 4. Typewriter "Why I Love You" cycling
 * 5. Live ticking love counter
 * 6. Web Audio romantic melody
 * 7. Floating emoji hearts
 * 8. Per-letter heading animation
 */

const animations = [
  'anim-bounce', 'anim-flash', 'anim-pulse', 'anim-rubberBand',
  'anim-shakeX', 'anim-shakeY', 'anim-headShake', 'anim-swing',
  'anim-tada', 'anim-wobble', 'anim-jello', 'anim-heartBeat',
  'anim-flip', 'anim-rotateIn', 'anim-zoomIn'
];

const loveTexts = [
  'I Love Aditi ❤️', 'Forever Yours', 'Aadubadia 💖',
  'My Heart Beats For You', 'You Are My World 🌍',
  'Always & Forever', 'Ansh ♥ Aditi', 'My Valentine 💝',
  'You Make Me Happy 😊', 'Together Forever',
  'Soulmates 💕', 'My Everything', 'You & Me 💫',
  'Love You Forever', 'My Queen 👑',
  'Made For Each Other', 'My Sunshine ☀️',
  'Endless Love', 'My Heartbeat 💓',
  'Mi Amor 🌹', 'My One & Only'
];

const reasons = [
  "Because your smile makes my whole world light up ✨",
  "Because you understand me like no one else ever could 💜",
  "Because every second with you is my favourite memory 🥰",
  "Because your laugh is the most beautiful sound I've ever heard 🎵",
  "Because you make the ordinary feel extraordinary 🌟",
  "Because you believed in me when I didn't believe in myself 💪",
  "Because you are the reason I look forward to tomorrow 🌅",
  "Because your kindness makes the world a better place 🌍",
  "Because being with you feels like coming home 🏠",
  "Because you are the poem I could never write ✍️"
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Confetti burst
  launchConfetti();

  // 2. Floating texts
  for (let i = 0; i < 8; i++) {
    setTimeout(() => spawnFloatingText(), i * 500);
  }
  setInterval(spawnFloatingText, 1500);

  // 3. Floating emoji hearts
  for (let i = 0; i < 30; i++) createHeart();

  // 4. Scroll reveal for promise cards
  setupScrollReveal();

  // 5. Typewriter
  startTypewriter();

  // 6. Love counter
  startLoveCounter();

  // 7. Music button
  setupMusic();

  // 8. Animate heading letters after entrance
  const h1 = document.querySelector('.v-hero h1');
  if (h1) {
    setTimeout(() => animateElementText(h1), 3500);
  }
});

/* ═══════════════════════════════════════════════
   1. CONFETTI BURST
   ═══════════════════════════════════════════════ */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff2d75', '#c471ed', '#ffd700', '#ff6b9d', '#4ecdc4', '#fff'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: -8 - Math.random() * 12,
      w: 4 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.15 + Math.random() * 0.1,
      opacity: 1,
      decay: 0.003 + Math.random() * 0.005
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.opacity <= 0) return;
      alive = true;
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;
      p.vx *= 0.99;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    if (alive && frame < 300) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/* ═══════════════════════════════════════════════
   2. FLOATING LOVE TEXTS
   ═══════════════════════════════════════════════ */
function spawnFloatingText() {
  const container = document.getElementById('floatingTexts');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = loveTexts[Math.floor(Math.random() * loveTexts.length)];
  el.style.left = (5 + Math.random() * 85) + '%';
  el.style.bottom = '-5%';
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
  el.style.setProperty('--ft-rotate', (-15 + Math.random() * 30) + 'deg');
  el.style.animationDuration = (5 + Math.random() * 7) + 's';
  if (Math.random() > 0.5) el.classList.add('ft-glow');
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ═══════════════════════════════════════════════
   3. SCROLL REVEAL FOR PROMISE CARDS
   ═══════════════════════════════════════════════ */
function setupScrollReveal() {
  const scrollContainer = document.querySelector('.valentine-scroll');
  const cards = document.querySelectorAll('.promise-card');
  if (!scrollContainer || !cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 150);
      }
    });
  }, { root: scrollContainer, threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
}

/* ═══════════════════════════════════════════════
   4. TYPEWRITER EFFECT
   ═══════════════════════════════════════════════ */
function startTypewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;

  let reasonIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTime = 0;

  function tick() {
    const text = reasons[reasonIndex];

    if (pauseTime > 0) {
      pauseTime--;
      setTimeout(tick, 50);
      return;
    }

    if (!isDeleting) {
      charIndex++;
      el.textContent = text.substring(0, charIndex);
      if (charIndex >= text.length) {
        pauseTime = 40; // Pause at full text
        isDeleting = true;
      }
      setTimeout(tick, 40 + Math.random() * 40);
    } else {
      charIndex--;
      el.textContent = text.substring(0, charIndex);
      if (charIndex <= 0) {
        isDeleting = false;
        reasonIndex = (reasonIndex + 1) % reasons.length;
        pauseTime = 10;
      }
      setTimeout(tick, 20);
    }
  }

  // Start after a delay
  setTimeout(tick, 1000);
}

/* ═══════════════════════════════════════════════
   5. LIVE LOVE COUNTER
   ═══════════════════════════════════════════════ */
function startLoveCounter() {
  // Valentine's Day 2026 as the "moment hearts connected"
  const loveStart = new Date('2026-02-14T00:00:00');

  function update() {
    const now = new Date();
    let diff = Math.max(0, now - loveStart);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);

    const dEl = document.getElementById('counterDays');
    const hEl = document.getElementById('counterHours');
    const mEl = document.getElementById('counterMins');
    const sEl = document.getElementById('counterSecs');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
    if (sEl) sEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ═══════════════════════════════════════════════
   6. WEB AUDIO ROMANTIC MELODY
   ═══════════════════════════════════════════════ */
function setupMusic() {
  const btn = document.getElementById('playMusicBtn');
  if (!btn) return;

  let isPlaying = false;
  let audioCtx = null;

  // A romantic melody using Web Audio API
  const melody = [
    // [frequency, duration, delay]
    [523.25, 0.5, 0],    // C5
    [659.25, 0.5, 0.5],  // E5
    [783.99, 0.5, 1.0],  // G5
    [880.00, 0.8, 1.5],  // A5
    [783.99, 0.4, 2.3],  // G5
    [659.25, 0.6, 2.7],  // E5
    [698.46, 0.5, 3.3],  // F5
    [659.25, 0.5, 3.8],  // E5
    [523.25, 0.8, 4.3],  // C5
    [587.33, 0.5, 5.1],  // D5
    [523.25, 0.4, 5.6],  // C5
    [493.88, 0.6, 6.0],  // B4
    [523.25, 1.0, 6.6],  // C5 (held)
    [659.25, 0.5, 7.8],  // E5
    [783.99, 0.5, 8.3],  // G5
    [1046.50, 1.2, 8.8], // C6 (grand finish)
  ];

  btn.addEventListener('click', () => {
    if (isPlaying) return;
    isPlaying = true;
    btn.classList.add('playing');
    btn.textContent = '🎵 Playing...';

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    melody.forEach(([freq, dur, delay]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

      // Gentle envelope
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + dur + 0.1);
    });

    // Reset after melody finishes
    const totalDuration = melody[melody.length - 1][2] + melody[melody.length - 1][1] + 0.5;
    setTimeout(() => {
      isPlaying = false;
      btn.classList.remove('playing');
      btn.textContent = '🎵 Play Our Love Song';
    }, totalDuration * 1000);
  });
}

/* ═══════════════════════════════════════════════
   7. FLOATING EMOJI HEARTS
   ═══════════════════════════════════════════════ */
function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  const emojis = ['❤️', '💖', '💘', '💝', '💓', '💗', '🥰', '🌹', '✨', '💫'];
  heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
  heart.style.left = Math.random() * 100 + '%';
  heart.style.fontSize = (14 + Math.random() * 24) + 'px';
  heart.style.animationDuration = 6 + Math.random() * 6 + 's';
  heart.style.animationDelay = Math.random() * 6 + 's';
  document.body.appendChild(heart);
}

/* ═══════════════════════════════════════════════
   8. PER-LETTER HEADING ANIMATION
   ═══════════════════════════════════════════════ */
function animateElementText(element) {
  const childNodes = [...element.childNodes];
  element.innerHTML = '';

  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.classList.add('letter-animation');
        addClassesAndStyles(span);
        element.appendChild(span);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = node.cloneNode(false);
      wrapper.textContent = '';
      [...node.textContent].forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.classList.add('letter-animation');
        addClassesAndStyles(span);
        wrapper.appendChild(span);
      });
      element.appendChild(wrapper);
    }
  });
}

function addClassesAndStyles(span) {
  const randomAnim = animations[Math.floor(Math.random() * animations.length)];
  span.classList.add(randomAnim);
  span.style.animationDelay = (Math.random() * 2) + 's';
  span.style.animationDuration = (1 + Math.random() * 2) + 's';
}