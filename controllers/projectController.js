const express = require("express")
const router = express.Router()
const projectModel = require('../models/projectModel')
  
router.get("/", async (req, res, next) => {
    try{
        const getProjects = await projectModel.find({})
        res.json(getProjects)
    }catch(err){
        next(err)
    }
})



module.exports = router
