import { addPost, deletePost, getAllPosts, getByUserId, getPostById, likedPost, updatePost } from "../controller/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const postRoutes = (app) => {
    app.use(authMiddleware);

    // Search Post
    app.get("/feed", getAllPosts);
    app.get("/post/:postId", getPostById);
    app.get("/post/user/:userId", getByUserId);

    // Manipulate Post (create, like, dislike, comment)
    app.post("/post/create", addPost);
    app.post("/post/:postId/like", likedPost);

    // Update Post
    app.put("/post/:postId", updatePost);

    // Delete Post
    app.delete("/post/:postId", deletePost);
}