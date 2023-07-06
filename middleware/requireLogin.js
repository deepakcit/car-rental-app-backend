const {JWT_SECRET} = require("../keys")
// const JWT_SECRET="avbgdfr";

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const Agency = mongoose.model("Agency")
module.exports = (req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization){
        return res.status(401).json({error:"you must be logged in first"})
    }
    const token = authorization.replace("Bearer ","")
    // console.log(token)
    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err){
            // console.log(err)
            return res.status(401).json({error:"You must be logged in first"})
        }
        const {_id} = payload
        Agency.findById(_id)
        .then(userData=>{
            req.user = userData//this req.user will have our uerdata ex email name,email,id 
            // console.log(userData)
            next()
        })
    })
}