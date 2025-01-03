import { getAllUsers, getUserById, logIn, signUp, recoverPassword, resetPassword, deleteUser, logOut } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"

export const userRoutes = (app) => {

    // Search User
    app.get("/users", getAllUsers);
    app.get("/user/:id", getUserById);

    // Account related
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