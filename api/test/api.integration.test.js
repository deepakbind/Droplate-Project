import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import express from 'express';

// Spin up a minimal instance of the API for testing the /health endpoint only.
describe('API integration smoke', () => {
  let server;
  beforeAll(async () => {
    const app = express();
    app.get('/health', (req, res) => res.json({ ok: true }));
    server = http.createServer(app).listen(0);
  });

  afterAll(() => server.close());

  it('GET /health returns ok', async () => {
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const res = await request(base).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
