const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const userSchema = new Schema({
    googleid: String,
    email: String,
    name: String,
    profilePicture: String,
    firstName: String,
    lastName: String
})

module.exports = mongoose.model("User", userSchema)