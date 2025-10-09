const request = require('supertest');
const app = require('../index.js'); // Import your express app
let chai, expect;
import('chai').then(module => {
  chai = module;
  expect = chai.expect;
  chai.should();
})

describe('User Controller', () => {
    let createdUser;

    // Test for GET /users
    it('should return all users', async () => {
        const response = await request(app).get('/users');
        expect(response.status).to.equal(200);
        expect(Array.isArray(response.body)).to.equal(true);
    });

    // Test for POST /users
    it('should create a new user', async () => {
        const newUser = {
            googleid: 'newgoogleid',
            email: 'newemail@example.com',
            name: 'New User',
            profilePicture: 'newprofilepicture.jpg',
            firstName: 'New',
            lastName: 'User'
        };

        const response = await request(app).post('/users').send(newUser);
        expect(response.status).to.equal(200);
        expect(response.body.googleid).to.equal(newUser.googleid);

        createdUser = {
            id: response.body._id, 
            googleid: response.body.googleid
        }; // Store the created user's ID for future tests
    });

    // Test for GET /users/:googleid
    it('should return a user by googleid', async () => {
        const response = await request(app).get(`/users/${createdUser.googleid}`);
        expect(response.status).to.equal(200);
        expect(response.body[0].googleid).to.equal(createdUser.googleid);
    });

    // Test for PUT /users
    it('should update an existing user', async () => {
        const updatedUser = {
            _id: createdUser.id,
            email: 'updatedemail@example.com',
            name: 'Updated User'
        };

        const response = await request(app).put('/users').send(updatedUser);
        expect(response.status).to.equal(200);
        expect(response.body.email).to.equal(updatedUser.email);
    });

    // Test for DELETE /users/:_id
    it('should delete an existing user', async () => {
        const response = await request(app).delete(`/users/${createdUser.id}`);
        expect(response.status).to.equal(200);
        expect(response.body._id).to.equal(createdUser.id);
    });
});