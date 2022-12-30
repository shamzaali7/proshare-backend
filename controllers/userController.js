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

router.delete("/:_id", async (req, res, next) => {
    try{
        const deleteProject = await UserModel.findByIdAndDelete(req.params._id)
        if(deleteProject){
            res.status(200).json(deleteProject)
        }else{
            res.status(404)
        }
    }catch(err){
        next(err)
    }
})

module.exports = router
