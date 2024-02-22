import jwt from 'jsonwebtoken';

export const generateAuthToken = (user) => {
    const key = process.env.JWT_SECRET;

    return jwt.sign({ userID: user._id, email: user.email }, key)
};

export const generateResetToken = (email) => {
    const key = process.env.JWT_RESET;
    const token = jwt.sign({ email }, key);

    return token;
};

export const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_RESET);

        return decoded.email;
    } catch (error) {
        console.error('Error verifying reset token:', error);
        return null;
    }
};

import cron from 'node-cron';
import PasswordResetToken from '../model/PasswordResetToken.js';
import LoginToken from '../model/LoginToken.js';

export const startCronJob = () => {
    cron.schedule('*/1 * * * *', async () => {
        try {
            const now = new Date();

            const passwordResetResult = await PasswordResetToken.deleteMany({ expires: { $lte: now } });
            console.log('Expired PasswordResetToken deleted successfully. Deleted count:', passwordResetResult.deletedCount);

            const loginTokenResult = await LoginToken.deleteMany({ expires: { $lte: now } });
            console.log('Expired LoginToken deleted successfully. Deleted count:', loginTokenResult.deletedCount);
        } catch (error) {
            console.error('Error deleting expired tokens:', error);
        }
    });
};
