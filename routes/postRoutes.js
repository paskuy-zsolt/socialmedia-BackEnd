import { addPost, deletePost, getAllPosts, getByUserId, getPostById, updatePost } from "../controller/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const postRoutes = (app) => {

    // Search Post
    app.get("/", getAllPosts);
    app.get("/post/:id", getPostById);
    app.get("/post/user/:id", getByUserId);

    // Creating Post
    app.post("/post/create", authMiddleware, addPost);
    
    // Update Post
    app.patch("/post/:id", authMiddleware, updatePost);

    // Delete Post
    app.delete("/post/:id", authMiddleware ,deletePost);
}