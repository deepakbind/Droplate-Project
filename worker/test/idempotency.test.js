import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

function makeIdempotencyKey(noteId, releaseAtIso) {
  return crypto.createHash('sha256').update(`${noteId}:${releaseAtIso}`).digest('hex');
}
// crypto
describe('makeIdempotencyKey', () => {
  it('produces a stable sha256 for noteId+releaseAt', () => {
    const key = makeIdempotencyKey('64f0c6f', '2020-01-01T00:00:10.000Z');
    expect(key).toBe('1d6f0156a7384b6af6f809a0d7571b4d1e65a92789b1f92ab42016e38d9eb0a9');
  });
});
