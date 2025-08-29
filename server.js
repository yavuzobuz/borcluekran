const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');
const compression = require('compression');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Enable compression for better performance
  server.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
  }));

  // Configure static file serving with proper MIME types
  const staticOptions = {
    maxAge: dev ? 0 : '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set proper MIME types for different file extensions
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
        case '.css':
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          break;
        case '.js':
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          break;
        case '.woff':
          res.setHeader('Content-Type', 'font/woff');
          break;
        case '.woff2':
          res.setHeader('Content-Type', 'font/woff2');
          break;
        case '.ttf':
          res.setHeader('Content-Type', 'font/ttf');
          break;
        case '.eot':
          res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
          break;
        case '.svg':
          res.setHeader('Content-Type', 'image/svg+xml');
          break;
        case '.png':
          res.setHeader('Content-Type', 'image/png');
          break;
        case '.jpg':
        case '.jpeg':
          res.setHeader('Content-Type', 'image/jpeg');
          break;
        case '.ico':
          res.setHeader('Content-Type', 'image/x-icon');
          break;
      }

      // Add cache headers for static assets
      if (!dev) {
        if (filePath.includes('/_next/static/')) {
          // Next.js static assets - long cache
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          // Public assets - shorter cache
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  };

  // Serve static files from public directory
  server.use('/public', express.static(path.join(__dirname, 'public'), staticOptions));

  // Serve Next.js static files
  server.use('/_next/static', express.static(path.join(__dirname, '.next/static'), staticOptions));

  // Handle favicon requests
  server.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
    res.sendFile(faviconPath, (err) => {
      if (err) {
        res.status(404).end();
      }
    });
  });

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // Start the server
  const httpServer = createServer(server);

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });
});