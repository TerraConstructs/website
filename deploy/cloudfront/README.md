# CloudFront Deployment with TerraConstructs

Deploy the TerraConstructs landing page using CloudFront with CSP security via CloudFront Functions.

## Architecture

- **S3**: Static hosting with multiple HTML variants (different nonces)
- **CloudFront**: Global CDN with two CloudFront Functions:
  1. **Variant Selector** (viewer-request): Randomly selects HTML variant
  2. **CSP Injection** (viewer-response): Adds CSP headers matching the nonce
- **Route 53**: DNS management
- **ACM**: SSL certificate

## Prerequisites

```bash
# Install dependencies
npm install -g cdktf-cli
npm install

# AWS credentials configured
aws configure
```

## Quick Deploy

### 1. Configure your domain
Edit `stack.ts`:
```typescript
const stack = new TerraConstructsLandingStack(app, stackName, {
  // ...
  domainName: "your-domain.com",        // Your domain
  zoneId: "Z1234567890ABC",            // Your Route53 zone ID
});
```

### 2. Preprocess and deploy
```bash
# Generate HTML variants with unique nonces
npm run preprocess

# Deploy infrastructure
npm run deploy
```

## Deployment Process

### Step 1: Preprocess HTML
```bash
npm run preprocess
```
This generates:
- 10 HTML variants with unique nonces in `dist/`
- CloudFront Function for variant selection
- Deployment manifest

### Step 2: Deploy Infrastructure
```bash
# Generate Terraform
npm run synth

# Review changes
npm run diff

# Deploy
npm run deploy
```

### Step 3: Upload Content
The deployment automatically:
- Creates S3 bucket with CloudFront access
- Uploads all HTML variants and assets
- Configures CloudFront distribution
- Sets up DNS records

## How CSP Works

1. **Request**: User visits `https://terraconstructs.dev`
2. **Variant Selection**: CloudFront Function randomly selects `index-N.html`
3. **Serve HTML**: S3 serves HTML with embedded nonce
4. **Add Headers**: CloudFront Function adds CSP header with matching nonce
5. **Security**: Browser enforces CSP, allowing only scripts/styles with correct nonce

## CloudFront Functions

### Variant Selector (viewer-request)
```javascript
// Randomly selects HTML variant with unique nonce
function handler(event) {
    var request = event.request;
    if (request.uri === '/' || request.uri === '/index.html') {
        var variant = Math.floor(Math.random() * 10);
        request.uri = variant === 0 ? '/index.html' : '/index-' + variant + '.html';
    }
    return request;
}
```

### CSP Injection (viewer-response)  
```javascript
// Adds security headers including CSP
function handler(event) {
    var response = event.response;
    response.headers['content-security-policy'] = {
        value: "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com 'nonce-" + nonce + "'"
    };
    return response;
}
```

## Project Structure
```
deploy/cloudfront/
├── stack.ts                 # TerraConstructs stack definition
├── preprocess.js            # HTML preprocessing script
├── handlers/
│   ├── csp-injection/
│   │   └── index.js        # CSP header injection function
│   └── variant-selector/
│       └── index.js        # HTML variant selection function
├── dist/                   # Generated HTML variants
│   ├── index.html         # Main HTML
│   ├── index-1.html       # Variant 1
│   ├── ...                # More variants
│   └── logos/             # Asset files
└── cdktf.out/             # Generated Terraform
```

## Commands

```bash
# Development
npm run preprocess        # Generate HTML variants
npm run build            # Compile TypeScript
npm run synth            # Generate Terraform
npm run diff             # Show deployment changes

# Deployment  
npm run deploy           # Deploy infrastructure
npm run destroy          # Destroy infrastructure

# Combined
npm run build-site       # Preprocess + build
```

## Monitoring

### CloudFront Metrics
- Distribution performance in CloudWatch
- Function execution logs
- Cache hit rates

### Security Validation
```bash
# Test CSP headers
curl -I https://terraconstructs.dev

# Verify nonce uniqueness
curl -s https://terraconstructs.dev | grep -o 'nonce-[a-f0-9]*' | sort | uniq
```

## Troubleshooting

### Function Deployment Issues
```bash
# Check function status
aws cloudfront list-functions --region us-east-1

# View function logs
aws logs tail /aws/cloudfront/function/csp-injection --follow
```

### Cache Issues
```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXXXXX \
  --paths "/*"
```

### CSP Violations
Check browser console for CSP errors and adjust the policy in `handlers/csp-injection/index.js`.

## Cost Optimization

- **Price Class 100**: Serves from US/Europe edge locations only
- **CloudFront Functions**: More cost-effective than Lambda@Edge
- **S3**: Standard storage with CloudFront caching
- **Route 53**: Minimal DNS costs

Estimated monthly cost: $1-5 for typical traffic loads.

## Security Features

✅ **Content Security Policy**: Prevents XSS attacks  
✅ **HTTPS Only**: All traffic encrypted  
✅ **Frame Protection**: Prevents clickjacking  
✅ **HSTS**: HTTP Strict Transport Security  
✅ **Nonce Rotation**: Unique nonces per request  
✅ **Origin Access Control**: S3 only accessible via CloudFront