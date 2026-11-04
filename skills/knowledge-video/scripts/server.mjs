import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
};

/** 起一个只读工作区静态服务，端口 0 = 自动分配 */
export function serve(directory) {
  const root = fs.realpathSync(path.resolve(directory));
  const inside = file => {
    const relative = path.relative(root, file);
    return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
  };
  const server = http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    let p;
    try {
      p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.includes('\0')) throw new Error('Invalid path');
    } catch { res.writeHead(400).end('bad path'); return; }
    if (p.endsWith('/')) p += 'index.html';
    const file = path.resolve(root, '.' + p);
    if (!inside(file)) { res.writeHead(403).end('forbidden'); return; }
    fs.realpath(file, (error, real) => {
      if (error) { res.writeHead(404).end('not found'); return; }
      if (!inside(real)) { res.writeHead(403).end('forbidden'); return; }
      fs.readFile(real, (e, buf) => {
        if (e) { res.writeHead(404).end('not found'); return; }
        res.writeHead(200, { 'content-type': MIME[path.extname(real).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : buf);
      });
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
    resolve({ server, port: server.address().port, origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() });
    });
  });
}
