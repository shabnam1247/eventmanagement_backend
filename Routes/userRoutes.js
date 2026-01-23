const express=require("express");
const { createUser, verifyUserOtp, loginUser, getEvents, searchEventByName, Eventregister, registerForEvent, submitFeedback } = require("../Controllers/userscontroller");

const router=express.Router();

// jwt
router.post('/register',createUser)
router.post('/otpverify',verifyUserOtp)
router.post('/login',loginUser) 
router.get('/events',getEvents)
router.post('/eventregister/:userid',registerForEvent)
router.post('/feedback', submitFeedback)

// resendotp
module.exports=router;