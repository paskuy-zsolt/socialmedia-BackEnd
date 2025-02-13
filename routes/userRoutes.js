import { getAllUsers, getUserById, getUserProfile, logIn, signUp, recoverPassword, resetPassword, deleteUser, logOut, updateUserProfile } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"
import { resizeAndUpload, uploadProfileImage } from "../middleware/uploadMiddleware.js";

export const userRoutes = (app) => {

    // Search User
    app.get("/users", getAllUsers);
    app.get("/user/:id", getUserById);
    app.get("/user/:id/profile", authMiddleware, getUserProfile);
    
    // Account related
    app.patch("/user/:id/update-profile", authMiddleware, uploadProfileImage, resizeAndUpload, updateUserProfile);

    app.post("/sign-up", signUp);
    app.post("/login", logIn);
    app.post("/user/logout", authMiddleware, logOut);

    // Authentication token debug
    app.post("/user/restricted", authMiddleware);

    // Password reset
    app.post("/reset-password", recoverPassword);
    app.post("/reset-password/:token", resetPassword);

    // Delete User
    app.delete("/user/:id", authMiddleware, deleteUser);
}