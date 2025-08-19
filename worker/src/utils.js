// import crypto from 'crypto';

// export function makeIdempotencyKey(noteId, releaseAtIso) {
//   return crypto.createHash('sha256').update(`${noteId}:${releaseAtIso}`).digest('hex');
// }


import crypto from 'crypto';

export function makeIdempotencyKey(noteId, releaseAtIso) {
  return crypto.createHash('sha256')
    .update(`${noteId}:${releaseAtIso}`)
    .digest('hex');
}