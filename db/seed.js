const mongoose = require("./connection")
const Project = require("../models/projectModel")
const User = require("../models/userModel")
const Conversation = require("../models/conversationModel")
const Message = require("../models/messageModel")
const projectSeed = require("./projectSeed.json")
const userSeed = require("./userSeed.json")

Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({})
]).then(() => {
    console.log("Database cleared");
    
    // Seed users
    userSeed.forEach(user => {
        User.create({
            googleid: user.googleid,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture
        }).then(res => console.log("User created:", res.name))
        .catch((err) => console.log("Error creating user:", err))
    })

    // Seed projects
    projectSeed.forEach(async (projectData, i) => {
        try {
            const project = await Project.create({
                title: projectData.title,
                github: projectData.github,
                deployedLink: projectData.deployedLink,
                picture: projectData.picture,
                code: projectData.code,
                comments: projectData.comments,
                gid: projectData.gid,
                creator: projectData.creator,
                backendRepo: projectData.backendRepo,
                backendDeploy: projectData.backendDeploy
            });
            
            const newProjectUser = await User.findOne({googleid : project.gid});
            if (newProjectUser) {
                project.user = newProjectUser._id;
                await project.save();
                console.log("Project created:", project.title);
            }
        } catch(err) {
            console.log("Error creating project:", err);
        }
    });
    
    console.log("Seeding complete");
}).catch(err => {
    console.log("Error in seeding:", err);
});