import mongoose from "mongoose";
import User from "../model/User.js";
import Post from "../model/Post.js";
import { responseSuccess, responseError, responseServerError } from "../utils/responseUtils.js";
import { formatValidationErrors } from "../utils/validationUtils.js";

export const getAllPosts = async (req, res, next) => {
    try {
        let posts = await Post.find();

        if (!posts) {
            return responseError(res, "No posts found.", 404);
        }

        return responseSuccess(res, { posts });
    } catch (error) {
        return responseServerError(res, "Failed to fetch posts.");
    }
};

export const getPostById = async (req, res, next) => {
    const id = req.params.id;

    try {
        const cleanedId = id.replace(/^:/, '');
        const post = await Post.findById(cleanedId);

        console.log(cleanedId);
        console.log(post);

        if(!post) {
            return responseError(res, "Post not found", 404);
        }

        responseSuccess(res, { post });
    }  catch (error) {
        console.error("Error while fetching post by ID:", error);
        return responseServerError(res, "Failed to fetch post.");
    }
}

export const addPost = async (req, res, next) => {
    const { title, content, attachments } = req.body;
    const author = req.user._id;

    console.log("Author ID:", author);

    let user;

    try {
        user = await User.findById(author);
    } catch (error) {
        console.error("Error while searching after user.", error);
        return responseServerError(res, "Failed to find user.");
    }

    if(!user) {
        return responseError(res, "Unable to find user by this ID", 400);
    }
    
    const post = new Post ({
        title,
        content,
        authorId: author,
        attachments
    });

    try {
        const validationError = post.validateSync();

        if (validationError) {
            const errors = formatValidationErrors(post.errors)
            return responseError(res, errors, 422);
        }
        
        const session = await mongoose.startSession();
        session.startTransaction();

        await post.save({ session });

        user.posts.push(post);

        await user.save({ session });

        await session.commitTransaction();
        
        return responseSuccess(res, { post });
    } catch (error) {
        console.error("Error while creating post:", error);
        await session.abortTransaction();
        return responseServerError(res, "Failed to create post.");
    }
}

export const getByUserId = async (req, res, next) => {
    const userId = req.params.id;
    const cleanedIdUserId = userId.replace(/^:/, '');

    try {
        const userPost = await User.findById(cleanedIdUserId).populate("posts");
        
        if (!userPost) {
            return responseError(res, "User not found.", 404);
        }

        if (userPost.posts.length === 0) {
            return responseSuccess(res, { message: "User doesn't have posts." });
        }
        
        return responseSuccess(res, { post: userPost });
    } catch (error) {
        console.error("Error while searching the User ID for Post:", error);
        return responseServerError(res, "Error while searching the Post after the User ID.");
    }
}

export const updatePost = async (req, res, next) => {
    const { title, content, attachments } = req.body;
    const postId = req.params.id;
    const cleanedId = postId.replace(/^:/, '');

    let post

    try {
        post = await Post.findById(cleanedId);

        if(!post) {
            return responseError(res, "Post not found", 404);
        }

        post.title = title;
        post.content = content;
        post.attachments = attachments;

        const validationError = post.validateSync();

        if (validationError) {
            const errors = formatValidationErrors(post.errors)
            return responseError(res, errors, 422);
        }

        await post.save();

        return responseSuccess(res, { post });
    } catch (error) {
        console.error("Error updating post:", error);
        return responseServerError(res, "Failed to update post.");
    }
}

export const deletePost = async (req, res, next) => {
    const id = req.params.id;
    const cleanedId = id.replace(/^:/, '');

    try {
        const post = await Post.findByIdAndDelete(cleanedId).populate('authorId');

        if (!post) {
            return responseError(res, "Post not found.", 404);
        }

        if (!post.authorId) {
            return responseError(res, "Author ID is missing in the post.", 500);
        }
        
        await User.findByIdAndUpdate(post.authorId, { $pull: { posts: post._id } });

        return responseSuccess(res, { message: "Post deleted successfully." });
    } catch (error) {
        console.error("Error deleting post:", error);
        return responseServerError(res, "Failed to delete post.");
    }
}
