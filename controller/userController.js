import User from "../model/User.js";
import PasswordResetToken from "../model/PasswordResetToken.js";
import LoginToken from "../model/LoginToken.js";
import { hashPassword, comparePassword } from "../utils/bcryptUtils.js";
import { generateAuthToken, generateResetToken, verifyResetToken } from '../utils/tokenUtils.js';
import { sendEmail } from "../utils/emailUtils.js";
import { responseSuccess, responseError, responseServerError } from "../utils/responseUtils.js";
import { formatValidationErrors } from "../utils/validationUtils.js";
import Comment from "../model/Comment.js";
import Post from "../model/Post.js";

export const getAllUsers = async (req, res, next) => {
    try {
        let users = await User.find();

        if (!users || users.length === 0) {
            return responseError(res, "No users found.", 404);
        }
        
        return responseSuccess(res, { users });
    } catch (error) {
        console.error("Error while fetching all users:", error);
        return responseServerError(res, "Failed to fetch users.");
    }
};

export const getUserById = async (req, res) => {
    const id = req.params.id;
    const cleanedId = id.replace(/^:/, '');
  
    try {
        const user = await User.findById(cleanedId);
  
        if (!user) {
            return responseError(res, "User not found.", 404);
        }

        return responseSuccess(res, { user });
    } catch (error) {
        console.error("Error while fetching user by ID:", error);
        return responseServerError(res, "Failed to fetch user.");
    }
};

export const signUp = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const newUser = new User({
            name,
            email,
            password
        });

        newUser.validateSync();

        if (newUser.errors) {
            const errors = formatValidationErrors(newUser.errors)
            return responseError(res, errors, 422);
        }

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return responseError(res, "User already exists.", 409);
        }

        const hashedPassword = hashPassword(password);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            posts: []
        });

        user.validateSync();
        await user.save();

        return responseSuccess(res, { message: 'User created successfully.', user }, 201);
    } catch (error) {
        console.error("Error during user sign up:", error);
        return responseServerError(res, "An error occurred while creating the user.");
    }
};

export const logIn = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return responseError(res, `User not found.`, 404);
        }

        const isPasswordCorrect = await comparePassword(password, existingUser.password);

        if (!isPasswordCorrect) {
            return responseError(res, 'Incorrect password.', 401);
        }
        
        const token = generateAuthToken(existingUser);
        const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const loginToken = new LoginToken({
            user: existingUser._id,
            token,
            expires: expiration
        });
        
        await loginToken.save();

        // Set the Authorization header with the token
        res.setHeader('Authorization', `${token}`);
        res.setHeader('Expires', expiration.toUTCString());

        // Send the success response without the token in the body
        return responseSuccess(res, { message: 'Logged in successfully.' });
    } catch (error) {
        console.error("Error during user login:", error);
        return responseServerError(res, 'Error during user login:');
    }
};

export const logOut = async (req, res, next) => {
    const id = req.user._id;
  
    try {
        const user = await User.findById(id);

        if (!user) {
            return responseError(res, "User not found.", 404);
        }

        await LoginToken.findOneAndDelete({ user: id });

        return responseSuccess(res, { message: "User logged out successfully." });
    } catch (error) {
        console.error("Error during user logout:", error);
        return responseServerError(res, "Error during user logout.");
    }
};

export const deleteUser = async (req, res, next) => {
    const id = req.params.id.replace(/^:/, '');

    try {
        const user = await User.findById(id);

        if (!user) {
            return responseError(res, "User not found.", 404);
        }

        // Delete posts created by the user
        await Post.deleteMany({ authorId: id });

        // Delete comments by the user
        await Comment.deleteMany({ user: id });

        // Delete likes associated with the user's posts
        await Post.updateMany(
            { likes: id }, // Find posts where the user is in the likes array
            { 
                $pull: { likes: id },  // Remove the user's ID from the likes array
                $inc: { likesCount: -1 } // Decrement the likes count by 1
            }
        );
        // Delete login tokens associated with the user
        await LoginToken.findOneAndDelete({ user: id });

        // Delete password reset tokens associated with the user
        await PasswordResetToken.findOneAndDelete({ user: id });

        // Delete the user itself
        await User.findByIdAndDelete(id);

        return responseSuccess(res, { message: "User and related data deleted successfully." });

    } catch (error) {
        console.error("Error deleting user and related data:", error);
        return responseServerError(res, "Failed to delete user and related data.");
    }
};


export const recoverPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        console.log("The User: " + user);

        if (!user) {
            return responseError(res, 'User not found.', 404);
        }

        const token = generateResetToken(email);

        const passwordResetToken = new PasswordResetToken({
            user: user._id,
            token: token,
            expires: new Date(Date.now() + 5 * 60 * 1000)
        });

        console.log("Password Reset Modal:" + passwordResetToken);

        await passwordResetToken.save();

        sendEmail(user.email, user.name, token);

        return responseSuccess(res, { message: "Password reset link sent successfully. Please check your email." });
    } catch (error) {
        console.error("Error during password recovery:", error);
        return responseServerError(res, 'An error occurred while generating the password reset link.');
    }
};

export const resetPassword = async (req, res, next) => {
    const token = req.params.token.replace(/^:/, '');
    const { password } = req.body;

    try {
        if (!token) {
            return responseError(res, 'Token is missing.', 400);
        }

        const decodedEmail = verifyResetToken(token);
        
        console.log("Decoded token: " + decodedEmail);

        const tokenDoc = await PasswordResetToken.findOne({ token });

        console.log("Token documentation: " + tokenDoc);

        if (!tokenDoc) {
            return responseError(res, 'Invalid token.', 400);
        }

        if (tokenDoc.expires < Date.now()) {
            await PasswordResetToken.findOneAndDelete({ token });

            return responseError(res, 'Expired token.', 400);
        }

        const user = await User.findOne({ email: decodedEmail });

        if (!user) {
            return responseError(res, 'User not found.', 404);
        }

        if (!password || password.length < 8 ) {
            return responseError(res, 'Password too short.', 422);
        }

        const hashedPassword = hashPassword(password);
        user.password = hashedPassword;

        await user.save();

        await PasswordResetToken.findOneAndDelete({ token });

        console.log(PasswordResetToken);

        return responseSuccess(res, { message: 'Password reset successfully.' });
    } catch (error) {
        console.error("Error during password reset:", error);
        return responseServerError(res, 'Failed to reset password.');
    }
};