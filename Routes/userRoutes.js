const express=require("express");
const { createUser, verifyUserOtp, loginUser } = require("../Controllers/userscontroller");

const router=express.Router();

// jwt
router.post('/register',createUser)
router.post('/otpverify',verifyUserOtp)
router.post('/login',loginUser) 

// resendotp
module.exports=router;