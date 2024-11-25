import cors from 'cors';

const corsOptions = {
    origin: 'https://connect-hub.eu',
    allowedHeaders: ['Authorization', 'Date', 'Content-Type', 'Expires'],
    exposedHeaders: ['Authorization', 'Date', 'Content-Length'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200,
    credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
