const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const fetchUser = require('../middleware/fetchUser')
//config file .env.local
const JWT_SECRET = "ANIME"

// ROUTE 1: Create a User using: POST "/api/auth/createuser" Doesnt require Auth No Login Required
//Express-validator
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 5 }).withMessage('Invalid Username'),
    body("email").isEmail().notEmpty().withMessage('Not a valid e-mail address'),
    body("password").isLength({ min: 5 }).withMessage('Not a valid Password, must be atleast 5 characters'),
  ],
  async(req, res) => {
    let success=false
    //if there are errors, return bad request and the errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({errors: error.array()});
    }
    //check whether the user with this email exists already
    try {let user = await User.findOne({email:req.body.email})
    if (user) {
      return res.status(400).json({success, error:"A user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password,salt)
    //create a new user
    user = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPass,
    })
    const data = {
      user:{
        id:user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET)
    success=true
    res.json({success,authtoken})}
    catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server Error")
    }
  }
  
);

//ROUTE 2: Authenticate a user using: POST "/api/auth/login"  require Auth No Login Required
router.post(
  "/login",
  [
    body("email").isEmail().notEmpty().withMessage('Not a valid e-mail address'),
    body("password").notEmpty().withMessage('Not a valid Password, must be atleast 5 characters'),
  ],
  async(req, res) => {
     //if there are errors, return bad request and the errors
     let success=false
     const result = validationResult(req);
     if (!result.isEmpty()) {
       return res.status(400).json({errors: error.array()});
     }
     const {email,password} = req.body
     try {
      let user = await User.findOne({email})
      if(!user){
        return res.status(400).json({error: "Please login with correct credentials"})
      }
      const passwordcompare = bcrypt.compare(password,user.password)
      if(!passwordcompare){
        
        return res.status(400).json({success,error: "Please login with correct credentials"})
      }
      const data = {
        user:{
          id:user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET)
      success=true
      res.json({success, authtoken})
     } catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server Error")
     }
  })

  //ROUTE 3: Get Loggedin User Details using: POST "/api/auth/getUser"  require Auth  Login Required
  router.post(
    "/getUser",fetchUser,
    async(req, res) => {
        //if there are errors, return bad request and the errors
     const result = validationResult(req);
     if (!result.isEmpty()) {
       return res.status(400).json({errors: error.array()});
     }
  try {
   const userid = req.user.id
    const user = await User.findById(userid).select("-password")
    res.json({user})
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server Error")
  }
})
module.exports = router;
