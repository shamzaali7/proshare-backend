const express = require("express")
const router = express.Router()
const MessageModel = require("../models/messageModel")
const ConversationModel = require("../models/conversationModel")
const UserModel = require("../models/userModel")

// Get all conversations for a user
router.get("/conversations/:googleid", async (req, res, next) => {
    try {
        const { googleid } = req.params
        
        const conversations = await ConversationModel.find({
            participants: googleid
        }).sort({ updatedAt: -1 })
        
        res.status(200).json(conversations)
    } catch (err) {
        next(err)
    }
})

// Get specific conversation with messages
router.get("/conversation/:conversationId", async (req, res, next) => {
    try {
        const { conversationId } = req.params
        
        const conversation = await ConversationModel.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }
        
        const messages = await MessageModel.find({
            conversationId: conversationId
        }).sort({ timestamp: 1 })
        
        res.status(200).json({
            conversation,
            messages
        })
    } catch (err) {
        next(err)
    }
})

// Create or get conversation between two users
router.post("/conversation/start", async (req, res, next) => {
    try {
        const { userId1, userId2 } = req.body
        
        if (!userId1 || !userId2) {
            return res.status(400).json({ error: "Both user IDs are required" })
        }
        
        // Check if conversation already exists
        let conversation = await ConversationModel.findOne({
            participants: {
                $all: [userId1, userId2]
            }
        })
        
        if (conversation) {
            return res.status(200).json(conversation)
        }
        
        // Get user details
        const user1 = await UserModel.findOne({ googleid: userId1 })
        const user2 = await UserModel.findOne({ googleid: userId2 })
        
        if (!user1 || !user2) {
            return res.status(404).json({ error: "One or both users not found" })
        }
        
        // Create new conversation
        const newConversation = await ConversationModel.create({
            participants: [userId1, userId2],
            participantDetails: [
                {
                    googleid: user1.googleid,
                    name: user1.name,
                    email: user1.email,
                    profilePicture: user1.profilePicture
                },
                {
                    googleid: user2.googleid,
                    name: user2.name,
                    email: user2.email,
                    profilePicture: user2.profilePicture
                }
            ],
            lastMessage: "",
            lastMessageTime: new Date()
        })
        
        res.status(200).json(newConversation)
    } catch (err) {
        next(err)
    }
})

// Send a message
router.post("/send", async (req, res, next) => {
    try {
        const { conversationId, senderId, senderName, text } = req.body
        
        if (!conversationId || !senderId || !text) {
            return res.status(400).json({ 
                error: "conversationId, senderId, and text are required" 
            })
        }
        
        // Create message
        const newMessage = await MessageModel.create({
            conversationId,
            senderId,
            senderName,
            text,
            timestamp: new Date()
        })
        
        // Update conversation's last message
        await ConversationModel.findByIdAndUpdate(
            conversationId,
            {
                lastMessage: text,
                lastMessageTime: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        )
        
        res.status(200).json(newMessage)
    } catch (err) {
        next(err)
    }
})

// Mark messages as read
router.put("/read", async (req, res, next) => {
    try {
        const { conversationId, userId } = req.body
        
        if (!conversationId || !userId) {
            return res.status(400).json({ 
                error: "conversationId and userId are required" 
            })
        }
        
        // Mark all messages in conversation as read (that aren't from the user)
        const result = await MessageModel.updateMany(
            {
                conversationId,
                senderId: { $ne: userId }
            },
            { read: true }
        )
        
        res.status(200).json({
            message: "Messages marked as read",
            modifiedCount: result.modifiedCount
        })
    } catch (err) {
        next(err)
    }
})

// Delete a message
router.delete("/:messageId", async (req, res, next) => {
    try {
        const { messageId } = req.params
        
        const deletedMessage = await MessageModel.findByIdAndDelete(messageId)
        
        if (!deletedMessage) {
            return res.status(404).json({ error: "Message not found" })
        }
        
        res.status(200).json(deletedMessage)
    } catch (err) {
        next(err)
    }
})

module.exports = router