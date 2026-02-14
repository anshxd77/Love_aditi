/*
 * server.js
 *
 * A small Express server used to host the Valentine’s Day website. The server
 * exposes a single endpoint for handling photo uploads using multer and
 * serves all static assets from the `public` directory. Any uploaded
 * photographs are stored in the `uploads` directory and made available
 * at `/uploads/<filename>` so they can be easily referenced by the front‑end.
 *
 * See Express documentation for more details on using static middleware and
 * the multer README for file upload specifics【733153657844934†L88-L136】.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer storage to save uploaded files into the `uploads` folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    // generate a unique filename using the current timestamp and a random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve static files from the `public` directory
app.use(express.static(path.join(__dirname, 'public')));
// Expose uploaded files so the browser can load them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST /upload
// Handles a single file upload with the form field name `photo`. Multer
// attaches the uploaded file to `req.file`【733153657844934†L115-L133】.
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    console.error('No file received');
    return res.status(400).json({ success: false, message: 'No file provided' });
  }
  console.log('File uploaded:', req.file.filename);

  // Respond with a JSON payload containing the relative URL to the uploaded file
  res.json({ success: true, filePath: `/uploads/${req.file.filename}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Valentine server running on http://localhost:${PORT}`);
});