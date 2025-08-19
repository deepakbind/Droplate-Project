require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(express.json());

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = createClient({ url: REDIS_URL });
client.on('error', (err) => pino.error(err, 'Redis error'));
client.connect().then(() => pino.info('Sink Redis connected'));
//1

const FAIL_MODE = process.env.SINK_FAIL_MODE || '200';

app.post('/sink', async (req, res) => {
  const key = req.header('x-idempotency-key');
  if (!key) return res.status(400).json({ error: 'Missing X-Idempotency-Key' });

  // Simulate failure
  if (FAIL_MODE === '500') {
    return res.status(500).json({ error: 'Simulated failure' });
  }

  const already = await client.set(key, '1', { NX: true, EX: 86400 });
  if (already === null) {
    // duplicate -> swallow and return 200
    return res.status(200).json({ ok: true, duplicate: true });
  }

  pino.info({ headers: req.headers, body: req.body }, 'SINK received');
  res.json({ ok: true });
});

const port = process.env.SINK_PORT || 4000;
app.listen(port, () => pino.info({ port }, 'SINK listening'));
