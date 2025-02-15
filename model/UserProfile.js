import mongoose from 'mongoose';

export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const { Schema } = mongoose;

const userProfileSchema = new Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: [true, "Name is required!"],
    minlength: [3, "Name must have at least 3 letters"],
    maxlength: [200, "Name is too long"]
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
  avatar: {
    type: String,
    default: "",
    required: false
  },
  username: {
    type: String,
    trim: true,
    maxlength: [50, "Nickname is too long"],
    required: false, 
},
  phone: {
    type: String,
    match: [phoneRegex, "Phone number must follow E.164 format (+123456789)"],
    required: false
  },
  description: {
    type: String,
    maxlength: [500, "Description is too long"],
    required: false
  },
}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);