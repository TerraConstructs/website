# Node.js/Express Deployment with CSP

## Features
- Automatic nonce generation per request
- CSP headers with proper nonce injection
- Static asset serving with caching
- Production-ready with PM2 clustering
- Health check endpoint
- Graceful shutdown handling

## Quick Setup

### 1. Install dependencies
```bash
cd deploy/nodejs
npm install
```

### 2. Development mode
```bash
npm run dev
```
Visit: http://localhost:3000

### 3. Production deployment

#### Option A: Direct Node.js
```bash
npm start
```

#### Option B: PM2 (recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with clustering
npm run pm2

# Monitor
pm2 monit

# View logs
pm2 logs terraconstructs-landing

# Stop
npm run pm2:stop
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY server.js ./
COPY ecosystem.config.js ./
COPY ../../index.html ./
COPY ../../logos ./logos/

# Create logs directory
RUN mkdir -p logs

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### Build and run
```bash
# Build image
docker build -t terraconstructs-landing .

# Run container
docker run -p 3000:3000 terraconstructs-landing
```

## Reverse Proxy Setup (Nginx)

```nginx
upstream terraconstructs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name terraconstructs.dev;

    location / {
        proxy_pass http://terraconstructs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

## Environment Variables

```bash
# .env file
NODE_ENV=production
PORT=3000

# Optional: Custom paths
HTML_PATH=../../index.html
LOGOS_PATH=../../logos

# Optional: Security headers customization
CSP_SCRIPT_SRC="'self' https://cdn.tailwindcss.com"
CSP_STYLE_SRC="'self' https://fonts.googleapis.com"
```

## Monitoring

### Basic monitoring with PM2
```bash
# CPU and memory usage
pm2 monit

# Logs
pm2 logs --lines 100

# Restart if needed
pm2 restart terraconstructs-landing
```

### Advanced monitoring
Consider integrating:
- New Relic
- DataDog
- AWS CloudWatch
- Prometheus + Grafana

## Security Best Practices

1. **Nonce Security**: New nonce generated per request
2. **Headers**: Security headers set by middleware
3. **HTTPS**: Use reverse proxy with SSL termination
4. **Rate Limiting**: Add rate limiting middleware if needed
5. **Updates**: Keep dependencies updated

## Troubleshooting

### Common issues:
- **Port in use**: Change PORT environment variable
- **File not found**: Check HTML_PATH and LOGOS_PATH
- **CSP violations**: Verify nonce generation in browser console

### Debug mode:
```bash
DEBUG=* npm start
```