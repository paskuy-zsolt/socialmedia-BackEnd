import { addComment, deleteComment, getCommentsFromPost } from "../controller/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const commentRoutes = (app) => {
    app.use(authMiddleware);
    
    app.get("/post/:postId/comments", getCommentsFromPost);
    app.post("/post/:postId/comment/add", addComment);
    app.delete('/post/:postId/comment/:commentId', deleteComment);
}