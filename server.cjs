// Preview server for the storefront and shared API handlers.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { serveCatalogue } = require('./catalogue.cjs');
const { serveProductImage } = require('./product-image.cjs');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method not allowed');
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://preview').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (pathname === '/api/catalogue') return serveCatalogue(req, res);
  if (pathname === '/api/product-image') return serveProductImage(req, res);
  if (pathname === '/') pathname = '/index.html';
  // Expose only the storefront, never repository files or configuration.
  if (pathname !== '/index.html' && !/^\/(assets|img)\//.test(pathname)) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const file = path.resolve(__dirname, '.' + pathname);
  if (pathname.includes('\0') ||
      (pathname !== '/index.html' &&
       !['assets', 'img'].some(dir => file.startsWith(path.join(__dirname, dir) + path.sep)))) {
    res.writeHead(404);
    return res.end('Not found');
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const stream = fs.createReadStream(file);
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end('Unable to read file');
    });
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': pathname === '/index.html' ? 'no-store' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') {
      stream.destroy();
      return res.end();
    }
    stream.pipe(res);
  });
}).listen(5000, '0.0.0.0', () => {
  console.log('Xana Life demo listening on port 5000');
});
