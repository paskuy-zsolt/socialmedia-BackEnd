import cors from 'cors';

const corsOptions = {
    origin: ['http://localhost:4200', 'https://connect-hub.eu', 'https://www.connect-hub.eu'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Date', 'Content-Type', 'Expires', 'X-XSRF-TOKEN'],
    exposedHeaders: ['Authorization', 'Date', 'Content-Length'],
    credentials: true,
    optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
