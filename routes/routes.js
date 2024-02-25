import { userRoutes } from "./userRoutes.js";
import { postRoutes } from "./postRoutes.js";
import { commentRoutes } from "./commentRoutes.js"
import { authMiddleware } from "../middleware/authMiddleware.js";

export const routes = (app) => {
    userRoutes(app);
    postRoutes(app, authMiddleware);
    commentRoutes(app, authMiddleware);

    app.all("*", function(req, res, next) {
        res.status(404).send();
    })
}