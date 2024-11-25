import express from 'express';
import corsMiddleware from './middleware/corsMiddleware.js';
import { routes } from './routes/routes.js';
import { startCronJob } from './cron/tokenCleanup.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';
import helmetMiddleware from './middleware/helmetMiddleware.js';
import csrfMiddleware from './middleware/csrfMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json()); // Body parsing
app.use(cookieParser()); // Parse cookies for CSRF token
app.use(corsMiddleware); // CORS Middleware
app.use(helmetMiddleware); // Helmet Middleware for security
app.use(sanitizeInput); // Input Sanitization Middleware

// Apply CSRF protection
app.use(csrfMiddleware);
app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken()); // Expose CSRF token as a cookie for the frontend
    next();
});

routes(app); // Define your routes

startCronJob(); // Start cron job for token cleanup

app.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'CSRF token validation failed.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
});

export { app };
