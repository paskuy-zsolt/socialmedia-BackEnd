import cron from 'node-cron';
import PasswordResetToken from '../model/PasswordResetToken.js';
import LoginToken from '../model/LoginToken.js';;

export const startCronJob = () => {
    cron.schedule('*/1 * * * *', async () => {
        try {
            const now = new Date();
            const result = await PasswordResetToken.deleteMany({ expires: { $lte: now } });
            console.log('Expired tokens deleted successfully. Deleted count:', result.deletedCount);
        } catch (error) {
            console.error('Error deleting expired tokens:', error);
        }
    });
};