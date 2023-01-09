const express = require("express")
const router = express.Router()
const ProjectModel = require('../models/projectModel')
const UserModel = require("../models/userModel")
  
router.get("/", async (req, res, next) => {
    try{
        const getProjects = await ProjectModel.find({})
        res.json(getProjects)
    }catch(err){
        next(err)
    }
})

router.get("/:googleid", async (req, res, next) => {
    try{
        const getProjectsByGID = await ProjectModel.find({gid: req.params.googleid})
        res.json(getProjectsByGID)
    }catch(err){
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    try{
        const user = await UserModel.find({googleid: req.body.gid})
        const createProject = await ProjectModel.create({
            title: req.body.title,
            github: req.body.github,
            deployedLink: req.body.deployedLink,
            picture: req.body.picture,
            gid: req.body.gid,
            creator: req.body.creator,
            backendRepo: req.body.backendRepo,
            backendDeploy: req.body.backendDeploy,
            comments: req.body.comments,
            user: user._id
        })
        res.status(200).json(createProject)
    }catch(err){
        next(err)
    }
})

router.put("/", async(req, res, next) => {
    try{
        const updateProject = await ProjectModel.findByIdAndUpdate(req.body._id, req.body, {new: true})
        if(updateProject){
            res.status(200).json(updateProject)
        }else{
            res.sendStatus(404)
        }
    }catch(err){
        next(err)
    }
})

router.delete("/", async (req, res, next) => {
    try{
        const deleteProject = await ProjectModel.findByIdAndDelete(req.body._id)
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
