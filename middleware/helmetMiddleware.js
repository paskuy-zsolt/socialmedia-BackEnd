import helmet from 'helmet';

const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "trusted-cdn.com"], // Avoid 'unsafe-inline'
            styleSrc: ["'self'", "'unsafe-inline'"], // Inline styles (if necessary) for legacy support
            imgSrc: ["'self'", "data:", "trusted-cdn.com"], // Self, data URIs, trusted CDNs
            fontSrc: ["'self'", "trusted-cdn.com"],
            connectSrc: ["'self'"], // Same-origin connections only
            mediaSrc: ["'self'"], // Same-origin media only
            frameAncestors: ["'none'"], // Prevent clickjacking
            objectSrc: ["'none'"], // Block plugin-based content
        },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true, // Enable XSS filtering
    noSniff: true, // Prevent MIME type sniffing
    frameguard: { action: 'deny' }, // Deny iframe embedding
    hidePoweredBy: true, // Remove the "X-Powered-By" header
    hsts: { maxAge: 31536000, includeSubDomains: true }, // Enforce HTTPS
});

export default helmetMiddleware;
