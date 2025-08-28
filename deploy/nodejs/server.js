const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Static assets with caching
app.use('/logos', express.static(path.join(__dirname, '../../logos'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public');
  }
}));

// CSP nonce middleware
const cspNonceMiddleware = (req, res, next) => {
  // Generate cryptographically secure nonce
  const nonce = crypto.randomBytes(16).toString('hex');
  res.locals.cspNonce = nonce;
  
  // Set CSP header with nonce
  const csp = [
    "default-src 'self'",
    `script-src 'self' https://cdn.tailwindcss.com 'nonce-${nonce}'`,
    `style-src 'self' https://fonts.googleapis.com 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
};

// Load and cache HTML template
let htmlTemplate;
try {
  htmlTemplate = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
} catch (error) {
  console.error('Error loading HTML template:', error);
  process.exit(1);
}

// Main route with nonce injection
app.get('/', cspNonceMiddleware, (req, res) => {
  try {
    // Replace all __CSP_NONCE__ placeholders with actual nonce
    const html = htmlTemplate.replace(/__CSP_NONCE__/g, res.locals.cspNonce);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
  } catch (error) {
    console.error('Error serving HTML:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`TerraConstructs landing page server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;