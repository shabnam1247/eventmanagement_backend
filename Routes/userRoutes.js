const express=require("express");
const { createUser, verifyUserOtp, loginUser, getEvents, getEventById, checkRegistrationStatus, getUserRegistrations, cancelRegistration, searchEventByName, Eventregister, registerForEvent, submitFeedback } = require("../Controllers/userscontroller");

const router=express.Router();

// jwt
router.post('/register',createUser)
router.post('/otpverify',verifyUserOtp)
router.post('/login',loginUser) 
router.get('/events',getEvents)
router.get('/events/:id',getEventById)
router.get('/events/:eventId/check-registration/:userId', checkRegistrationStatus)
router.post('/eventregister/:userid',registerForEvent)
router.get('/registrations/:userId', getUserRegistrations)
router.delete('/registrations/:registrationId', cancelRegistration)
router.post('/feedback', submitFeedback)

// resendotp
module.exports=router;