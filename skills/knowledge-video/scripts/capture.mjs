import { chromium } from 'playwright-core';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import assert from 'node:assert/strict';

/**
 * 逐帧抓图并直接管道进 ffmpeg，不落中间帧文件。
 * 每帧：seek(t) -> CDP Page.captureScreenshot(jpeg) -> ffmpeg stdin
 */
export async function renderFrames({
  url, total, fps = 30, out, width = 1080, height = 1920,
  quality = 93, crf = 18, preset = 'medium', fast = false, onProgress, headful = false,
  audio = null,
}) {
  assert(Number.isFinite(total) && total > 0 && Number.isFinite(fps) && fps > 0, 'Invalid duration or frame rate');
  assert([width, height].every(n => Number.isInteger(n) && n > 0 && n % 2 === 0), 'H.264 dimensions must be positive even integers');
  assert(!fs.existsSync(out), 'Output already exists; choose a new path');
  const frames = Math.round(total * fps);
  assert(frames > 0, 'Duration produces no frames');
  if (audio) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=duration:format=duration', '-of', 'json', audio], {encoding: 'utf8'}));
    const duration = Number(probe.streams?.[0]?.duration ?? probe.format?.duration);
    assert(probe.streams?.length && Number.isFinite(duration) && duration + 0.001 >= frames / fps, 'Audio is shorter than the video; prepare the mix first');
  }
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: !headful,
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--hide-scrollbars', '--mute-audio', '--font-render-hinting=none'],
  });
  let ff, ffDone;

  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    let pageError;
    page.on('pageerror', error => { pageError = error; });
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 60000 });
    const err = await page.evaluate(() => window.__error || null);
    if (err) throw new Error('页面渲染报错:\n' + err);

    const reported = await page.evaluate(() => window.__render.total);
    assert(Number.isFinite(reported) && Math.abs(reported - total) < 0.001, 'Page duration does not match requested duration');

    const cdp = await page.context().newCDPSession(page);

    // format=yuv420p 输出的是有限范围（16-235）的 YUV。
    // 但 videotoolbox 会把它标成 yuvj420p（全范围），平台按全范围解读就会发灰。
    // 所以这里把色彩标签显式钉死。
    const vf = ['format=yuv420p'];
    const color = ['-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];
    const enc = fast
      ? ['-c:v', 'h264_videotoolbox', '-b:v', '12M', '-allow_sw', '1', ...color]
      : ['-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-profile:v', 'high', '-level', '4.2', ...color];

    const args = [
      '-hide_banner', '-loglevel', 'error', '-n',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ];
    if (audio) args.push('-i', audio);
    args.push('-vf', vf.join(','), ...enc, '-r', String(fps));
    if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    args.push('-t', String(frames / fps), '-movflags', '+faststart', out);

    ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    ffDone = new Promise((res, rej) => {
      ff.on('error', rej);
      ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg 退出码 ' + code))));
    });
    // Observe early encoder failures while frames are still being captured.
    ffDone.catch(() => {});
    let inputError;
    ff.stdin.on('error', error => { inputError = error; });

    // 预热：前几帧包含着色器/字体栅格化的首次开销
    for (let i = 0; i < 3; i++) {
      await page.evaluate(t => window.__render.seek(t), Number((i * 0.05).toFixed(3)));
      await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 60, optimizeForSpeed: true, captureBeyondViewport: false });
    }

    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      const t = f / fps;
      await page.evaluate(async t => {
        await window.__render.seek(t);
        if (window.__error) throw new Error(window.__error);
      }, Number(t.toFixed(4)));
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'jpeg', quality, optimizeForSpeed: true, captureBeyondViewport: false, fromSurface: true,
      });
      const buf = Buffer.from(shot.data, 'base64');
      if (pageError) throw pageError;
      if (inputError) throw inputError;
      if (!ff.stdin.write(buf)) await Promise.race([once(ff.stdin, 'drain'), ffDone.then(() => { throw new Error('ffmpeg 在帧输入完成前退出'); })]);
      if (onProgress && (f % 30 === 0 || f === frames - 1)) onProgress(f + 1, frames, Date.now() - t0);
    }
    ff.stdin.end();
    await ffDone;
    return { frames, ms: Date.now() - t0 };
  } finally {
    if (ff && ff.exitCode === null && ff.signalCode === null) {
      ff.stdin.destroy(); ff.kill('SIGTERM');
      const killer = setTimeout(() => ff.kill('SIGKILL'), 2000);
      await ffDone.catch(() => {}); clearTimeout(killer);
    }
    await browser.close().catch(() => {});
  }
}

/** 抓一张静帧做封面/预览 */
export async function grabStill({ url, t = 0, out, width = 1080, height = 1920 }) {
  assert(!fs.existsSync(out), 'Output already exists; choose a new path');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 60000 });
    const err = await page.evaluate(() => window.__error || null);
    if (err) throw new Error('页面渲染报错:\n' + err);
    await page.evaluate(async t => {
      await window.__render.seek(t);
      if (window.__error) throw new Error(window.__error);
    }, t);
    fs.writeFileSync(out, await page.screenshot({ type: 'png' }), {flag: 'wx'});
    return out;
  } finally {
    await browser.close().catch(() => {});
  }
}
