const mongoose = require("../db/connection.js");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);