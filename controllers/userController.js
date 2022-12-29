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

router.post("/", async (req, res, next) => {
    try{
        const createUser = await UserModel.create({
            googleid: req.body.googleid,
            email: req.body.email,
            name: req.body.name
        })
    }catch(err){
        next(err)
    }
})



module.exports = router
