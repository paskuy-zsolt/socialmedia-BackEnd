import cors from 'cors';

const corsOptions = {
    origin: ['https://your-frontend-domain.com'],
    allowedHeaders: ['Authorization', 'Date', 'Content-Type', 'Expires'],
    exposedHeaders: ['Authorization', 'Date', 'Content-Length'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
