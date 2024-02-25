import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        minlength: [3, "Title must have at least 3 letters"],
        maxlength: [300, "Title is too long"]
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
    // tags: { type: String },
    // visibility: { type: String, enum: ['public', 'private', 'restricted'], default: 'public' },
});

postSchema.virtual('date').get(function() {
    const currentDate = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' }).split(',')[0];
    return currentDate;
});

postSchema.virtual('time').get(function() {
    const currentTime = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' }).split(',')[1].trim();
    return currentTime;
});

postSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = undefined; // Exclude 'id' from JSON
    }
});

export default mongoose.model("Post", postSchema);
