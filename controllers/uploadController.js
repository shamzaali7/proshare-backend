const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post("/profile-picture", async (req, res, next) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const file = req.files.image;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ 
                error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" 
            });
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return res.status(400).json({ 
                error: "File too large. Maximum size is 5MB" 
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'proshare/profile-pictures',
                    transformation: [
                        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                        { quality: 'auto:good' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(file.data);
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });

    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ 
            error: "Failed to upload image",
            details: err.message 
        });
    }
});

router.post("/project-image", async (req, res, next) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const file = req.files.image;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ 
                error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" 
            });
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return res.status(400).json({ 
                error: "File too large. Maximum size is 10MB" 
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'proshare/project-images',
                    transformation: [
                        { width: 1200, crop: 'limit' },
                        { quality: 'auto:good' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(file.data);
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });

    } catch (err) {
        console.error("Error uploading project image:", err);
        res.status(500).json({ 
            error: "Failed to upload image",
            details: err.message 
        });
    }
});

router.delete("/image/:publicId", async (req, res, next) => {
    try {
        const publicId = req.params.publicId.replace(/_/g, '/');
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            res.json({ success: true, message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: "Image not found" });
        }
    } catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).json({ 
            error: "Failed to delete image",
            details: err.message 
        });
    }
});

module.exports = router;