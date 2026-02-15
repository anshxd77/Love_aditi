/*
 * ai.js — Valentine's AI Features
 *
 * Handles all 6 AI feature sections:
 * 1. Love Letter Generator
 * 2. Love Oracle
 * 3. Infinite Reasons
 * 4. Love Translator
 * 5. Relationship Trivia
 * 6. Cupid's Chatbot
 */

document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initHearts();
    initLoveLetter();
    initOracle();
    initInfiniteReasons();
    initTranslator();
    initTrivia();
    initCupidChat();

    // New AI Features
    initDatePlanner();
    initStoryNarrator();
    initSongWriter();
    initCompatibility();
    initTextEnhancer();
    initMovieScene();
    initFuturePredictor();
    initHoneymoon();
    initLoveChef();
    initVowGenerator();

    // Auto-enable wave effect
    document.body.classList.add('wave-active');

    // Music Player - Now handled by dedicated music-player.js
    // initMusicPlayer();  // DISABLED: Use music-player.js instead
});

/* ═══════════════════════════════════════
   API Helper
   ═══════════════════════════════════════ */

async function aiRequest(endpoint, body) {
    try {
        const res = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        // If response is not OK, try to include server response in the error
        if (!res.ok) {
            let txt = await res.text().catch(() => '');
            // If server returned JSON with an error field, try to parse it
            try {
                const parsed = JSON.parse(txt || '{}');
                if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
                // Not JSON or no error field — fall through
            }
            throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.result;
    } catch (err) {
        console.error(`AI request to ${endpoint} failed:`, err);
        throw err;
    }
}

/* ═══════════════════════════════════════
   Stars & Hearts (background ambiance)
   ═══════════════════════════════════════ */

function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const stars = [];

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5,
            alpha: Math.random(),
            dAlpha: (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1)
        });
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        stars.forEach(s => {
            s.alpha += s.dAlpha;
            if (s.alpha > 1 || s.alpha < 0) s.dAlpha *= -1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.abs(s.alpha)})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function initHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    const emojis = ['❤️', '💖', '💕', '💗', '💘', '✨'];

    function addHeart() {
        const el = document.createElement('span');
        el.className = 'falling-heart';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (0.6 + Math.random() * 1.2) + 'rem';
        el.style.animationDuration = (6 + Math.random() * 6) + 's';
        el.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    for (let i = 0; i < 8; i++) setTimeout(() => addHeart(), i * 400);
    setInterval(addHeart, 2500);
}

/* ═══════════════════════════════════════
   1. LOVE LETTER GENERATOR
   ═══════════════════════════════════════ */

function initLoveLetter() {
    const input = document.getElementById('letterKeywordInput');
    const chipsEl = document.getElementById('keywordChips');
    const btn = document.getElementById('generateLetterBtn');
    const loading = document.getElementById('letterLoading');
    const output = document.getElementById('letterOutput');
    const body = document.getElementById('letterBody');
    if (!input || !btn) return;

    const keywords = [];

    // Chip management
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            e.preventDefault();
            addChip(input.value.trim());
            input.value = '';
        }
    });

    function addChip(text) {
        keywords.push(text);
        const hint = chipsEl.querySelector('.chip-hint');
        if (hint) hint.remove();

        const chip = document.createElement('span');
        chip.className = 'keyword-chip';
        chip.innerHTML = `${text} <span class="chip-remove">✕</span>`;
        chip.querySelector('.chip-remove').addEventListener('click', () => {
            const idx = keywords.indexOf(text);
            if (idx > -1) keywords.splice(idx, 1);
            chip.remove();
            if (keywords.length === 0) {
                chipsEl.innerHTML = '<span class="chip-hint">Type keywords & press Enter ↵</span>';
            }
        });
        chipsEl.appendChild(chip);
    }

    // Generate letter
    btn.addEventListener('click', async () => {
        if (keywords.length === 0) {
            // If no chips, use the input text directly
            const text = input.value.trim();
            if (!text) {
                input.focus();
                input.style.borderColor = 'rgba(255,45,117,0.6)';
                setTimeout(() => input.style.borderColor = '', 1500);
                return;
            }
            addChip(text);
            input.value = '';
        }

        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const result = await aiRequest('love-letter', { keywords: keywords.join(', ') });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            // Typewriter effect
            typewriterEffect(body, result);
        } catch (err) {
            loading.classList.add('hidden');
            body.textContent = '💔 Oops! Could not generate letter. Make sure the API key is set.';
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

const typeWriterTimeouts = new Map();

function typewriterEffect(el, text, speed = 20) {
    // Clear any existing typing interval for this element
    if (typeWriterTimeouts.has(el)) {
        clearTimeout(typeWriterTimeouts.get(el));
    }

    el.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            el.textContent += text[i];
            i++;
            // Store the timeout ID
            const timeoutId = setTimeout(type, speed + Math.random() * 15);
            typeWriterTimeouts.set(el, timeoutId);
        } else {
            typeWriterTimeouts.delete(el);
        }
    }
    type();
}

/* ═══════════════════════════════════════
   2. LOVE ORACLE
   ═══════════════════════════════════════ */

function initOracle() {
    const input = document.getElementById('oracleInput');
    const btn = document.getElementById('oracleBtn');
    const crystalBall = document.getElementById('crystalBall');
    const loading = document.getElementById('oracleLoading');
    const prediction = document.getElementById('oraclePrediction');
    const predText = document.getElementById('predictionText');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const question = input.value.trim() || 'What does our future hold?';

        // Shake crystal ball
        crystalBall.classList.add('shaking');
        setTimeout(() => crystalBall.classList.remove('shaking'), 600);

        btn.disabled = true;
        prediction.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const result = await aiRequest('oracle', { question });
            loading.classList.add('hidden');
            prediction.classList.remove('hidden');
            typewriterEffect(predText, result, 25);
        } catch (err) {
            loading.classList.add('hidden');
            predText.textContent = '🔮 The stars are clouded... Please check your API key and try again.';
            prediction.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

/* ═══════════════════════════════════════
   3. INFINITE REASONS
   ═══════════════════════════════════════ */

function initInfiniteReasons() {
    const reasonText = document.getElementById('reasonText');
    const reasonBtn = document.getElementById('newReasonBtn');
    const counterEl = document.getElementById('reasonCounter');
    const loading = document.getElementById('reasonLoading');
    const autoBtn = document.getElementById('autoReasonBtn');
    const autoIcon = document.getElementById('autoReasonIcon');
    const autoText = document.getElementById('autoReasonText');
    const particlesEl = document.getElementById('reasonParticles');
    if (!reasonBtn) return;

    let count = 0;
    const previousReasons = [];
    let autoInterval = null;

    async function fetchReason() {
        reasonBtn.disabled = true;
        loading.classList.remove('hidden');
        reasonText.classList.add('fade-out');

        try {
            const result = await aiRequest('infinite-reason', {
                previousReasons: previousReasons.slice(-10).join('; ')
            });
            previousReasons.push(result);
            count++;
            counterEl.textContent = count;

            loading.classList.add('hidden');
            reasonText.textContent = result;
            reasonText.classList.remove('fade-out');
            reasonText.classList.add('fade-in');
            setTimeout(() => reasonText.classList.remove('fade-in'), 500);

            // Spawn particles
            spawnReasonParticles(particlesEl);
        } catch (err) {
            loading.classList.add('hidden');
            reasonText.textContent = '💔 Could not think of a reason. Check API key!';
            reasonText.classList.remove('fade-out');
        } finally {
            reasonBtn.disabled = false;
        }
    }

    reasonBtn.addEventListener('click', fetchReason);

    // Auto-play toggle
    autoBtn.addEventListener('click', () => {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
            autoIcon.textContent = '▶';
            autoText.textContent = 'Auto-play';
        } else {
            fetchReason();
            autoInterval = setInterval(fetchReason, 5000);
            autoIcon.textContent = '⏸';
            autoText.textContent = 'Pause';
        }
    });
}

function spawnReasonParticles(container) {
    if (!container) return;
    const emojis = ['✨', '💖', '💕', '⭐', '💫', '🌸'];
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('span');
        p.className = 'reason-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = (20 + Math.random() * 60) + '%';
        p.style.bottom = '10%';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    }
}

/* ═══════════════════════════════════════
   4. LOVE TRANSLATOR
   ═══════════════════════════════════════ */

function initTranslator() {
    const input = document.getElementById('translateInput');
    const btn = document.getElementById('translateBtn');
    const tabs = document.querySelectorAll('.format-tab');
    const loading = document.getElementById('translateLoading');
    const output = document.getElementById('translatorOutput');
    const textEl = document.getElementById('translationText');
    const labelEl = document.getElementById('translationFormatLabel');
    if (!btn) return;

    let activeFormat = 'emoji';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFormat = tab.dataset.format;
        });
    });

    btn.addEventListener('click', async () => {
        const message = input.value.trim() || 'I love you';

        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const result = await aiRequest('translate-love', {
                message,
                format: activeFormat
            });
            loading.classList.add('hidden');
            output.classList.remove('hidden');

            labelEl.textContent = activeFormat.charAt(0).toUpperCase() + activeFormat.slice(1);
            textEl.className = 'translation-text' + (activeFormat === 'code' ? ' code-format' : '');
            typewriterEffect(textEl, result, activeFormat === 'emoji' ? 80 : 15);
        } catch (err) {
            loading.classList.add('hidden');
            textEl.textContent = '🌐 Translation failed. Check API key!';
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

/* ═══════════════════════════════════════
   5. RELATIONSHIP TRIVIA
   ═══════════════════════════════════════ */

function initTrivia() {
    const startScreen = document.getElementById('triviaStart');
    const quizScreen = document.getElementById('triviaQuiz');
    const scoreScreen = document.getElementById('triviaScore');
    const startBtn = document.getElementById('startTriviaBtn');
    const retryBtn = document.getElementById('retryTriviaBtn');
    const loading = document.getElementById('triviaLoading');
    const progressBar = document.getElementById('triviaProgress');
    const progressText = document.getElementById('triviaProgressText');
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl = document.getElementById('triviaOptions');
    const feedbackEl = document.getElementById('triviaFeedback');
    const feedbackIcon = document.getElementById('triviaFeedbackIcon');
    const feedbackText = document.getElementById('triviaFeedbackText');
    const funFactEl = document.getElementById('triviaFunFact');
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (!startBtn) return;

    let questions = [];
    let currentQ = 0;
    let score = 0;

    async function startQuiz() {
        startScreen.classList.add('hidden');
        scoreScreen.classList.add('hidden');
        quizScreen.classList.add('hidden');
        loading.classList.remove('hidden');
        currentQ = 0;
        score = 0;

        try {
            questions = await aiRequest('trivia', {});
            if (!Array.isArray(questions) || questions.length === 0) throw new Error('Invalid quiz data');
            loading.classList.add('hidden');
            quizScreen.classList.remove('hidden');
            showQuestion();
        } catch (err) {
            loading.classList.add('hidden');
            startScreen.classList.remove('hidden');
            alert('Could not generate quiz. Please check your API key!');
        }
    }

    function showQuestion() {
        const q = questions[currentQ];
        feedbackEl.classList.add('hidden');
        progressBar.style.width = ((currentQ + 1) / questions.length * 100) + '%';
        progressText.textContent = `${currentQ + 1} / ${questions.length}`;
        questionEl.textContent = q.q;

        optionsEl.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'trivia-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(btn, opt));
            optionsEl.appendChild(btn);
        });
    }

    function handleAnswer(btn, selectedOpt) {
        const q = questions[currentQ];
        const correct = selectedOpt.startsWith(q.answer + ')') || selectedOpt.startsWith(q.answer + ' ');
        const allBtns = optionsEl.querySelectorAll('.trivia-option');

        allBtns.forEach(b => {
            b.classList.add('disabled');
            const optLetter = b.textContent.trim()[0];
            if (optLetter === q.answer) {
                b.classList.add('correct');
            }
        });

        if (correct) {
            score++;
            btn.classList.add('correct');
            feedbackIcon.textContent = '🎉';
            feedbackText.textContent = 'Correct!';
            feedbackText.style.color = '#4cff8f';
        } else {
            btn.classList.add('wrong');
            feedbackIcon.textContent = '😅';
            feedbackText.textContent = 'Not quite!';
            feedbackText.style.color = '#ff6b6b';
        }

        funFactEl.textContent = q.funFact || '';
        feedbackEl.classList.remove('hidden');
    }

    nextBtn.addEventListener('click', () => {
        currentQ++;
        if (currentQ >= questions.length) {
            showScore();
        } else {
            showQuestion();
        }
    });

    function showScore() {
        quizScreen.classList.add('hidden');
        scoreScreen.classList.remove('hidden');

        const scoreValue = document.getElementById('scoreValue');
        const scoreEmoji = document.getElementById('scoreEmoji');
        const scoreTitle = document.getElementById('scoreTitle');
        const scoreMsg = document.getElementById('scoreMessage');

        scoreValue.textContent = `${score} / ${questions.length}`;

        if (score === questions.length) {
            scoreEmoji.textContent = '🏆';
            scoreTitle.textContent = 'Perfect Score!';
            scoreMsg.textContent = "You're the ultimate love expert! 💕";
        } else if (score >= 3) {
            scoreEmoji.textContent = '🌟';
            scoreTitle.textContent = 'Well Done!';
            scoreMsg.textContent = "You really know your love facts! 💖";
        } else {
            scoreEmoji.textContent = '💝';
            scoreTitle.textContent = 'Nice Try!';
            scoreMsg.textContent = "Love is a journey of discovery! 🌹";
        }

        // Spawn confetti
        spawnConfetti();
    }

    function spawnConfetti() {
        const container = document.getElementById('scoreConfetti');
        if (!container) return;
        container.innerHTML = '';
        const colors = ['#ff2d75', '#ffd700', '#c471ed', '#00d4ff', '#ff6b9d', '#4cff8f'];
        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            piece.style.animationDelay = (Math.random() * 1) + 's';
            piece.style.width = (6 + Math.random() * 6) + 'px';
            piece.style.height = (6 + Math.random() * 6) + 'px';
            container.appendChild(piece);
        }
    }

    startBtn.addEventListener('click', startQuiz);
    retryBtn.addEventListener('click', startQuiz);
}

/* ═══════════════════════════════════════
   6. CUPID'S CHATBOT
   ═══════════════════════════════════════ */

function initCupidChat() {
    const fab = document.getElementById('cupidFab');
    const chat = document.getElementById('cupidChat');
    const closeBtn = document.getElementById('cupidClose');
    const input = document.getElementById('cupidInput');
    const sendBtn = document.getElementById('cupidSendBtn');
    const body = document.getElementById('cupidChatBody');
    const imageInput = document.getElementById('cupidImageInput');
    const imageBtn = document.getElementById('cupidImageBtn');
    const previewArea = document.getElementById('cupidImagePreview');
    const previewImg = document.getElementById('cupidPreviewImg');
    const previewRemove = document.getElementById('cupidPreviewRemove');
    if (!fab) return;

    let isOpen = false;
    const chatHistory = [];
    let pendingImage = null; // base64 data URL

    fab.addEventListener('click', () => {
        isOpen = !isOpen;
        chat.classList.toggle('hidden', !isOpen);
        fab.style.display = isOpen ? 'none' : 'flex';
        if (isOpen) input.focus();
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        chat.classList.add('hidden');
        fab.style.display = 'flex';
    });

    // Image upload handling
    imageBtn.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation: type and size
        if (!file.type || !file.type.startsWith('image/')) {
            alert('Please select an image file');
            imageInput.value = '';
            return;
        }

        const maxBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxBytes) {
            alert('Please select an image under 5MB');
            imageInput.value = '';
            return;
        }

        // Compress & resize the image before converting to base64
        compressImage(file, 800, 0.7).then(dataUrl => {
            pendingImage = dataUrl;
            previewImg.src = pendingImage;
            previewArea.classList.remove('hidden');
            imageBtn.classList.add('has-image');
        }).catch(() => {
            alert('Could not process image. Try a different photo.');
            imageInput.value = '';
        });
    });

    previewRemove.addEventListener('click', () => {
        clearImage();
    });

    function clearImage() {
        pendingImage = null;
        imageInput.value = '';
        previewArea.classList.add('hidden');
        imageBtn.classList.remove('has-image');
    }

    async function sendMessage() {
        const text = input.value.trim();
        const imageToSend = pendingImage;

        if (!text && !imageToSend) return;
        input.value = '';

        // Add user message (with optional image)
        const userMsg = createMessage(text || '📸 [Photo]', 'user', imageToSend);
        body.appendChild(userMsg);

        // Push to history so AI remembers context
        chatHistory.push(`User: ${text || '[Photo]'}`);
        // Dynamic import for Transformers to prevent script blocking
        let pipeline = null;
        let env = null;

        // Tesseract is available globally via script tag in HTML

        async function loadTransformers() {
            try {
                const module = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0');
                pipeline = module.pipeline;
                env = module.env;
                env.allowLocalModels = false;
                env.useBrowserCache = true;
                return true;
            } catch (e) {
                console.error("Transformers failed to load:", e);
                return false;
            }
        }

        let captioner = null;

        // ... (existing code) ...

        // Show typing indicator
        const typingEl = createTypingIndicator();
        body.appendChild(typingEl);
        body.scrollTop = body.scrollHeight;

        try {
            let extractedText = '';
            let imageCaption = '';

            // If image is present, run MULTI-MODAL CLIENT-SIDE ANALYSIS
            if (imageToSend) {
                const scanningMsg = createMessage('Scanning... (OCR + Vision) 🧠', 'cupid');
                body.insertBefore(scanningMsg, typingEl);
                body.scrollTop = body.scrollHeight;

                try {
                    // 1. Run Transformers.js Captioning (Dynamic Load)
                    if (!captioner) {
                        const loaded = await loadTransformers();
                        if (loaded) {
                            scanningMsg.textContent = 'Downloading Vision AI... (First run only) 📥';
                            captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
                            scanningMsg.textContent = 'Vision AI Loaded! Analyzing...';
                        }
                    }

                    if (captioner) {
                        const output = await captioner(imageToSend);
                        imageCaption = output[0]?.generated_text;
                        console.log('Caption Result:', imageCaption);
                    }

                    // 2. Run OCR (Tesseract) with Binarization
                    console.log('Starting OCR...');
                    const img = new Image();
                    img.src = imageToSend;
                    await new Promise(r => img.onload = r);

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width * 2; // Upscale
                    canvas.height = img.height * 2;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Binarization
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const threshold = 100;
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
                        const val = gray > threshold ? 255 : 0;
                        data[i] = data[i + 1] = data[i + 2] = val;
                    }
                    ctx.putImageData(imageData, 0, 0);
                    const processedDataUrl = canvas.toDataURL('image/jpeg');

                    const { data: { text } } = await Tesseract.recognize(processedDataUrl, 'eng', {
                        tessedit_char_whitelist: '0123456789+=x-/*()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!'
                    });
                    console.log('OCR Result:', text);
                    extractedText = text;

                    scanningMsg.textContent = 'Analysis Complete!';
                    setTimeout(() => scanningMsg.remove(), 1000);

                } catch (aiErr) {
                    console.error('Client AI Failed:', aiErr);
                    scanningMsg.textContent = "Scanner glitch... using basic mode.";
                    setTimeout(() => scanningMsg.remove(), 1000);
                }
            }

            const requestBody = {
                message: text || 'What do you think of this photo?',
                history: chatHistory.slice(-10).join('\n')
            };

            // INTELLIGENT ROUTING & GRACEFUL FALLBACK
            if (extractedText || imageCaption) {
                requestBody.image = null;
                requestBody.message += `\n\n[SYSTEM: The user uploaded a photo. Client-Side Analysis:]\n`;
                if (imageCaption) requestBody.message += `Description: "${imageCaption}"\n`;
                if (extractedText) requestBody.message += `Extracted Text: "${extractedText}"\n`;
                requestBody.message += `\nRespond based on this.`;
            } else if (imageToSend) {
                // FALLBACK: If client AI failed completely, DO NOT SEND IMAGE to server (it crashes).
                // Instead, tell Cupid that the image was unreadable.
                requestBody.image = null;
                requestBody.message += `\n\n[SYSTEM: The user uploaded a photo, but the scanner failed to read it. Politely ask them to describe it or type the text.]`;
            }

            const result = await aiRequest('cupid-chat', requestBody);

            typingEl.remove();
            chatHistory.push(`Cupid: ${result}`);

            const cupidMsg = createMessage(result, 'cupid');
            body.appendChild(cupidMsg);
            body.scrollTop = body.scrollHeight;
        } catch (err) {
            typingEl.remove();
            // Surface more helpful error messages to the user when possible
            let msgText = 'Network error! Please check your connection.';
            try {
                const em = (err && err.message) ? String(err.message) : '';
                // Keep message reasonably short for the chat bubble
                if (em && em.length < 1000) msgText = em;
            } catch (e) {
                // ignore
            }
            const errorMsg = createMessage(msgText, 'cupid');
            body.appendChild(errorMsg);
            body.scrollTop = body.scrollHeight;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

/* ═══════════════════════════════════════
   7. UNWRAP INTERACTION & WAVE EFFECT
   ═══════════════════════════════════════ */

// Auto-add wave effect on load
document.body.classList.add('wave-active');


function createMessage(text, type, imageDataUrl) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type === 'cupid' ? 'cupid-msg' : 'user-msg'}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = type === 'cupid' ? '💘' : '🥰';

    const content = document.createElement('div');
    content.className = 'chat-msg-content';

    // Show image if present
    if (imageDataUrl) {
        const img = document.createElement('img');
        img.className = 'chat-msg-image';
        img.src = imageDataUrl;
        img.alt = 'Shared photo';
        content.appendChild(img);
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.textContent = text;
    content.appendChild(bubble);

    msg.appendChild(avatar);
    msg.appendChild(content);
    return msg;
}

function createTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'chat-msg cupid-msg';
    msg.id = 'cupidTyping';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = '💘';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.innerHTML = '<div class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    return msg;
}

/* ═══════════════════════════════════════
   Image Compression Utility
   ═══════════════════════════════════════ */

function compressImage(file, maxSize = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            // Scale down if larger than maxSize
            if (w > maxSize || h > maxSize) {
                if (w > h) {
                    h = Math.round((h * maxSize) / w);
                    w = maxSize;
                } else {
                    w = Math.round((w * maxSize) / h);
                    h = maxSize;
                }
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            // Convert to compressed JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/* ═══════════════════════════════════════
   NEW AI FEATURES IMPLEMENTATION
   ═══════════════════════════════════════ */

// Helper for simple single-input features
function setupGenericFeature(btnId, inputId, endpoint, outputId, loadingId, resultId, promptLabel = "") {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    const loading = document.getElementById(loadingId);
    const result = document.getElementById(resultId);

    if (!btn) return;

    btn.addEventListener('click', async () => {
        const val = input.value.trim();

        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            // dynamic body key based on endpoint usually, but we can standardize or map it
            // Actually, let's map inputId to the body key expected by server
            let body = {};
            // We'll pass the exact body structure in specific init functions instead of generic
        } catch (e) {
            console.error(e);
        }
    });
}

function initDatePlanner() {
    const btn = document.getElementById('dateBtn');
    const loc = document.getElementById('dateLocation');
    const vibe = document.getElementById('dateVibe');
    const output = document.getElementById('dateOutput');
    const result = document.getElementById('dateResult');
    const loading = document.getElementById('dateLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('date-planner', { location: loc.value, vibe: vibe.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initStoryNarrator() {
    const btn = document.getElementById('storyBtn');
    const input = document.getElementById('storyMilestones');
    const output = document.getElementById('storyOutput');
    const result = document.getElementById('storyResult');
    const loading = document.getElementById('storyLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('story-narrator', { milestones: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initSongWriter() {
    const btn = document.getElementById('songBtn');
    const input = document.getElementById('songStyle');
    const output = document.getElementById('songOutput');
    const result = document.getElementById('songResult');
    const loading = document.getElementById('songLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('song-writer', { style: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initCompatibility() {
    const btn = document.getElementById('compBtn');
    const name1 = document.getElementById('compName1');
    const name2 = document.getElementById('compName2');
    const facts = document.getElementById('compFacts');
    const output = document.getElementById('compOutput');
    const result = document.getElementById('compResult');
    const loading = document.getElementById('compLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('compatibility', { name1: name1.value, name2: name2.value, facts: facts.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initTextEnhancer() {
    const btn = document.getElementById('textBtn');
    const input = document.getElementById('textInput');
    const output = document.getElementById('textOutput');
    const result = document.getElementById('textResult');
    const loading = document.getElementById('textLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('text-enhancer', { message: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initMovieScene() {
    const btn = document.getElementById('movieBtn');
    const input = document.getElementById('movieSituation');
    const output = document.getElementById('movieOutput');
    const result = document.getElementById('movieResult');
    const loading = document.getElementById('movieLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('movie-scene', { situation: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initFuturePredictor() {
    const btn = document.getElementById('futureBtn');
    const input = document.getElementById('parentTraits');
    const output = document.getElementById('futureOutput');
    const result = document.getElementById('futureResult');
    const loading = document.getElementById('futureLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('future-predictor', { traits: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initHoneymoon() {
    const btn = document.getElementById('honeymoonBtn');
    const input = document.getElementById('honeymoonVibe');
    const output = document.getElementById('honeymoonOutput');
    const result = document.getElementById('honeymoonResult');
    const loading = document.getElementById('honeymoonLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('honeymoon', { vibe: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initLoveChef() {
    const btn = document.getElementById('chefBtn');
    const input = document.getElementById('chefIngredients');
    const output = document.getElementById('chefOutput');
    const result = document.getElementById('chefResult');
    const loading = document.getElementById('chefLoading');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('love-chef', { ingredients: input.value });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

function initVowGenerator() {
    const btn = document.getElementById('vowBtn');
    const output = document.getElementById('vowOutput');
    const result = document.getElementById('vowResult');
    const loading = document.getElementById('vowLoading');
    const tabs = document.querySelectorAll('#vowTabs .format-tab');
    let tone = 'Romantic';

    if (!btn) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tone = tab.dataset.tone;
        });
    });

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        output.classList.add('hidden');
        loading.classList.remove('hidden');
        try {
            const text = await aiRequest('vow-generator', { tone });
            loading.classList.add('hidden');
            output.classList.remove('hidden');
            typewriterEffect(result, text);
        } catch (e) {
            loading.classList.add('hidden');
            result.textContent = "Error: " + e.message;
            output.classList.remove('hidden');
        } finally {
            btn.disabled = false;
        }
    });
}

/* ═══════════════════════════════════════
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
    window.onYouTubeIframeAPIReady = function () {
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
        if (player && isPlayerReady) { /* Context unlocked */ }
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
window.toggleMusicWidget = function (event) {
    if (event) event.stopPropagation();
    const widget = document.getElementById('musicWidget');
    if (widget) {
        widget.classList.toggle('expanded');
    }
};

/* Prevent closing when clicking controls */
window.playPrevSong = function (event) {
    if (event) event.stopPropagation();
    if (!player) return;
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    player.loadVideoById(musicPlaylist[currentTrackIndex]);
    player.playVideo();
};

window.playNextSong = function (event) {
    if (event) event.stopPropagation();
    if (!player) return;
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    player.loadVideoById(musicPlaylist[currentTrackIndex]);
    player.playVideo();
};

window.togglePlay = function (event) {
    if (event) event.stopPropagation();
    if (!player || !isPlayerReady) return;
    isMusicPlaying ? player.pauseVideo() : player.playVideo();
};

function updateAlbumArt(videoId = null) {
    const vid = videoId || (player && player.getVideoData ? player.getVideoData().video_id : musicPlaylist[currentTrackIndex]);
    if (vid) {
        const url = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
        const art = document.getElementById('albumArt');
        if (art) art.style.backgroundImage = `url('${url}')`;
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
        if (data && data.title) {
            const titleEl = document.getElementById('largeSongTitle'); // Keep for safety
            const miniEl = document.getElementById('miniSongTitle');

            if (titleEl) titleEl.textContent = data.title;

            if (miniEl) {
                // Get first 2 words
                const words = data.title.split(' ').slice(0, 2).join(' ');
                miniEl.textContent = words;
            }

            // Also update album art if changed
            updateAlbumArt(data.video_id);
        }

    } else if (event.data === YT.PlayerState.PAUSED) {
        isMusicPlaying = false;
        updateUIState(false);
        stopProgressLoop();
    }
}

function onPlayerError() { window.playNextSong(); }

/* ─── Playback Logic (Shuffle/Repeat) ─── */
let isShuffle = false;
let isRepeat = false;

window.toggleShuffle = function (event) {
    if (event) event.stopPropagation();
    isShuffle = !isShuffle;
    const btn = event.currentTarget;
    if (isShuffle) {
        btn.style.color = "#ff007a";
        shufflePlaylist();
    } else {
        btn.style.color = "#888";
        // Reset to default (mock reset)
        musicPlaylist = [...defaultTracks];
    }
};

window.toggleRepeat = function (event) {
    if (event) event.stopPropagation();
    isRepeat = !isRepeat;
    const btn = event.currentTarget;
    btn.style.color = isRepeat ? "#ff007a" : "#888";
};

// Update Next Song Logic for Loop
window.playNextSong = function (event) {
    if (event) event.stopPropagation();
    if (!player) return;

    if (isRepeat) {
        // Just replay current
        player.seekTo(0);
        player.playVideo();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
        player.loadVideoById(musicPlaylist[currentTrackIndex]);
        player.playVideo();
    }
};


function updateUIState(playing) {
    const btn = document.getElementById('largePlayBtn');
    if (btn) btn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';

    // Toggle Waveform Animation
    const widget = document.getElementById('musicWidget');
    if (widget) {
        if (playing) widget.classList.add('playing');
        else widget.classList.remove('playing');
    }
}

/* ─── Waveform Click Seek (Optional) ─── */
window.seekTrack = function (event) {
    if (!player || !isMusicPlaying) return;
    const bar = document.getElementById('progressContainer');
    if (bar) {
        const rect = bar.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;
        const pct = x / width;
        const dur = player.getDuration();
        player.seekTo(pct * dur);
    }
};

window.seekRelative = function (seconds, event) {
    if (event) event.stopPropagation();
    if (!player || !isMusicPlaying) return;
    const current = player.getCurrentTime();
    player.seekTo(current + seconds);
};

/* ─── Progress Bar ─── */
function startProgressLoop() {
    stopProgressLoop();
    progressInterval = setInterval(() => {
        if (!player || !isMusicPlaying) return;
        const current = player.getCurrentTime();
        const total = player.getDuration();
        if (total > 0) {
            const pct = (current / total) * 100;
            const bar = document.getElementById('progressBar');
            if (bar) bar.style.width = `${pct}%`;
        }
    }, 1000);
}

function stopProgressLoop() {
    if (progressInterval) clearInterval(progressInterval);
}

/* ─── Voice Engine (Continuous & Manual) ─── */
let isManualListening = false;
let wasPlayingBeforeManual = false;

function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // We handle restart manually

    // Visual Feedback
    recognition.onstart = () => {
        const status = document.getElementById('modalVoiceStatus');
        const btn = document.getElementById('manualVoiceBtn');
        if (status) status.style.color = "#ff007a";
        if (btn) btn.classList.add('active');
    };

    recognition.onend = () => {
        const status = document.getElementById('modalVoiceStatus');
        const btn = document.getElementById('manualVoiceBtn');
        if (status) {
            status.style.color = "rgba(255,255,255,0.6)";
            status.textContent = '';
        }
        if (btn) btn.classList.remove('active');

        // Always restart recognition to keep "Hey Cupid" active
        // If manual mode just finished, we reset the flag but STILL restart
        if (isManualListening) {
            isManualListening = false;
            // Resume music if it was playing and we didn't just pause it via command
            if (wasPlayingBeforeManual && isMusicPlaying) {
                // Checks if player state logic handles this, or force resume
                // logic here is tricky vs player state. 
                // Simply: if we stopped listening, we go back to background mode.
                // Music resume is handled by 'resume' command, or if user cancelled.
                // If user just spoke a command, that command determines play state.
                // If silence/timeout, maybe resume?
                // For now, let's just ensure recognition restarts.
            }
        }

        try { recognition.start(); } catch (e) { }
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voice:", transcript);

        // Manual Mode: Bypass wake word
        if (isManualListening) {
            // Stop listening immediately after getting a result in manual mode
            // to process the command and then loop back to onend -> restart background
            try { recognition.stop(); } catch (e) { }
            await handleVoiceCommand(transcript, true);
        }
        // Auto Mode: Require wake word
        else if (/cupid|baby|jaan|hello|sunao/.test(transcript)) {
            handleVoiceCommand(transcript, false);
        }
    };

    // Start background listener immediately
    try { recognition.start(); } catch (e) { }
}

/* ─── Auto Play Random Song on Load ─── */
// (This function was moved to end of file, removing duplicate definition here to avoid conflict)
// See bottom of file for playRandomSongOnLoad implementation.

window.startManualVoiceControl = function (event) {
    if (event) event.stopPropagation();
    if (!recognition) return;

    // Toggle active state for mic button only
    const btn = document.getElementById('manualVoiceBtn');
    if (btn && btn.classList.contains('active')) {
        // If already active, stop listening
        recognition.stop();
        return;
    }

    // ... rest of logic handled by initVoiceRecognition ...

    // Stop current background session
    try { recognition.stop(); } catch (e) { }

    isManualListening = true;
    wasPlayingBeforeManual = isMusicPlaying;

    // Pause Music
    if (isMusicPlaying && player && player.pauseVideo) {
        player.pauseVideo();
    }

    const status = document.getElementById('modalVoiceStatus');
    // if(status) status.textContent = "Listening..."; 

    // Small delay to ensure stop() processed
    setTimeout(() => {
        try { recognition.start(); } catch (e) { }
    }, 100);
};

async function handleVoiceCommand(text, isManual) {
    const status = document.getElementById('modalVoiceStatus');
    if (status) {
        status.textContent = `🎤 "${text}"`;
        // Only clear if not manual interaction flow
        if (!isManual) setTimeout(() => status.textContent = 'Tap mic or say "Hey Cupid"', 3000);
    }

    let cmd = text;
    ['hey cupid', 'okay cupid', 'ansh baby', 'baby', 'jaan', 'cupid', 'sunao', 'please'].forEach(p => {
        if (cmd.startsWith(p)) cmd = cmd.substring(p.length).trim();
    });

    if (cmd.match(/next|skip/)) return playNextSong();
    if (cmd.match(/stop|pause|ruko/)) {
        if (player && player.pauseVideo) player.pauseVideo();
        return;
    }
    if (cmd.match(/resume|start|play$/)) {
        if (player && player.playVideo) player.playVideo();
        return;
    }
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
    if (status) status.textContent = `🔎 Searching ${query}...`;

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
            if (status) status.textContent = "Song not found 😕";
        }
    } catch (e) {
        console.error(e);
        if (status) status.textContent = "Search Error ❌";
    }
}

/* 
   (Deprecated Helpers Removed)
*/

/* Music Player Concept Removed */
