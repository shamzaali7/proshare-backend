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


