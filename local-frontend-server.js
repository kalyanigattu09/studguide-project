const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, 'frontend', 'dist');
const apiTarget = 'http://localhost:5000';
const port = process.env.PORT || 3000;

const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Unable to serve file');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    const proxyReq = http.request(`${apiTarget}${req.url}`, {
      method: req.method,
      headers: req.headers
    }, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.writeHead(502);
      res.end('Backend API is not reachable');
    });

    req.pipe(proxyReq);
    return;
  }

  const requestPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.join(root, requestPath === '/' ? 'index.html' : requestPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      serveFile(res, filePath);
      return;
    }

    serveFile(res, path.join(root, 'index.html'));
  });
});

server.listen(port, () => {
  console.log(`Frontend running at http://localhost:${port}`);
});
