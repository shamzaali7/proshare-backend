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

router.get("/:gid", async (req, res, next) => {
    try{
        const getUsersByGID = await UserModel.find({gid: req.params.gid})
        res.json(getUsersByGID)
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
        if (createUser){
            res.status(200).json(createUser)
        }else{
            res.sendStatus(404)
        }
    }catch(err){
        next(err)
    }
})

router.put("/", async(req, res, next) => {
    try{
        const updateUser = await UserModel.findOneAndUpdate(req.body.googleid, req.body, {new: true})
        if(updateUser){
            res.status(200).json(updateUser)
        }else{
            res.sendStatus(404)
        }
    }catch(err){
        next(err)
    }
})

router.delete("/:_id", async (req, res, next) => {
    try{
        const deleteUser = await UserModel.findByIdAndDelete(req.params._id)
        if(deleteUser){
            res.status(200).json(deleteUser)
        }else{
            res.status(404)
        }
    }catch(err){
        next(err)
    }
})

module.exports = router
