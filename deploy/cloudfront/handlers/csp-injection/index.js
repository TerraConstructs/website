// CloudFront Functions for CSP nonce injection
// Trigger: viewer-response

function handler(event) {
    var request = event.request;
    var response = event.response;
    var headers = response.headers;
    
    // Only process HTML responses
    var contentType = headers['content-type'] && headers['content-type'].value;
    if (!contentType || contentType.indexOf('text/html') === -1) {
        return response;
    }
    
    // Generate nonce (simplified for CloudFront Functions)
    // Note: CloudFront Functions have limited crypto capabilities
    var timestamp = Date.now().toString();
    var random = Math.random().toString(36).substring(2);
    var nonce = timestamp + random;
    
    // Set CSP header with nonce
    var csp = [
        "default-src 'self'",
        "script-src 'self' https://cdn.tailwindcss.com 'nonce-" + nonce + "'",
        "style-src 'self' https://fonts.googleapis.com 'nonce-" + nonce + "'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');
    
    // Add security headers
    headers['content-security-policy'] = { value: csp };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['x-content-type-options'] = { value: 'nosniff' };
    headers['x-xss-protection'] = { value: '1; mode=block' };
    headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };
    
    // Disable caching for HTML to ensure fresh nonces
    headers['cache-control'] = { value: 'no-cache, no-store, must-revalidate' };
    headers['pragma'] = { value: 'no-cache' };
    headers['expires'] = { value: '0' };
    
    // Note: CloudFront Functions cannot modify response body
    // Body modification (nonce replacement) must happen at origin
    // Consider using S3 + Lambda for pre-processing or switch to Lambda@Edge
    
    return response;
}