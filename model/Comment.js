import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema ({
    content: {
        type: String,
        required: [true, "Add a comment"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model('Comment', commentSchema);