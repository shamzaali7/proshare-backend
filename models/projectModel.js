const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const commentSchema = new Schema({
    comment: String
})

const projectSchema = new Schema({
    title: String,
    github: String,
    deployedLink: String,
    picture: String,
    code: String,
    user: {type: String, ref: "userModel"},
    comments: [commentSchema]
})

module.exports = mongoose.model("Project", projectSchema)