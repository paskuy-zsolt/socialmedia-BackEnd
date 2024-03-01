import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { routes } from "./routes/routes.js";
import { startCronJob } from './cron/tokenCleanup.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "example.com"],
            },
        },
        xFrameOptions: { action: "sameorigin" },
    }),
);

app.use(sanitizeInput);

routes(app);

startCronJob();

export { app };