const request = require('supertest');
const { app } = require('../index');
const MessageModel = require('../models/messageModel');
const ConversationModel = require('../models/conversationModel');
const UserModel = require('../models/userModel');
let chai, expect;

import('chai').then(module => {
  chai = module;
  expect = chai.expect;
  chai.should();
})

describe('Message Controller', () => {
    let user1, user2, conversation;

    beforeEach(async () => {
        // Create test users
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
        it('should send a message and create conversation', async () => {
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
    });

    describe('GET /api/messages/conversations/:googleid', () => {
        it('should get all conversations for a user', async () => {
            // Create a conversation first
            conversation = await ConversationModel.create({
                participants: [user1.googleid, user2.googleid]
            });

            const res = await request(app)
                .get(`/api/messages/conversations/${user1.googleid}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });
});