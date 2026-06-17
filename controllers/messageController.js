const express = require("express");
const router = express.Router();
const MessageModel = require('../models/messageModel');
const ConversationModel = require('../models/conversationModel');
const UserModel = require('../models/userModel');

// Get all conversations for a user
router.get("/conversations/:googleid", async (req, res, next) => {
    try {
        const { googleid } = req.params;
        
        // Find all conversations where user is a participant
        const conversations = await ConversationModel.find({
            participants: googleid
        }).sort({ updatedAt: -1 });

        // Get participant details and unread count for each conversation
        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conversation) => {
                const otherParticipantId = conversation.participants.find(
                    p => p !== googleid
                );
                
                const otherParticipant = await UserModel.findOne({ 
                    googleid: otherParticipantId 
                });

                // Count unread messages
                const unreadCount = await MessageModel.countDocuments({
                    conversationId: conversation._id,
                    senderId: { $ne: googleid },
                    read: false
                });

                // Always read the latest message directly from the Message collection.
                // This is the source of truth — the cached lastMessage field on the
                // Conversation document can fall out of sync (e.g. after a timeout),
                // so we don't rely on it for display purposes.
                const latestMsg = await MessageModel.findOne({ conversationId: conversation._id })
                    .sort({ createdAt: -1 })
                    .select('text senderId createdAt');

                const lastMsgText = latestMsg?.text || conversation.lastMessage?.text || "";
                const lastMsgSenderId = latestMsg?.senderId || conversation.lastMessage?.senderId || "";
                const lastMsgTime = latestMsg?.createdAt || conversation.lastMessage?.timestamp || conversation.updatedAt;

                // Keep the cache in sync as a background write (best-effort).
                if (latestMsg && latestMsg.text !== conversation.lastMessage?.text) {
                    ConversationModel.findByIdAndUpdate(conversation._id, {
                        $set: {
                            lastMessage: {
                                text: latestMsg.text,
                                senderId: latestMsg.senderId,
                                timestamp: latestMsg.createdAt
                            }
                        }
                    }).catch(() => {});
                }

                return {
                    id: conversation._id,
                    participant: otherParticipant || {
                        googleid: otherParticipantId,
                        name: "Unknown User",
                        email: ""
                    },
                    lastMessage: lastMsgText,
                    lastMessageSenderId: lastMsgSenderId,
                    lastMessageTime: lastMsgTime,
                    unreadCount
                };
            })
        );

        res.json(conversationsWithDetails);
    } catch (err) {
        console.error("Error getting conversations:", err);
        next(err);
    }
});

// Get messages for a specific conversation
router.get("/conversation/:conversationId", async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        
        const messages = await MessageModel.find({ 
            conversationId 
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("Error getting messages:", err);
        next(err);
    }
});

// Send a new message
router.post("/", async (req, res, next) => {
    try {
        const { senderId, receiverId, senderName, text } = req.body;

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({ 
                error: "Missing required fields: senderId, receiverId, text" 
            });
        }

        // Find or create conversation
        const conversation = await ConversationModel.findOrCreate(
            senderId, 
            receiverId
        );

        // Create message
        const message = await MessageModel.create({
            conversationId: conversation._id,
            senderId,
            senderName,
            text,
            read: false
        });

        // Update conversation's last message atomically
        // Using findByIdAndUpdate instead of save() to avoid Mongoose nested-object
        // change-tracking issues that can silently skip the write.
        await ConversationModel.findByIdAndUpdate(conversation._id, {
            $set: {
                lastMessage: {
                    text,
                    senderId,
                    timestamp: message.createdAt
                },
                updatedAt: new Date()
            }
        });

        res.status(201).json({
            message,
            conversationId: conversation._id
        });
    } catch (err) {
        console.error("Error sending message:", err);
        next(err);
    }
});

// Mark messages as read
router.put("/read", async (req, res, next) => {
    try {
        const { conversationId, userId } = req.body;

        await MessageModel.updateMany(
            {
                conversationId,
                senderId: { $ne: userId },
                read: false
            },
            {
                read: true
            }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error marking messages as read:", err);
        next(err);
    }
});

// Delete a conversation
router.delete("/conversation/:conversationId", async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        // Delete all messages in the conversation
        await MessageModel.deleteMany({ conversationId });
        
        // Delete the conversation
        const deletedConversation = await ConversationModel.findByIdAndDelete(
            conversationId
        );

        if (deletedConversation) {
            res.json({ success: true, deletedConversation });
        } else {
            res.status(404).json({ error: "Conversation not found" });
        }
    } catch (err) {
        console.error("Error deleting conversation:", err);
        next(err);
    }
});

module.exports = router;