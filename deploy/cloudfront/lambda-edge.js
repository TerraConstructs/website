const crypto = require('crypto');

// Lambda@Edge function for CloudFront
// Trigger: Origin Response

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    
    // Only process HTML responses
    const contentType = response.headers['content-type'] && response.headers['content-type'][0];
    if (!contentType || !contentType.value.includes('text/html')) {
        return response;
    }
    
    // Generate cryptographically secure nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    
    try {
        // Get response body
        let body = '';
        if (response.body && response.body.data) {
            body = Buffer.from(response.body.data, response.body.encoding || 'base64').toString('utf8');
        }
        
        // Replace all __CSP_NONCE__ placeholders with actual nonce
        const modifiedBody = body.replace(/__CSP_NONCE__/g, nonce);
        
        // Update response body
        response.body = {
            encoding: 'text',
            data: modifiedBody
        };
        
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
        
        // Set security headers
        response.headers['content-security-policy'] = [{ 
            key: 'Content-Security-Policy', 
            value: csp 
        }];
        
        response.headers['x-frame-options'] = [{ 
            key: 'X-Frame-Options', 
            value: 'DENY' 
        }];
        
        response.headers['x-content-type-options'] = [{ 
            key: 'X-Content-Type-Options', 
            value: 'nosniff' 
        }];
        
        response.headers['x-xss-protection'] = [{ 
            key: 'X-XSS-Protection', 
            value: '1; mode=block' 
        }];
        
        response.headers['referrer-policy'] = [{ 
            key: 'Referrer-Policy', 
            value: 'strict-origin-when-cross-origin' 
        }];
        
        // Ensure no caching for HTML to get fresh nonces
        response.headers['cache-control'] = [{ 
            key: 'Cache-Control', 
            value: 'no-cache, no-store, must-revalidate' 
        }];
        
        response.headers['pragma'] = [{ 
            key: 'Pragma', 
            value: 'no-cache' 
        }];
        
        response.headers['expires'] = [{ 
            key: 'Expires', 
            value: '0' 
        }];
        
    } catch (error) {
        console.error('Error processing response:', error);
        // Return original response on error
        return response;
    }
    
    return response;
};