const express=require("express");
const { createFaculty } = require("../Controllers/facultycontroller");
const router=express.Router();

// jwt

router.post('/register',createFaculty)



module.exports=router;
