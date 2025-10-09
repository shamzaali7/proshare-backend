const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const conversationSchema = new Schema({
    participants: [{
        type: String, // googleid of participants
        required: true
    }],
    participantDetails: [{
        googleid: String,
        name: String,
        email: String,
        profilePicture: String
    }],
    lastMessage: String,
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model("Conversation", conversationSchema)