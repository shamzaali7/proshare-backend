const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../index');
const MessageModel = require('../models/messageModel');
const ConversationModel = require('../models/conversationModel');
const UserModel = require('../models/userModel');

describe('Message Controller', () => {
    let user1, user2;

    beforeEach(async () => {
        user1 = await UserModel.create({
            googleid: 'test_user_1',
            email: 'user1@test.com',
            name: 'Test User 1'
        });

        user2 = await UserModel.create({
            googleid: 'test_user_2',
            email: 'user2@test.com',
            name: 'Test User 2'
        });
    });

    afterEach(async () => {
        await MessageModel.deleteMany();
        await ConversationModel.deleteMany();
        await UserModel.deleteMany();
    });

    describe('POST /api/messages', () => {
        it('should send a message and create a conversation', async () => {
            const res = await request(app)
                .post('/api/messages')
                .send({
                    senderId: user1.googleid,
                    receiverId: user2.googleid,
                    senderName: user1.name,
                    text: 'Hello!'
                });

            expect(res.status).to.equal(201);
            expect(res.body.message.text).to.equal('Hello!');
            expect(res.body).to.have.property('conversationId');
        });

        it('should persist lastMessage on the conversation document after send', async () => {
            const res = await request(app)
                .post('/api/messages')
                .send({
                    senderId: user1.googleid,
                    receiverId: user2.googleid,
                    senderName: user1.name,
                    text: 'Persisted!'
                });

            expect(res.status).to.equal(201);

            // Verify the conversation document in MongoDB has the updated lastMessage
            const conv = await ConversationModel.findById(res.body.conversationId);
            expect(conv.lastMessage).to.exist;
            expect(conv.lastMessage.text).to.equal('Persisted!');
            expect(conv.lastMessage.senderId).to.equal(user1.googleid);
        });

        it('should overwrite lastMessage when a second message is sent', async () => {
            await request(app)
                .post('/api/messages')
                .send({ senderId: user1.googleid, receiverId: user2.googleid, senderName: user1.name, text: 'First' });

            const res = await request(app)
                .post('/api/messages')
                .send({ senderId: user2.googleid, receiverId: user1.googleid, senderName: user2.name, text: 'Second' });

            expect(res.status).to.equal(201);

            const conv = await ConversationModel.findById(res.body.conversationId);
            expect(conv.lastMessage.text).to.equal('Second');
            expect(conv.lastMessage.senderId).to.equal(user2.googleid);
        });
    });

    describe('GET /api/messages/conversations/:googleid', () => {
        it('should return all conversations for a user', async () => {
            await ConversationModel.create({
                participants: [user1.googleid, user2.googleid]
            });

            const res = await request(app)
                .get(`/api/messages/conversations/${user1.googleid}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return lastMessage text and lastMessageSenderId after a message is sent', async () => {
            await request(app)
                .post('/api/messages')
                .send({ senderId: user1.googleid, receiverId: user2.googleid, senderName: user1.name, text: 'Hey there' });

            const res = await request(app)
                .get(`/api/messages/conversations/${user1.googleid}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').with.length(1);
            expect(res.body[0].lastMessage).to.equal('Hey there');
            expect(res.body[0].lastMessageSenderId).to.equal(user1.googleid);
        });

        it('should update lastMessage preview when a second message is sent', async () => {
            await request(app)
                .post('/api/messages')
                .send({ senderId: user1.googleid, receiverId: user2.googleid, senderName: user1.name, text: 'First msg' });

            await request(app)
                .post('/api/messages')
                .send({ senderId: user2.googleid, receiverId: user1.googleid, senderName: user2.name, text: 'Reply msg' });

            const res = await request(app)
                .get(`/api/messages/conversations/${user1.googleid}`);

            expect(res.body[0].lastMessage).to.equal('Reply msg');
            expect(res.body[0].lastMessageSenderId).to.equal(user2.googleid);
        });
    });
});
