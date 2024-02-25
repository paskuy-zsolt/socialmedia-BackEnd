import Post from "../model/Post.js";
import Comment from "../model/Comment.js";
import { filterDirtyWords } from '../utils/dirtyWords.js';
import { formatValidationErrors } from "../utils/validationUtils.js";
import { responseError, responseServerError, responseSuccess } from "../utils/responseUtils.js";

export const getCommentsFromPost = async (req, res, next) => {
    const postId = req.params.postId.replace(/^:/, '');

    try {
        const comments = await Comment.find({ post: postId });

        if (!comments || comments.length === 0) {
            return responseError(res, "Comments not found for this post.", 404);
        }
        
        return responseSuccess(res, { comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return responseServerError(res, "Failed to fetch comments.");
    }
};

export const addComment = async (req, res, next) => {
    const postId = req.params.postId.replace(/^:/, '');
    const userId = req.user._id;
    let { content: originalContent } = req.body;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return responseError(res, "Post not found.", 404);
        }

        const content = filterDirtyWords(originalContent);
        const comment = new Comment({ 
            user: userId, 
            content,
            post: post._id
        });

        const validationError = comment.validateSync();

        if (validationError) {
            const errors = formatValidationErrors(validationError.errors);
            return responseError(res, errors, 422);
        }

        await comment.save();

        post.comments.push(comment);
        await post.save();

        return responseSuccess(res, { comment } );
    } catch (error) {
        console.error("Error adding comment:", error);
        return responseServerError(res, "Failed to update comment.");
    }
};

export const deleteComment = async (req, res, next) => {
    const postId = req.params.postId.replace(/^:/, '');
    const commentId = req.params.commentId.replace(/^:/, '');

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return responseError(res, "Post not found.", 404);
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return responseError(res, "Comment not found.", 404);
        }

        await Comment.findByIdAndDelete(commentId);

        const index = post.comments.findIndex(c => c.toString() === commentId);

        if (index !== -1) {
            post.comments.splice(index, 1);

            await post.save();
        }

        return responseSuccess(res, { message: "Comment deleted successfully." });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return responseServerError(res, "Failed to delete comment.");
    }
};