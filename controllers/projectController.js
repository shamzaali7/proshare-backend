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
            user: user._id
        })
        res.status(200).json(createProject)
    }catch(err){
        next(err)
    }
})

module.exports = router
