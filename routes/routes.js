import { userRoutes } from "./userRoutes.js";
import { postRoutes } from "./postRoutes.js";

export const routes = (app) => {
    userRoutes(app);
    postRoutes(app);
}