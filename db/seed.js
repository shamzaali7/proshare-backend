const mongoose = require("./connection")
const Project = require("../models/projectModel")
const User = require("../models/userModel")
const projectSeed = require("./projectSeed.json")
const userSeed = require("./userSeed.json")

User.deleteMany({}).then(() => {
    userSeed.forEach(user => {
        User.insertMany({
            googleid: user.googleid,
            email: user.email,
            name: user.name
        }).then(res => console.log(res))
        .then((err) => console.log(err))
    })
})

Project.deleteMany({}).then(async () => {
    for(i=0; i<projectSeed.length; i++){
        Project.create({
            title: projectSeed[i].title,
            github: projectSeed[i].github,
            deployedLink: projectSeed[i].deployedLink,
            picture: projectSeed[i].picture,
            code: projectSeed[i].code,
            comments: projectSeed[i].comments,
            gid: projectSeed[i].gid,
        }, 
        async function (err, res){
            const newProjectUser = await User.findOne({googleid : res.gid});
            res.user = newProjectUser._id;
            await res.save();
        })
}})
