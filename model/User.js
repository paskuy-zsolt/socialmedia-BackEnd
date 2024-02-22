import mongoose from "mongoose";

export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const { Schema } = mongoose;

const userSchema = new Schema ({
    name: {
        type: String,
        required: [true, "Username is required!"],
        minlength: [3, "Username must have at least 3 letters"],
        maxlength: [200, "Username is too long"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required!"],
        maxlength: [100, "Email is too long"],
        match: [emailRegex, "The email format is not supported"],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Enter a password"],
        minlength: [8, "The password is too short, must have at least 8 characters"],
        maxlength: [120, "The password is too long"]
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: "Post",
        required: true
    }]
})

export default mongoose.model("User", userSchema);