# Nginx Deployment with CSP

## Prerequisites
- Nginx with lua module (`lua-resty-string` and `lua-resty-random` packages)
- Or alternative: Nginx with SSI (Server Side Includes)

## Installation Steps

### 1. Install Nginx with Lua support
```bash
# Ubuntu/Debian
apt-get update
apt-get install nginx-extras lua-resty-string lua-resty-random

# CentOS/RHEL
yum install nginx nginx-mod-http-lua lua-resty-string lua-resty-random
```

### 2. Copy files
```bash
# Copy HTML and assets to web root
cp -r ../index.html /var/www/terraconstructs/
cp -r ../logos /var/www/terraconstructs/

# Copy nginx configuration
cp nginx.conf /etc/nginx/sites-available/terraconstructs
ln -s /etc/nginx/sites-available/terraconstructs /etc/nginx/sites-enabled/
```

### 3. Test and reload
```bash
nginx -t
systemctl reload nginx
```

## Alternative: SSI Method (without Lua)

If Lua is not available, use Server Side Includes:

```nginx
server {
    listen 80;
    server_name terraconstructs.dev;
    root /var/www/terraconstructs;
    
    ssi on;
    
    location / {
        # Set CSP header with placeholder
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com 'nonce-NONCE_PLACEHOLDER'; style-src 'self' https://fonts.googleapis.com 'nonce-NONCE_PLACEHOLDER'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
        
        try_files $uri $uri/ =404;
    }
}
```

Then modify `index.html` to use SSI:
```html
<!--#set var="csp_nonce" value="SSI_GENERATED_NONCE" -->
<script nonce="<!--#echo var='csp_nonce' -->">
```

## Security Notes
- Nonce must be cryptographically random and unique per request
- Never reuse nonces across requests
- Consider implementing proper SSL/TLS configuration
- Use HSTS headers for production deployments