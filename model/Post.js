import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        minlength: [10, "Title must have at least 10 letters"],
        maxlength: [60, "Title is too long"]
    },
    content: {
        type: String,
        required: [true, "Description is required!"],
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    attachments: {
        type: String
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    likesCount: {
        type: Number,
        default: 0,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],
    createdAt: {
        type : Date,
        default: Date.now
    }
});

export default mongoose.model("Post", postSchema);
