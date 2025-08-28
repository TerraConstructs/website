# TerraConstructs Landing Page - Production Deployment Guide

This guide covers deploying the TerraConstructs landing page with proper Content Security Policy (CSP) security in production environments.

## 🏗️ Architecture Overview

The landing page is designed with security-first principles:
- **CSP with nonces**: Prevents XSS attacks by requiring unique nonces for inline scripts/styles
- **Security headers**: HSTS, frame protection, content-type sniffing protection
- **HTTPS-only**: All communications encrypted
- **Static asset optimization**: Proper caching and compression

## 🚀 Deployment Options

Choose your preferred hosting platform:

### 1. [Nginx](deploy/nginx/) - Traditional Web Server
**Best for**: Existing server infrastructure, full control, high performance

```bash
cd deploy/nginx
# Follow setup instructions in README.md
sudo cp nginx.conf /etc/nginx/sites-available/terraconstructs
sudo systemctl reload nginx
```

**Features**:
- Lua-based nonce generation
- CSP header injection
- Static asset caching
- SSL termination

---

### 2. [Node.js/Express](deploy/nodejs/) - Application Server  
**Best for**: Containerized deployments, PM2 clustering, flexible hosting

```bash
cd deploy/nodejs
npm install
npm run preprocess  # Generate nonces
npm start          # or npm run pm2 for production
```

**Features**:
- Automatic nonce generation per request
- PM2 clustering support
- Docker ready
- Health checks

---

### 3. [CloudFront + TerraConstructs](deploy/cloudfront/) - Global CDN
**Best for**: Global scale, AWS ecosystem, infrastructure as code

```bash
cd deploy/cloudfront
npm install
npm run preprocess  # Generate HTML variants
npm run deploy     # Deploy with CDKTF
```

**Features**:
- CloudFront Functions for CSP
- Global edge locations  
- TerraConstructs/CDKTF deployment
- Automatic SSL certificates

## 🔒 Security Implementation

### Content Security Policy (CSP)
Each deployment method implements CSP differently but achieves the same security:

```http
Content-Security-Policy: default-src 'self'; 
script-src 'self' https://cdn.tailwindcss.com 'nonce-abc123'; 
style-src 'self' https://fonts.googleapis.com 'nonce-abc123';
img-src 'self' data:; 
font-src 'self' https://fonts.gstatic.com;
connect-src 'self'; 
frame-ancestors 'none';
base-uri 'self'; 
form-action 'self'
```

### Nonce Generation
- **Nginx**: Lua-based cryptographic random generation
- **Node.js**: `crypto.randomBytes(16).toString('hex')`
- **CloudFront**: Pre-generated variants with unique nonces

### Security Headers
All deployments include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📋 Pre-Deployment Checklist

### Domain & SSL
- [ ] Domain configured in DNS
- [ ] SSL certificate obtained (Let's Encrypt or ACM)
- [ ] Certificate installed/configured

### Security
- [ ] Nonce generation tested and working
- [ ] CSP headers properly set
- [ ] Security headers validated
- [ ] HTTPS redirect enabled

### Performance
- [ ] Static assets cached appropriately
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured (if applicable)

### Monitoring
- [ ] Error logging configured
- [ ] Uptime monitoring set up
- [ ] Performance monitoring enabled

## 🔧 Configuration

### Environment Variables
```bash
# Common across all platforms
DOMAIN_NAME=terraconstructs.dev
HTTPS_ONLY=true
CSP_ENABLED=true

# Platform-specific
PORT=3000                    # Node.js
NGINX_WORKER_PROCESSES=auto  # Nginx
AWS_REGION=us-east-1        # CloudFront
```

### Local Development
For local development without CSP restrictions:
```bash
python3 -m http.server 8080
open http://localhost:8080
```

The HTML file automatically detects localhost and relaxes CSP policies.

## 🧪 Testing

### CSP Validation
```bash
# Test CSP headers
curl -I https://terraconstructs.dev | grep -i content-security-policy

# Validate nonce uniqueness  
for i in {1..5}; do
  curl -s https://terraconstructs.dev | grep -o 'nonce-[a-f0-9]*' | head -1
done
```

### Security Headers
```bash
# Check all security headers
curl -I https://terraconstructs.dev
```

### Performance Testing
```bash
# Load testing
ab -n 1000 -c 10 https://terraconstructs.dev/

# Lighthouse audit
lighthouse https://terraconstructs.dev --view
```

## 🚨 Troubleshooting

### Common CSP Issues

**Problem**: Scripts/styles blocked by CSP  
**Solution**: Verify nonce generation and replacement in HTML

**Problem**: Mixed content warnings  
**Solution**: Ensure all resources use HTTPS

**Problem**: CSP reporting too verbose  
**Solution**: Adjust CSP policy or add report-uri

### Platform-Specific Issues

#### Nginx
- Check Lua module installation: `nginx -V 2>&1 | grep -o with-http_lua_module`
- Verify nonce generation: `tail -f /var/log/nginx/error.log`

#### Node.js  
- Memory leaks: Monitor with `pm2 monit`
- Port conflicts: Change `PORT` environment variable

#### CloudFront
- Function deployment: Check CloudWatch logs
- Cache issues: Create invalidations for immediate updates

## 📊 Monitoring & Maintenance

### Health Checks
- **Nginx**: Configure status module
- **Node.js**: Built-in `/health` endpoint
- **CloudFront**: CloudWatch metrics

### Log Analysis
Monitor for:
- CSP violations
- 404/403 errors  
- Performance bottlenecks
- Security incidents

### Updates
- Keep dependencies updated
- Monitor security advisories
- Test CSP changes in staging first
- Backup configurations before changes

## 📚 Additional Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [TerraConstructs Documentation](https://constructs.dev/packages/terraconstructs)
- [CDKTF Guide](https://developer.hashicorp.com/terraform/cdktf)
- [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)

## 🆘 Support

For deployment issues:
1. Check platform-specific README files
2. Verify prerequisites are met
3. Test in staging environment first
4. Join the [Discord](https://discord.gg/gEu3D8hJGz) for community support