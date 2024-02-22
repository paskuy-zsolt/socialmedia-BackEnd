import mongoose from "mongoose";

const { Schema } = mongoose;

const loginToken = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    }
});

export default mongoose.model("LoginToken", loginToken);