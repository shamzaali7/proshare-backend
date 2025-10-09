const request = require('supertest');
const app = require('../index'); // Assuming the entry point of your application is index.js
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let chai, expect;
import('chai').then(module => {
  chai = module;
  expect = chai.expect;
  chai.should();
})

describe('Project Controller', () => {

    // Clean up the database after tests
    afterEach(async () => {
        await ProjectModel.deleteMany();
        await UserModel.deleteMany();
    });

    describe('GET /', () => {
        it('should return all projects', async () => {
            const project = new ProjectModel({
                title: 'Test Project',
                github: 'https://github.com/test',
                deployedLink: 'http://test.com',
                picture: 'test.png',
                gid: 'test',
                creator: 'test',
                backendRepo: 'https://backendrepo.com',
                backendDeploy: 'https://backenddeploy.com',
                comments: 'test comments',
                user: new mongoose.Types.ObjectId()
            });
            await project.save();
            const res = await request(app)
                .get('/projects');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /:googleid', () => {
        it('should return projects by googleid', async () => {
            const project = new ProjectModel({
                title: 'Test Project',
                github: 'https://github.com/test',
                deployedLink: 'http://test.com',
                picture: 'test.png',
                gid: 'test_googleid',
                creator: 'test',
                backendRepo: 'https://backendrepo.com',
                backendDeploy: 'https://backenddeploy.com',
                comments: 'test comments',
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app)
                .get(`/projects/${project.gid}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('POST /', () => {
        it('should create a new project', async () => {
            const user = new UserModel({
                googleid: 'test_googleid',
                name: 'Test User'
            });
            await user.save();

            const res = await request(app)
                .post('/projects')
                .send({
                    title: 'New Project',
                    github: 'https://github.com/newproject',
                    deployedLink: 'http://newproject.com',
                    picture: 'newproject.png',
                    gid: user.googleid,
                    creator: user.name,
                    backendRepo: 'https://backendrepo.com',
                    backendDeploy: 'https://backenddeploy.com',
                    comments: 'New project comments',
                    user: new mongoose.Types.ObjectId()
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'New Project');
        });
    });

    describe('PUT /', () => {
        it('should update an existing project', async () => {
            const project = new ProjectModel({
                title: 'Old Project',
                github: 'https://github.com/oldproject',
                deployedLink: 'http://oldproject.com',
                picture: 'oldproject.png',
                gid: 'test_googleid',
                creator: 'test',
                backendRepo: 'https://backendrepo.com',
                backendDeploy: 'https://backenddeploy.com',
                comments: 'Old project comments',
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app)
                .put('/projects')
                .send({
                    _id: project._id,
                    title: 'Updated Project'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'Updated Project');
        });
    });

    describe('DELETE /', () => {
        it('should delete an existing project', async () => {
            const project = new ProjectModel({
                title: 'Project to Delete',
                github: 'https://github.com/deleteproject',
                deployedLink: 'http://deleteproject.com',
                picture: 'deleteproject.png',
                gid: 'test_googleid',
                creator: 'test',
                backendRepo: 'https://backendrepo.com',
                backendDeploy: 'https://backenddeploy.com',
                comments: 'Project to delete comments',
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app)
                .delete('/projects')
                .send({
                    _id: project._id
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'Project to Delete');
        });
    });
});