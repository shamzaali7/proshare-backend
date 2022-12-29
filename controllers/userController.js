const express = require("express")
const router = express.Router()
const UserModel = require('../models/userModel')

router.get("/", async (req, res, next) => {
    try{
        const getUsers = await UserModel.find({})
        res.json(getUsers)
    }catch(err){
        next(err)
    }
})

module.exports = router
