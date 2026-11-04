// Technical fixture only: exercises the current export protocol without downloading assets or models.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {renderFrames, grabStill} from '../skills/knowledge-video/scripts/capture.mjs';
import {serve} from '../skills/knowledge-video/scripts/server.mjs';

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-video-render-'));
const ffmpeg = args => execFileSync('ffmpeg', ['-v', 'error', ...args], {stdio: 'pipe'});
const html = broken => `<!doctype html><style>body{margin:0}</style><canvas width="320" height="180"></canvas><script>
const c=document.querySelector('canvas'),g=c.getContext('2d');
window.__render={total:1,seek(t){
  if(${broken}&&t>.15){window.__error='fixture render failure';return;}
  g.fillStyle='#123';g.fillRect(0,0,320,180);g.fillStyle='#edb';g.fillRect(20+t*240,70,40,40);
}};window.__render.seek(0);window.__ready=true;
</script>`;
let srv;
try {
  fs.writeFileSync(path.join(work, 'index.html'), html(false));
  fs.writeFileSync(path.join(work, 'broken.html'), html(true));
  const audio = path.join(work, 'tone.wav');
  ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=1:sample_rate=48000', audio]);
  const short = path.join(work, 'short.wav');
  ffmpeg(['-i', audio, '-t', '0.2', short]);
  srv = await serve(work);
  const options = {url: srv.origin, total: 1, fps: 30, width: 320, height: 180, audio, preset: 'ultrafast'};
  const out = path.join(work, 'sample.mp4');
  const result = await renderFrames({...options, out});
  assert.equal(result.frames, 30);
  ffmpeg(['-xerror', '-i', out, '-f', 'null', '-']);
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', out], {encoding: 'utf8'}));
  const v = probe.streams.find(s => s.codec_type === 'video'), a = probe.streams.find(s => s.codec_type === 'audio');
  assert.equal(v.nb_frames, '30'); assert.equal(v.width, 320); assert.equal(v.height, 180);
  assert(Math.abs(Number(v.duration) - 1) < .034 && Math.abs(Number(a.duration) - 1) < .04);
  const accepted = fs.readFileSync(out);
  await assert.rejects(renderFrames({...options, out}), /already exists/);
  assert.deepEqual(fs.readFileSync(out), accepted);
  await assert.rejects(renderFrames({...options, total: 2, audio: null, out: path.join(work, 'mismatch.mp4')}), /duration/);
  await assert.rejects(renderFrames({...options, audio: short, out: path.join(work, 'short.mp4')}), /shorter/);
  await assert.rejects(renderFrames({...options, url: srv.origin + '/broken.html', out: path.join(work, 'broken.mp4')}), /fixture render failure/);
  await assert.rejects(renderFrames({...options, preset: 'invalid-fixture-preset', out: path.join(work, 'encoder-failed.mp4')}));
  for (const [name, t] of [['a', .2], ['b', .8], ['a-again', .2]]) {
    await grabStill({...options, t, out: path.join(work, name + '.png')});
  }
  const still = fs.readFileSync(path.join(work, 'a.png'));
  assert.deepEqual(still, fs.readFileSync(path.join(work, 'a-again.png')));
  assert.notDeepEqual(still, fs.readFileSync(path.join(work, 'b.png')));
  await assert.rejects(grabStill({...options, out: path.join(work, 'a.png')}), /already exists/);
  console.log('PASS: actual video/audio export, repeatable stills, output preservation, short audio, page and encoder errors');
} finally {
  if (srv) await new Promise(resolve => srv.server.close(resolve));
  fs.rmSync(work, {recursive: true});
}
