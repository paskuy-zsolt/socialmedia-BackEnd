const allowedOrigins = [
    'http://localhost:4200',
    'https://www.connect-hub.eu',
    'https://connect-hub-zsolts-projects-16de6f54.vercel.app',
    'https://connect-j6agdgysy-zsolts-projects-16de6f54.vercel.app',
];

const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';

    // Check if Origin or Referer is allowed
    const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((allowed) => referer.startsWith(allowed));

    if (!origin && !referer) {
        return res.status(403).json({ message: 'Requests without Origin or Referer are not allowed.' });
    }

    if (!isAllowed) {
        return res.status(403).json({ message: 'Access denied. Invalid Origin or Referer.' });
    }

    // Set CORS headers for allowed requests
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
    }

    next();
};

export default corsMiddleware;
