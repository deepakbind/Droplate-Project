require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { z } = require('zod');
const Note = require('./models/note');

const app = express();
app.use(cors());
app.use(express.json());

// Simple token auth
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme';
function auth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Rate limit 60/min/IP
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true });
app.use(limiter);

// Mongo connect
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater';
mongoose.connect(MONGO_URL).then(() => pino.info('Mongo connected')).catch(err => {
  pino.error(err, 'Mongo connection error'); process.exit(1);
});

// Validation schemas
const noteInput = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  releaseAt: z.string().datetime(),
  webhookUrl: z.string().url()
});

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/notes', auth, async (req, res) => {
  const parse = noteInput.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload', details: parse.error.issues });
  try {
    const { title, body, releaseAt, webhookUrl } = parse.data;
    const note = await Note.create({
      title, body, webhookUrl,
      releaseAt: new Date(releaseAt),
      status: 'pending'
    });
    return res.status(201).json({ id: note._id });
  } catch (e) {
    pino.error(e);
    return res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes', auth, async (req, res) => {
  const status = req.query.status;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const PAGE_SIZE = 20;
  const q = {};
  if (status) q.status = status;
  const total = await Note.countDocuments(q);
  const notes = await Note.find(q).sort({ createdAt: -1 }).skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE).lean();
  const data = notes.map(n => ({
    id: n._id,
    title: n.title,
    status: n.status,
    lastAttemptCode: n.attempts?.length ? n.attempts[n.attempts.length-1].statusCode : null,
    releaseAt: n.releaseAt,
    deliveredAt: n.deliveredAt
  }));
  res.json({ page, total, pageSize: PAGE_SIZE, data });
});

app.post('/api/notes/:id/replay', auth, async (req, res) => {
  const id = req.params.id;
  const note = await Note.findById(id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  if (!['failed', 'dead'].includes(note.status)) {
    return res.status(400).json({ error: 'Only failed/dead notes can be replayed' });
  }
  note.status = 'pending';
  note.deliveredAt = null;
  note.releaseAt = new Date(); // schedule now
  await note.save();
  res.json({ ok: true });
});

const port = process.env.API_PORT || 3000;
app.listen(port, () => pino.info({ port }, 'API listening'));
