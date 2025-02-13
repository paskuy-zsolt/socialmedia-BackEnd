import dotenv from 'dotenv';
dotenv.config();

import https from 'http';
import { app } from './app.js';
import mongoose from 'mongoose';

const port = process.env.PORT;

const server = https.createServer(app);

const mongoConnection = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}?retryWrites=true&w=majority`;

server.listen(port, async () => {
    try {
        await mongoose.connect(mongoConnection, { dbName: "SocialMedia" });
        console.log(`Server is running on http://localhost:${port}`);
    } catch (err) {
        throw err;
    }
});
