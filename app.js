import express from 'express';
import { routes } from "./routes/routes.js";
import { startCronJob } from './cron/tokenCleanup.js';


const app = express();

app.use(express.json());

routes(app);

startCronJob();

export { app };