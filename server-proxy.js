const express = require('express');
const app = express();

// Use dynamic import for fetch to support older Node versions
const fetchFn = (...args) => import('node-fetch').then(m => m.default(...args));

const PORT = process.env.PORT || 3001;
const KEY = process.env.YT_API_KEY;

// Simple CORS for local testing — in production restrict origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/yt-search', async (req, res) => {
  const q = req.query.q || '';
  if (!KEY) return res.status(500).json({ error: 'YT_API_KEY not configured on server' });
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(q)}&key=${KEY}`;
  try {
    const r = await fetchFn(url);
    const json = await r.json();
    res.json(json);
  } catch (err) {
    console.error('YT proxy error', err);
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`YouTube proxy listening on http://localhost:${PORT}`));
