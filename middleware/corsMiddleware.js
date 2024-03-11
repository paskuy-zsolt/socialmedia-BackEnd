// corsOptions.js
import cors from 'cors';

const corsOptions = {
    allowedHeaders: ['Authorization', 'Date', 'Content-Type', 'Expires'],
    exposedHeaders: ['Authorization', 'Date', 'Content-Length'],
    optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;