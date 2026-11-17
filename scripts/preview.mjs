import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    // Serve the public page and assets, keeping repository metadata private.
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    const inside = path.relative(root, file);
    if (inside.startsWith('..') || path.isAbsolute(inside) ||
        relative.split(/[\\/]/).some(part => part.startsWith('.')) ||
        !Object.hasOwn(types, path.extname(file).toLowerCase())) {
      response.writeHead(404).end('Not found');
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()],
      'Cache-Control': 'no-store',
    });
    response.end(contents);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end('Not found');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port 8000 is in use. Stop the other preview with Ctrl+C, then try again.'
    : error.message);
  process.exitCode = 1;
});

server.listen(8000, '127.0.0.1', () => {
  console.log('\nPortfolio preview: http://localhost:8000');
  console.log('Refresh your browser after editing. Press Ctrl+C to stop.\n');
});
