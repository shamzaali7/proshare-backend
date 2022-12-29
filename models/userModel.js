const mongoose = require("../db/connection.js")
const Schema = mongoose.Schema

const userSchema = new Schema({
    googleID: String,
    email: String,
    name: String,
})

module.exports = mongoose.model("User", userSchema)