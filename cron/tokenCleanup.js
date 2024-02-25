import cron from 'node-cron';
import Comment from '../model/Comment.js';
import Post from '../model/Post.js';
import PasswordResetToken from '../model/PasswordResetToken.js';
import LoginToken from '../model/LoginToken.js';

export const startCronJob = () => {

    cron.schedule('0 0 1 * *', async () => { // Runs at midnight on the 1st day of every month
        try {
            const now = new Date();
            const loginTokenResult = await LoginToken.deleteMany({ expires: { $lte: now } });
            console.log('Expired LoginToken deleted successfully. Deleted count:', loginTokenResult.deletedCount);
        } catch (error) {
            console.error("Error deleting LoginToken's:", error);
        }
    });
    
    cron.schedule('0 0 1,15 * *', async () => { // Runs on the 1st and 15th day of the month at midnight
        try {
            const now = new Date();
            const passwordResetResult = await PasswordResetToken.deleteMany({ expires: { $lte: now } });
            console.log('Expired PasswordResetToken deleted successfully. Deleted count:', passwordResetResult.deletedCount);
        } catch (error) {
            console.error("Error deleting PasswordResetToken's:", error);
        }
    });

    cron.schedule('0 0 * * 0', async () => { // Runs every Sunday at midnight
        try {
            const comments = await Comment.find();
    
            for (const comment of comments) {
    
                const post = await Post.findById(comment.post);
    
                if (!post) {
                    await Comment.findByIdAndDelete(comment._id);

                    console.log(`Deleted orphaned comment: ${comment._id}`);
                }
            }
        } catch (error) {
            console.error('Error deleting orphaned comments:', error);
        }
    });
};