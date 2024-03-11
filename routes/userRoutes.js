import { getAllUsers, getUserById, logIn, signUp, recoverPassword, resetPassword, deleteUser, logOut } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"

export const userRoutes = (app) => {

    // Search User
    app.get("/users", getAllUsers);
    app.get("/user/:id", getUserById);

    // Account related
    app.post("/sign-up", signUp);   //Done
    app.post("/login", logIn);  //Done
    app.post("/user/logout", authMiddleware, logOut);

    // Authentication token debug
    app.post("/user/restricted", authMiddleware);

    // Password reset
    app.post("/reset-password", recoverPassword);   //Done
    app.post("/reset-password/:token", resetPassword);  //Done

    // Delete User
    app.delete("/user/:id", authMiddleware, deleteUser);
}