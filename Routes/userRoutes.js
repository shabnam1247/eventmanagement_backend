const express=require("express");
const { createUser, verifyUserOtp, loginUser, getEvents, getEventById, checkRegistrationStatus, getUserRegistrations, cancelRegistration, searchEventByName, Eventregister, registerForEvent, submitFeedback } = require("../Controllers/userscontroller");
const feedbackController = require("../Controllers/feedbackcontroller");

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
router.post('/event-feedback', feedbackController.submitFeedback)
router.get('/feedback-status/:registrationId', feedbackController.checkFeedbackStatus)

// Profile Management
const { getUserProfile, updateUserProfile, changePassword } = require("../Controllers/userscontroller");
router.get('/profile/:userId', getUserProfile)
router.put('/profile/:userId', updateUserProfile)
router.put('/profile/:userId/change-password', changePassword)

// resendotp
module.exports=router;