
const express=require("express");
const { createAdmin, verifyOtp, loginAdmin } = require("../Controllers/admincontroller");
const router=express.Router();


// jwt
router.post('/register',createAdmin)
router.post('/otpverify',verifyOtp)
router.post('/login',loginAdmin)

module.exports=router;