import cors from 'cors';

const corsOptions = {
    origin: 'https://connect-hub.eu',
    allowedHeaders: ['Authorization', 'Date', 'Content-Type', 'Expires', 'XSRF-TOKEN'],
    exposedHeaders: ['Authorization', 'Date', 'Content-Length', 'XSRF-TOKEN'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200,
    credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
