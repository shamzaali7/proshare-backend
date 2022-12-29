const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: String,
    name: String,
    projects: [projectSchema]
})

module.exports = mongoose.model("User", userSchema)