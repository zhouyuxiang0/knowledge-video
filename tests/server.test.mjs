import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {serve} from '../skills/knowledge-video/scripts/server.mjs';

test('preview serves its root and refuses malformed, escaping and write requests', async () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-video-server-'));
  const root = path.join(work, 'film'), sibling = path.join(work, 'film-private');
  fs.mkdirSync(root); fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(root, 'index.html'), 'preview');
  fs.writeFileSync(path.join(sibling, 'secret.txt'), 'outside');
  fs.symlinkSync(sibling, path.join(root, 'outside'), 'junction');
  const srv = await serve(root);
  try {
    assert.equal(await (await fetch(srv.origin)).text(), 'preview');
    assert.equal(await (await fetch(srv.origin, {method: 'HEAD'})).text(), '');
    for (const [url, status] of [
      ['/%E0%A4%A', 400], ['/%00', 400], ['/missing', 404],
      ['/..%2ffilm-private/secret.txt', 403], ['/outside/secret.txt', 403],
    ]) assert.equal((await fetch(srv.origin + url)).status, status, url);
    assert.equal((await fetch(srv.origin, {method: 'POST', body: 'change'})).status, 405);
    assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), 'preview');
  } finally {
    await new Promise(resolve => srv.server.close(resolve));
    fs.rmSync(work, {recursive: true});
  }
});
