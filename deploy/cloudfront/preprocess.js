#!/usr/bin/env node

/**
 * Preprocess HTML files to generate unique nonces for CloudFront Functions
 * Since CloudFront Functions cannot modify response bodies, we generate
 * multiple versions with different nonces and use CloudFront to serve them randomly
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sourceDir = path.join(__dirname, '..', '..');
const distDir = path.join(__dirname, 'dist');
const numVariants = 10; // Number of HTML variants with different nonces

console.log('🔧 Preprocessing HTML for CloudFront deployment...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy logos directory
const sourceLogosDir = path.join(sourceDir, 'logos');
const distLogosDir = path.join(distDir, 'logos');

if (fs.existsSync(sourceLogosDir)) {
  console.log('📁 Copying logos directory...');
  fs.cpSync(sourceLogosDir, distLogosDir, { recursive: true });
}

// Read original HTML
const htmlPath = path.join(sourceDir, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('❌ Error: index.html not found at', htmlPath);
  process.exit(1);
}

const originalHtml = fs.readFileSync(htmlPath, 'utf8');
console.log('📄 Read original HTML file');

// Generate multiple HTML variants with different nonces
console.log(`🎲 Generating ${numVariants} HTML variants with unique nonces...`);

const variants = [];
for (let i = 0; i < numVariants; i++) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const processedHtml = originalHtml.replace(/__CSP_NONCE__/g, nonce);
  
  const filename = i === 0 ? 'index.html' : `index-${i}.html`;
  const filePath = path.join(distDir, filename);
  
  fs.writeFileSync(filePath, processedHtml);
  variants.push({ filename, nonce });
  
  console.log(`  ✅ ${filename} (nonce: ${nonce.substring(0, 8)}...)`);
}

// Generate CloudFront Function that randomly selects variants
const functionCode = `
// CloudFront Function to serve random HTML variants with unique nonces
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Only modify requests for the root HTML file
    if (uri === '/' || uri === '/index.html') {
        // Select random variant (0-${numVariants - 1})
        var variant = Math.floor(Math.random() * ${numVariants});
        if (variant === 0) {
            request.uri = '/index.html';
        } else {
            request.uri = '/index-' + variant + '.html';
        }
    }
    
    return request;
}
`.trim();

// Update the CloudFront Function for variant selection
const variantFunctionPath = path.join(__dirname, 'handlers', 'variant-selector', 'index.js');
const variantFunctionDir = path.dirname(variantFunctionPath);

if (!fs.existsSync(variantFunctionDir)) {
  fs.mkdirSync(variantFunctionDir, { recursive: true });
}

fs.writeFileSync(variantFunctionPath, functionCode);
console.log('🔀 Generated variant selector CloudFront Function');

// Generate manifest for deployment
const manifest = {
  variants: variants.length,
  files: variants.map(v => v.filename),
  generatedAt: new Date().toISOString(),
  nonces: variants.map(v => ({ file: v.filename, nonce: v.nonce }))
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('📋 Generated deployment manifest');

console.log('\n✅ Preprocessing complete!');
console.log('📂 Output directory:', distDir);
console.log('🚀 Ready for CloudFront deployment');

// Update stack.ts to use variant selector
console.log('\n💡 Note: Update your stack.ts to use the variant-selector function:');
console.log('   - Use viewer-request event type for variant selection');
console.log('   - Use viewer-response event type for CSP headers');