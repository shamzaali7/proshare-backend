const express = require("express")
const router = express.Router()
const projectModel = require('../models/projectModel')
const userModel = require("../models/userModel")
  
router.get("/", async (req, res, next) => {
    try{
        const getProjects = await projectModel.find({})
        res.json(getProjects)
    }catch(err){
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    try{
        const user = await userModel.findOne({googleid: req.body.gid})
        const createProject = await projectModel.create({
            title: req.body.title,
            github: req.body.github,
            deployedLink: req.body.deployedLink,
            picture: req.body.picture,
            code: req.body.code,
            gid: req.body.gid,
            comments: req.body.comments,
            user: user._id
        })
        res.status(200).json(createProject)
    }catch(err){
        next(err)
    }
})

router.put("/:_id", async(req, res, next) => {
    try{
        const updateProject = await projectModel.findOneAndUpdate(req.params._id, req.body, {new: true})
        if(updateProject){
            res.status(200).json(updateProject)
        }else{
            res.sendStatus(404)
        }
    }catch(err){
        next(err)
    }
})

router.delete("/:_id", async (req, res, next) => {
    try{
        const deleteProject = await projectModel.findByIdAndDelete(req.params._id)
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
