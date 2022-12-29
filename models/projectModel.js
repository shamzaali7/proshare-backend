const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const projectSchema = new Schema({
    title: String,
    github: String,
    deployedLink: String,
    picture: String,
    code: String,
    gid: String,
    comments: [String],
    user: {type: mongoose.Types.ObjectId, ref: "userModel"}
})

module.exports = mongoose.model("Project", projectSchema)