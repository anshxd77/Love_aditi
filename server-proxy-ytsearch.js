const express = require('express');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/yt-search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'missing query parameter q' });
  try {
    const r = await yts(q);
    const videos = (r && r.videos) || [];
    const results = videos.map(v => ({
      id: v.videoId,
      title: v.title,
      url: v.url,
      seconds: v.seconds,
      author: v.author && v.author.name,
      thumbnail: v.image
    }));

    // Return a YouTube Data API-like shape so the client can consume it without changes
    const items = results.map(r => ({
      id: { videoId: r.id },
      snippet: { title: r.title, channelTitle: r.author }
    }));
    res.json({ query: q, results, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`YT search proxy (no-key) listening on http://localhost:${port}`));
