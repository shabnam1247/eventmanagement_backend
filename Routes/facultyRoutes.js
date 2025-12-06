const express=require("express");
const { createFaculty, verifyFacultyOtp, loginFaculty } = require("../Controllers/facultycontroller");
const router=express.Router();

// jwt

router.post('/register',createFaculty)
router.post('/otpverify',verifyFacultyOtp)
router.post('/login',loginFaculty)

module.exports=router;
