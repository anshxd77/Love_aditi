const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON body parser — 20MB limit to support image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Serve static files from the `public` directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files from the `uploads` directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ═══════════════════════════════════════
   Groq AI Helper (Free, fast, generous limits)
   ═══════════════════════════════════════ */

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing from environment variables!");
    return null;
  }
  // Log mask to confirm key is loaded
  console.log(`✅ Groq Client initialized with key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);
  return new Groq({ apiKey });
}

async function generate(systemPrompt, userMessage, retries = 3) {
  const client = getGroqClient();

  if (!client) {
    throw new Error("GROQ_API_KEY is missing. Server cannot generate content.");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 1024,
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error(`Groq API Error (Attempt ${attempt}):`, err.message);

      const isRateLimit = err.status === 429 || (err.message && (err.message.includes('429') || err.message.includes('rate_limit')));
      if (isRateLimit && attempt < retries) {
        const delay = attempt * 2000;
        console.log(`Rate limited, retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        // If final attempt or not rate limit, throw actual error
        if (attempt === retries) throw err;
      }
    }
  }
}

/* ═══════════════════════════════════════
   API Endpoints
   ═══════════════════════════════════════ */

// 1. Love Letter Generator
app.post('/api/love-letter', async (req, res) => {
  try {
    const { keywords } = req.body;
    const text = await generate(
      `You are a world-class romantic poet. The user will give you a few keywords or themes about their relationship. Write a breathtaking, heartfelt love letter or poem (8-12 lines) using those themes. Use vivid imagery, metaphors, and deep emotion. The letter is from Ansh to Aditi. Write in a mix of English and Hindi (Hinglish) if keywords are in Hindi, otherwise in beautiful English. Do NOT use any markdown formatting. Just plain romantic text with line breaks.`,
      `Keywords/themes: ${keywords || 'love, forever, stars'}`
    );
    res.json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Cupid's Chatbot (Hybrid: Groq for Text, Gemini for Vision)
app.post('/api/cupid-chat', async (req, res) => {
  try {
    const { message, history, image } = req.body;

    const systemPrompt = `You are Cupid 💘 — the playful, witty, and incredibly romantic god of love.
    
    YOUR GOAL: Chat with the user, be charming, and help them with queries.
    
    RULES:
    1. If the user asks for **Love Advice**, be poetic and wise.
    2. If the user asks a **Math Problem** or **General Question**, SOLVE IT CORRECTLY. Do not just make jokes. Solve the math step-by-step, then add a flirty twist at the end (e.g., "The answer is 5, just like the 5 senses I lost looking at you!").
    3. **IMAGE ANALYSIS**: You may receive a description of an image or extracted text.
       - If the text is **jumbled, random letters, or makes no sense**, DO NOT pretend it is a "puzzle" or "secret code".
       - Instead, say: "Oops! My eyes are a bit blurry today and I can't read those numbers clearly. 😓 Could you **type the math problem** for me? I'll solve it instantly!"
       - Do NOT hallucinate meanings from garbage text.
    4. Keep responses valid HTML (use <br> for breaks).
    
    TONE: Flirty, helpful, divine, emoji-rich.`;

    /* ═══════════════════════════════════════
       Simpler Logic: Client-side AI does the heavy lifting (OCR/Captioning).
       Server just takes the text and sends it to Groq. 
       No more server-side Hugging Face fallback.
       ═══════════════════════════════════════ */

    const finalMessage = image
      ? `${message}\n\n[System Note: The user attached an image, but it should have been processed by the client. If you see this, treating it as text-only context.]`
      : `${history ? 'Previous chat:\n' + history + '\n\n' : ''}User says: ${message}`;

    const text = await generate(systemPrompt, finalMessage);
    res.json({ result: text });

  } catch (err) {
    console.error('Cupid Chat Error:', err);
    if (err.response) console.error('Groq Error:', JSON.stringify(err.response, null, 2));
    res.status(500).json({ error: err.message });
  }
});

// 3. Infinite "Reasons I Love You"
app.post('/api/infinite-reason', async (req, res) => {
  try {
    const { previousReasons } = req.body;
    const text = await generate(
      `You generate unique, sweet, specific "reasons I love you" from Ansh to Aditi.Each reason should be personal - feeling, warm, and varied — some funny, some deep, some quirky.Output ONLY the reason text(one single reason, no numbering, no quotes).Keep it under 15 words.Add one relevant emoji at the end.Do NOT repeat any of the previous reasons provided.Do NOT use any markdown formatting.`,
      `Previous reasons(don't repeat these): ${previousReasons || 'none yet'}\n\nGenerate one new unique reason:`
    );
    res.json({ result: text.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Love Oracle
app.post('/api/oracle', async (req, res) => {
  try {
    const { question } = req.body;
    const text = await generate(
      `You are a mystical Love Oracle 🔮 — ancient, wise, and deeply romantic. You speak in a poetic, prophetic tone with cosmic metaphors. The user will ask a question about their love life (Ansh & Aditi's relationship). Give a beautiful, positive, mystical prediction in 3-5 sentences. Use celestial imagery (stars, moons, universe). Always be optimistic and romantic. Add relevant emojis. Do NOT use any markdown formatting.`,
      `The lovers seek your wisdom. Their question: "${question || 'What does our future hold?'}"`
    );
    res.json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Love Translator
app.post('/api/translate-love', async (req, res) => {
  try {
    const { message, format } = req.body;
    const formatPrompts = {
      emoji: 'Translate the message using ONLY emojis. Use a creative sequence of emojis that tells the story of the message. Use 8-15 emojis.',
      code: 'Translate the message into a short, cute code snippet (JavaScript or Python). Make it clever and romantic. Use variable names and comments that express the love.',
      poetry: 'Rewrite the message as a 4-line romantic poem with rhyming couplets. Use vivid imagery and metaphors.',
      shakespeare: 'Rewrite the message in dramatic Shakespearean English. Use "thou", "doth", "wherefore" etc. Make it theatrical and romantic.',
      shayari: 'Rewrite the message as a beautiful 2-line Hindi/Urdu shayari. Use Devanagari script with a romanized version below it.'
    };
    const text = await generate(
      `You are a creative Love Translator. ${formatPrompts[format] || formatPrompts.poetry} Output ONLY the translation, nothing else. Do NOT use any markdown formatting or code block markers.`,
      `Translate this love message: "${message || 'I love you'}"`
    );
    res.json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Relationship Trivia
app.post('/api/trivia', async (req, res) => {
  try {
    const { facts } = req.body;
    const text = await generate(
      `You create fun romantic relationship trivia questions. Generate exactly 5 multiple-choice questions about love, romance, and relationships. Mix general love trivia with Valentine's Day facts. Each question should have 4 options (A, B, C, D) with one correct answer.
      
      IMPORTANT: Generate completely NEW and RANDOM questions every time. Do not repeat common questions.
      
      Output in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
      [{"q":"question text","options":["A) option","B) option","C) option","D) option"],"answer":"A","funFact":"a cute fun fact about the answer"}]

      Topics to include: famous love stories, romantic traditions around the world, Valentine's Day history, romantic movies, love in nature. Make questions fun, not too hard. ${facts ? 'Include references to: ' + facts : ''}`,
      `Generate 5 unique and fun love trivia questions (Random Seed: ${Math.random()})`
    );
    // Try to parse the JSON from the response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleaned);
    res.json({ result: questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Date Night Planner
app.post('/api/date-planner', async (req, res) => {
  try {
    const { location, vibe } = req.body;
    const text = await generate(
      `You are a romantic event planner. Create a perfect date night itinerary.
      Output format: 
      - Title: [Creative Date Name]
      - 3-4 Timeline Steps (e.g., 7:00 PM: [Activity])
      - What to wear: [Outfit suggestion]
      - Vibe check: [1 sentence summary]
      Keep it fun, specific to the location, and romantic. No markdown formatting.`,
      `Location: ${location || 'Home'}, Vibe: ${vibe || 'Cozy'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Our Story Narrator
app.post('/api/story-narrator', async (req, res) => {
  try {
    const { milestones } = req.body;
    const text = await generate(
      `You are a fairytale storyteller. Write a short, magical story (150 words) about Ansh and Aditi based on their milestones. Start with "Once upon a time...". Make it whimsical and sweet.`,
      `Milestones: ${milestones || 'Met at coffee shop, First date at beach, Fell in love under stars'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Love Song Writer
app.post('/api/song-writer', async (req, res) => {
  try {
    const { style } = req.body;
    const text = await generate(
      `You are a grammy-winning songwriter. Write a short song chorus and one verse (8-12 lines total) dedicated to Aditi from Ansh. Match the requested music style.`,
      `Music Style: ${style || 'Acoustic Ballad'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. Soulmate Compatibility
app.post('/api/compatibility', async (req, res) => {
  try {
    const { name1, name2, facts } = req.body;
    const text = await generate(
      `You are a "Love Scientist". Generate a funny, cute, and "highly scientific" compatibility report for ${name1} and ${name2}. 
      Include:
      - Compatibility Score (always 100% or more)
      - "Scientific" Reason (make it funny/sweet based on facts)
      - A "Power Couple" title.`,
      `Names: ${name1} & ${name2}. Facts: ${facts || 'Loves pizza'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 11. Text Enhancer
app.post('/api/text-enhancer', async (req, res) => {
  try {
    const { message } = req.body;
    const text = await generate(
      `You are a communication expert. Rewrite the user's text message into 3 versions:
      1. Sweet 🍬 (Romantic and soft)
      2. Dramatic 🌹 (Shakespearean/Soap Opera intensity)
      3. Funny 😂 (Witty and playful)
      Label each version clearly.`,
      `Original text: "${message || 'I miss you'}"`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 12. Movie Scene Re-enactor
app.post('/api/movie-scene', async (req, res) => {
  try {
    const { situation } = req.body;
    const text = await generate(
      `Write a dramatic, Hollywood-style movie script scene for Ansh and Aditi based on a mundane situation. Include stage directions, dramatic dialogue, and a romantic twist. Keep it short (150 words).`,
      `Situation: ${situation || 'Doing laundry together'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 13. Future Baby/Pet Predictor
app.post('/api/future-predictor', async (req, res) => {
  try {
    const { traits } = req.body;
    const text = await generate(
      `Predict the personality of Ansh and Aditi's future child or pet based on their traits. 
      Output:
      - Name suggestion
      - Personality summary (funny/cute mix of parents' traits)
      - Likely future career/hobby
      Make it lighthearted and fun.`,
      `Parent Traits: ${traits || 'Stubborn but kind, Loves music'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 14. Dream Honeymoon
app.post('/api/honeymoon', async (req, res) => {
  try {
    const { vibe } = req.body;
    const text = await generate(
      `Invent a completely fictional, magical honeymoon destination. Describe the scenery, the unique romantic activities (e.g., "Dining on cloud 9"), and why it fits the vibe. Use vivid, dreamy language.`,
      `Vibe: ${vibe || 'Magical Forest'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 15. Love Chef
app.post('/api/love-chef', async (req, res) => {
  try {
    const { ingredients } = req.body;
    const text = await generate(
      `Create a fancy, romantic dinner dish name and short description using only the provided ingredients. Make it sound gourmet and expensive, even if the ingredients are basic. Add a "Chef's Kiss" tip at the end.`,
      `Ingredients: ${ingredients || 'Maggi, Cheese, Ketchup'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 16. Vow Generator
app.post('/api/vow-generator', async (req, res) => {
  try {
    const { tone } = req.body;
    const text = await generate(
      `Write a set of personalized wedding vows from Ansh to Aditi.
      Tone: ${tone}.
      Include promises that are specific, maybe one funny one, and deeply emotional ones. Max 150 words.`,
      `Tone: ${tone || 'Romantic & Emotional'}`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 18. Cupid's Quest
app.post('/api/cupid-quest', async (req, res) => {
  console.log('🏹 Cupid Quest request received:', req.body);
  try {
    const { context, choice } = req.body;
    const text = await generate(
      `You are a romantic dungeon master for a choose-your-own-adventure game for Ansh and Aditi. 
      The story so far: ${context || 'Just starting.'}
      Aditi chose: ${choice}
      
      Continue the story in a magical, romantic, and slightly adventurous way (3-4 sentences). 
      THEN, provide exactly 2-3 romantic or fun choices for the next branch.
      
      FORMAT: [Choice 1] [Choice 2] [Choice 3]
      Example: You both land on a cloud made of cotton candy. [Eat the cloud] [Jump to the moon]
      `,
      `What happens next?`
    );
    res.json({ result: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 17. Music Search (simulated)
app.post('/api/music-search', async (req, res) => {
  try {
    const { query } = req.body;
    // Simple heuristic: Use the Google Generative AI or Groq to "predict" the video ID? 
    // No, that's unreliable. 
    // Better: Use a reliable lightweight search scraper or just return the query for client-side search?
    // Client-side search is hard without API key.
    // Server-side scrape is best option without API key.

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' song audio')}`;
    const response = await fetch(searchUrl);
    const html = await response.text();

    // Extract first video ID from HTML
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (videoIdMatch && videoIdMatch[1]) {
      res.json({ result: videoIdMatch[1] });
    } else {
      // Fallback: If scraping fails, maybe return a known "Rick Roll" or error
      throw new Error("Could not find song on YouTube.");
    }
  } catch (err) {
    console.error("Music Search Error:", err.message);
    res.status(500).json({ error: "Could not search music." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Valentine server running on http://localhost:${PORT}`);
});

// Export for Vercel serverless
module.exports = app;