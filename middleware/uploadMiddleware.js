import dotenv from "dotenv";
dotenv.config();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import sharp from "sharp";

// Set up AWS S3 config
export const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const storage = multer.memoryStorage();

// Multer-S3 configuration
export const uploadProfileImage = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    }
}).single("avatar");

export const resizeAndUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const resizedImageBuffer = await sharp(req.file.buffer)
            .resize(55, 55)
            .toBuffer();

        const fileKey = `profile/users/${Date.now().toString()}-${req.file.originalname}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: resizedImageBuffer,
            ContentType: req.file.mimetype
        }));

        req.file.location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileKey}`;

        next();
    } catch (error) {
        console.error("Image processing error:", error);
        res.status(500).json({ message: "Error processing image" });
    }
};