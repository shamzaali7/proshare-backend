const express = require("express")
const router = express.Router()
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage")
const UserModel = require("../models/userModel")
const mongoose = require("../db/connection.js")
const path = require("path")
const crypto = require("crypto")

// Set up GridFS storage
const storage = new GridFsStorage({
    url: process.env.NODE_ENV === "production" 
        ? process.env.DB_URL 
        : "mongodb://localhost/Proshare",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err)
                }
                const filename = buf.toString("hex") + path.extname(file.originalname)
                const fileInfo = {
                    filename: filename,
                    bucketName: "profile_pictures"
                }
                resolve(fileInfo)
            })
        })
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Invalid file type. Only images are allowed."))
        }
    }
})

// Upload profile picture
router.post("/profile-picture/:userId", upload.single("profilePicture"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        const { userId } = req.params
        const fileId = req.file.id.toString()
        const filename = req.file.filename
        
        // Construct the download URL
        const imageUrl = `/api/files/${fileId}`

        // Update user's profile picture
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { new: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({
            message: "Profile picture uploaded successfully",
            user: updatedUser,
            fileId: fileId,
            filename: filename
        })
    } catch (err) {
        next(err)
    }
})

// Get file by ID (for serving uploaded images)
router.get("/:fileId", async (req, res, next) => {
    try {
        const { fileId } = req.params

        // Convert fileId to MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(fileId)

        // Get GridFS bucket
        const db = mongoose.connection.db
        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: "profile_pictures"
        })

        // Check if file exists
        const files = await db.collection("profile_pictures.files").find({ _id: objectId }).toArray()
        
        if (!files || files.length === 0) {
            return res.status(404).json({ error: "File not found" })
        }

        res.set("Content-Type", files[0].contentType || "image/jpeg")
        
        bucket.openDownloadStream(objectId).pipe(res)
    } catch (err) {
        next(err)
    }
})

// Delete file by ID
router.delete("/:fileId/:userId", async (req, res, next) => {
    try {
        const { fileId, userId } = req.params

        // Convert fileId to MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(fileId)

        // Get GridFS bucket
        const db = mongoose.connection.db
        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: "profile_pictures"
        })

        // Delete file
        await bucket.delete(objectId)

        // Update user to remove profilePicture reference
        await UserModel.findByIdAndUpdate(
            userId,
            { profilePicture: null },
            { new: true }
        )

        res.status(200).json({ message: "File deleted successfully" })
    } catch (err) {
        next(err)
    }
})

module.exports = router