import express from 'express';
import corsMiddleware from './middleware/corsMiddleware.js';
import { routes } from './routes/routes.js';
import { startCronJob } from './cron/tokenCleanup.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';
import helmetMiddleware from './middleware/helmetMiddleware.js';

const app = express();

app.use(express.json()); // Body parsing
app.use(corsMiddleware); // CORS Middleware
app.use(helmetMiddleware); // Helmet Middleware for security
app.use(sanitizeInput); // Input Sanitization Middleware

routes(app); // Define your routes

startCronJob(); // Start cron job for token cleanup

export { app };