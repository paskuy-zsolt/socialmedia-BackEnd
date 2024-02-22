import jwt from "jsonwebtoken";
import { responseError, responseServerError } from "../utils/responseUtils.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return responseError(res, "Authorization token is missing", 401);
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = tokenData;
        req.user._id = tokenData.userID;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return responseError(res, "Token has expired.", 401);
        } else if (error.name === 'JsonWebTokenError') {
            return responseError(res, "Invalid token.", 403);
        } else {
            console.error("Error verifying JWT token:", error);
            return responseServerError(res, "Internal Server Error.");
        }
    }
};