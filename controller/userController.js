import User from "../model/User.js";
import Post from "../model/Post.js";
import Comment from "../model/Comment.js";
import PasswordResetToken from "../model/PasswordResetToken.js";
import LoginToken from "../model/LoginToken.js";
import UserProfile from "../model/UserProfile.js";

import { hashPassword, comparePassword } from "../utils/bcryptUtils.js";
import { generateAuthToken, generateResetToken, verifyResetToken } from "../utils/tokenUtils.js";
import { sendEmail } from "../utils/emailUtils.js";
import { responseSuccess, responseError, responseServerError } from "../utils/responseUtils.js";
import { formatValidationErrors } from "../utils/validationUtils.js";
import { s3 } from "../middleware/uploadMiddleware.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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
    
    const user_id = req.params.id.replace(/^:/, '');

    try {

        // Fetch basic user details from User schema
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return responseSuccess(res, { user });
    } catch (error) {
        console.error("Error while fetching user by ID:", error);
        return responseServerError(res, "Failed to fetch user.");
    }
};

export const updateUserProfile = async (req, res, next) => {
    const userID = req.user._id;
    const updates = { ...req.body };

    if (req.file) {
        updates.avatar = req.file.location;
    }

    const errors = [];

    const session = await User.startSession();
    session.startTransaction();

    try {
        const user = await User.findOne({ _id: userID }).session(session);
    
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "User not found" });
        }
        
        if (!updates.name || updates.name.length < 3 || updates.name.length > 200) {
            errors.push("Name is required and must be between 3 and 200 characters.");
        }    
    
        if (!updates.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
            errors.push("Valid email is required.");
        }
    
        if (updates.username && updates.username.length > 50) {
            errors.push("Username cannot exceed 50 characters.");
        }

        // Ensure the phone number is in E.164 format
        if (updates.phone) {
            if (!updates.phone.startsWith("+")) {
                updates.phone = `+${updates.phone}`;
            }
            if (!/^\+[1-9]\d{1,14}$/.test(updates.phone)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "Invalid phone number format" });
            }
        }

        if (updates.avatar) {
            const userProfile = await UserProfile.findOne({ userID: user._id });
            if (userProfile && userProfile.avatar) {
                const oldImageUrl = userProfile.avatar;
                const urlParts = oldImageUrl.split("/");
                const imageKey = urlParts.slice(3).join("/"); // Extract key from URL

                // Delete old image from S3
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: imageKey
                }));
            }
        }

        if (updates.description && updates.description.length > 500) {
            errors.push("Description cannot exceed 500 characters.");
        }
    
        if (errors.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Validation failed", errors });
        }

        // If name or email is provided, update the User model
        const userUpdates = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.email) userUpdates.email = updates.email;

        for (const key in updates) {
            if (updates[key] === "" || updates[key].trim() === "") {
                updates[key] = "";
            }
        }

        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(userID, userUpdates, { new: true, runValidators: true }).session(session);
        }
  
        // Update the user profile in the new UserProfile schema
        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userID: user._id },
            updates,
            { new: true, upsert: true, runValidators: true, session }
        );

        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({ message: "User profile updated successfully", profile: updatedProfile });
    } catch (error) {
        console.error("Error updating user profile:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    const user_id = req.params.id.replace(/^:/, '');

    try {
        // Fetch the user
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the UserProfile, but only if it exists
        const userProfile = await UserProfile.findOne({ userID: user._id });
        
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found. Please update your profile." });
        }

        return res.status(200).json({ userProfile });
    } catch (error) {
        console.error("Error while fetching user profile:", error);
        return res.status(500).json({ message: "Failed to fetch user profile." });
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

        return responseSuccess(res, { message: "User created successfully.", user }, 201);
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
            return responseError(res, "User not found.", 404);
        }

        const isPasswordCorrect = await comparePassword(password, existingUser.password);

        if (!isPasswordCorrect) {
            return responseError(res, "Incorrect password.", 401);
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
        return responseSuccess(res, { message: "Logged in successfully." });
    } catch (error) {
        console.error("Error during user login:", error);
        return responseServerError(res, "Error during user login:");
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

        const profileUser = await UserProfile.findOne({ userID: user._id });
        
        if(profileUser) {
            if (profileUser.avatar) {
                const imageUrl = profileUser.avatar;
                const urlParts = imageUrl.split("/");
                const imageKey = urlParts.slice(3).join("/");

                // Delete old image from S3
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: imageKey
                }));
            }

            await UserProfile.findByIdAndDelete(profileUser._id);
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

        if (!user) {
            return responseError(res, "User not found.", 404);
        }

        const token = generateResetToken(email);

        const passwordResetToken = new PasswordResetToken({
            user: user._id,
            token: token,
            expires: new Date(Date.now() + 5 * 60 * 1000)
        });

        await passwordResetToken.save();

        sendEmail(user.email, user.name, token);

        return responseSuccess(res, { message: "Password reset link sent successfully. Please check your email." });
    } catch (error) {
        console.error("Error during password recovery:", error);
        return responseServerError(res, "An error occurred while generating the password reset link.");
    }
};

export const resetPassword = async (req, res, next) => {
    const token = req.params.token.replace(/^:/, "");
    const { password } = req.body;

    try {
        if (!token) {
            return responseError(res, "Token is missing.", 400);
        }

        const decodedEmail = verifyResetToken(token);

        const tokenDoc = await PasswordResetToken.findOne({ token });

        if (!tokenDoc) {
            return responseError(res, "Invalid token.", 400);
        }

        if (tokenDoc.expires < Date.now()) {
            await PasswordResetToken.findOneAndDelete({ token });

            return responseError(res, "Expired token.", 400);
        }

        const user = await User.findOne({ email: decodedEmail });

        if (!user) {
            return responseError(res, "User not found.", 404);
        }

        if (!password || password.length < 8 ) {
            return responseError(res, "Password too short.", 422);
        }

        const hashedPassword = hashPassword(password);
        user.password = hashedPassword;

        await user.save();

        await PasswordResetToken.findOneAndDelete({ token });

        return responseSuccess(res, { message: "Password reset successfully." });
    } catch (error) {
        console.error("Error during password reset:", error);
        return responseServerError(res, "Failed to reset password.");
    }
};