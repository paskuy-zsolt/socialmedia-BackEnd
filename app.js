import express from 'express';
import corsMiddleware from './middleware/corsMiddleware.js';
import { routes } from "./routes/routes.js";
import { startCronJob } from './cron/tokenCleanup.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';

const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use(sanitizeInput);

routes(app);

startCronJob();

export { app };