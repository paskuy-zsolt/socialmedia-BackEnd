import helmet from 'helmet';

const helmetMiddleware = (req, res, next) => {
    // Use helmet to set security headers globally
    helmet()(req, res, () => {});
    
    // Content Security Policy (CSP) settings
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"], // Only allow same-origin resources
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "trusted-cdn.com"], // Avoid 'unsafe-inline' and 'unsafe-eval' if possible
        objectSrc: ["'none'"], // Prevent Flash or other plugins
        styleSrc: ["'self'", "'unsafe-inline'"], // Restrict stylesheets
        imgSrc: ["'self'", "data:", "trusted-cdn.com"], // Allow self and trusted CDNs for images
        fontSrc: ["'self'", "trusted-cdn.com"], // Allow fonts from self and trusted CDNs
        connectSrc: ["'self'"], // Only allow connections to same-origin endpoints
        mediaSrc: ["'self'"], // Limit media sources to same-origin
        frameAncestors: ["'none'"], // Prevent embedding the site in a frame
        baseUri: ["'self'"], // Restrict base URI to same-origin
        formAction: ["'self'"], // Only allow form submissions to same-origin URLs
        frameSrc: ["'none'"] // Prevent embedding from external sources
      }
    })(req, res, next);

    // Set additional headers
    helmet.hidePoweredBy()(req, res, next); // Hide X-Powered-By header to avoid revealing framework info
    helmet.xssFilter()(req, res, next); // Enable basic XSS filtering
    helmet.noSniff()(req, res, next); // Prevent browsers from sniffing content types
    helmet.hsts({ maxAge: 31536000, includeSubDomains: true })(req, res, next); // Enforce HTTPS
    helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' })(req, res, next); // Referrer policy

    next();
};

export default helmetMiddleware;