import mongoose from "mongoose";
import User from "../model/User.js";
import Post from "../model/Post.js";
import { responseSuccess, responseError, responseServerError } from "../utils/responseUtils.js";
import { formatValidationErrors } from "../utils/validationUtils.js";

export const getAllPosts = async (req, res, next) => {
    try {
        // Extract page and limit from query parameters, set default values if not provided
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Calculate how many posts to skip
        const skip = (page - 1) * limit;

        // Find posts, populate comments, and apply pagination
        let posts = await Post.find()
            .populate('comments')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by date created (newest first)

        // Count total number of posts for calculating total pages
        const totalPosts = await Post.countDocuments();

        // Return paginated posts with totalPages and currentPage info
        return responseSuccess(res, {
            message: posts.length ? "Posts fetched successfully." : "No posts available.",
            posts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page,
        });
    } catch (error) {
        return responseServerError(res, "Failed to fetch posts.");
    }
};

export const getPostById = async (req, res, next) => {
    const postId = req.params.postId.replace(/^:/, '');

    try {
        const post = await Post.findById(postId);

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
        await post.validate();
    } catch (validationError) {
        const errors = formatValidationErrors(validationError.errors);
        return responseError(res, errors, 422);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {        
        await post.save({ session });

        user.posts.push(post);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        return responseSuccess(res, { post });
    } catch (error) {
        console.error("Error while creating post:", error);
        await session.abortTransaction();
        session.endSession();
        return responseServerError(res, "Failed to create post.");
    }
}

export const getByUserId = async (req, res, next) => {
    const userId = req.params.userId.replace(/^:/, '');

    try {
        const userPost = await User.findById(userId).populate("posts");
        
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
    const postId = req.params.postId.replace(/^:/, '');

    let post

    try {
        post = await Post.findById(postId);

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
    const postId = req.params.postId.replace(/^:/, '');

    try {
        const post = await Post.findByIdAndDelete(postId).populate('authorId');

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

export const likedPost = async (req, res, next) => {
    const postId = req.params.postId.replace(/^:/, '');
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if(!post) {
            return responseError(res, "Post not found.", 404);
        }

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            post.likesCount += 1;
        } else {
            const index = post.likes.indexOf(userId);
            post.likes.splice(index, 1);
            post.likesCount -= 1;
        }
        
        await post.save();

        return responseSuccess(res, post);
    } catch (error) {
        console.error('Error liking/disliking post:', error);
        return responseServerError(res, "Failed to like/dislike post.");
    }
}