const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../index');
const ProjectModel = require('../models/projectModel');
const UserModel = require('../models/userModel');
const mongoose = require('mongoose');

describe('Project Controller', () => {

    afterEach(async () => {
        await ProjectModel.deleteMany();
        await UserModel.deleteMany();
    });

    describe('GET /api/projects', () => {
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
                comments: [],
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app).get('/api/projects');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /api/projects/:googleid', () => {
        it('should return projects by googleid', async () => {
            const project = new ProjectModel({
                title: 'Test Project',
                github: 'https://github.com/test',
                deployedLink: 'http://test.com',
                picture: 'test.png',
                gid: 'test_googleid',
                creator: 'test',
                comments: [],
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app).get(`/api/projects/${project.gid}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('POST /api/projects', () => {
        it('should create a new project', async () => {
            const user = new UserModel({
                googleid: 'test_googleid',
                name: 'Test User'
            });
            await user.save();

            const res = await request(app)
                .post('/api/projects')
                .send({
                    title: 'New Project',
                    github: 'https://github.com/newproject',
                    deployedLink: 'http://newproject.com',
                    picture: 'newproject.png',
                    gid: user.googleid,
                    creator: user.name,
                    backendRepo: 'https://backendrepo.com',
                    backendDeploy: 'https://backenddeploy.com',
                    comments: []
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'New Project');
        });
    });

    describe('PUT /api/projects', () => {
        it('should update an existing project', async () => {
            const project = new ProjectModel({
                title: 'Old Project',
                github: 'https://github.com/oldproject',
                deployedLink: 'http://oldproject.com',
                picture: 'oldproject.png',
                gid: 'test_googleid',
                creator: 'test',
                comments: [],
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app)
                .put('/api/projects')
                .send({ _id: project._id, title: 'Updated Project' });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'Updated Project');
        });
    });

    describe('DELETE /api/projects', () => {
        it('should delete an existing project', async () => {
            const project = new ProjectModel({
                title: 'Project to Delete',
                github: 'https://github.com/deleteproject',
                deployedLink: 'http://deleteproject.com',
                picture: 'deleteproject.png',
                gid: 'test_googleid',
                creator: 'test',
                comments: [],
                user: new mongoose.Types.ObjectId()
            });
            await project.save();

            const res = await request(app)
                .delete('/api/projects')
                .send({ _id: project._id });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'Project to Delete');
        });
    });
});
