
const express=require("express");
const { createAdmin, verifyOtp, loginAdmin, approveUser, approvefaculty, addcategory } = require("../Controllers/admincontroller");
const { authMiddleware } = require("../config/jwttoken");
const router=express.Router();


// jwt
// router.post('/register',createAdmin)
// router.post('/otpverify',verifyOtp)
router.post('/login',loginAdmin)
router.put('/approveuser/:id',approveUser)
router.put('/approvefaculty/:id',approvefaculty)

router.post('/addcategory',addcategory)


module.exports=router;