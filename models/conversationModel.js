const mongoose = require("../db/connection.js");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: String,
        required: true
    }],
    lastMessage: {
        text: String,
        senderId: String,
        timestamp: Date
    },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

conversationSchema.index({ participants: 1 });

conversationSchema.statics.findOrCreate = async function(user1Id, user2Id) {
    let conversation = await this.findOne({
        participants: { $all: [user1Id, user2Id] }
    });

    if (!conversation) {
        conversation = await this.create({
            participants: [user1Id, user2Id]
        });
    }

    return conversation;
};

module.exports = mongoose.model("Conversation", conversationSchema);