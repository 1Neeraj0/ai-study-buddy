const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

const normalizeOrigin = (origin) => origin ? origin.replace(/\/$/, '') : origin;

const allowedOrigins = process.env.FRONTEND_URL
  ? ['http://localhost:4200', ...process.env.FRONTEND_URL.split(',').map((u) => normalizeOrigin(u.trim()))]
  : ['https://ai-study-buddy-frontend-kohl.vercel.app'];

app.use(cors({
  origin: (origin, cb) => {
    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin || allowedOrigins.some((o) => o === normalizedOrigin)) {
      return cb(null, true);
    }
    cb(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
