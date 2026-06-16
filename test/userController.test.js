const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../index.js');

describe('User Controller', () => {
    let createdUser;

    it('should return all users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).to.equal(200);
        expect(Array.isArray(response.body)).to.equal(true);
    });

    it('should create a new user', async () => {
        const newUser = {
            googleid: 'test-googleid-' + Date.now(),
            email: 'testuser@example.com',
            name: 'Test User',
            profilePicture: '',
            firstName: 'Test',
            lastName: 'User'
        };

        const response = await request(app).post('/api/users').send(newUser);
        expect(response.status).to.equal(200);
        expect(response.body.googleid).to.equal(newUser.googleid);

        createdUser = {
            id: response.body._id,
            googleid: response.body.googleid
        };
    });

    it('should return a user by googleid', async () => {
        const response = await request(app).get(`/api/users/${createdUser.googleid}`);
        expect(response.status).to.equal(200);
        expect(response.body[0].googleid).to.equal(createdUser.googleid);
    });

    it('should update an existing user', async () => {
        const updatedUser = {
            _id: createdUser.id,
            email: 'updated@example.com',
            name: 'Updated User'
        };

        const response = await request(app).put('/api/users').send(updatedUser);
        expect(response.status).to.equal(200);
        expect(response.body.email).to.equal(updatedUser.email);
    });

    it('should delete an existing user', async () => {
        const response = await request(app).delete(`/api/users/${createdUser.id}`);
        expect(response.status).to.equal(200);
        expect(response.body._id).to.equal(createdUser.id);
    });
});