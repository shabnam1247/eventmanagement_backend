const express=require("express");
const { createFaculty, verifyFacultyOtp, loginFaculty, createEvent, editevent, deleteEvent, markAttendance, getAllRegistrations, getEventRegistrations, deleteRegistration, getFeedbacks, getDashboardStats } = require("../Controllers/facultycontroller");
const router=express.Router();
const upload =require("../middleware/upload")

// Auth routes
router.post('/register',createFaculty)
router.post('/otpverify',verifyFacultyOtp)
router.post('/login',loginFaculty)

// Event management routes
router.post('/eventcreate',upload.single('image'),createEvent)
router.put('/eventedit/:id',upload.single('image'),editevent)
router.delete('/eventdelete/:id',upload.single('image'),deleteEvent)

// Attendance routes
router.post('/mark-attendance/:regId', markAttendance)

// Registration management routes
router.get('/registrations', getAllRegistrations)
router.get('/registrations/event/:eventId', getEventRegistrations)
router.get('/feedbacks', getFeedbacks)
router.get('/dashboard/stats/:facultyId', getDashboardStats)
router.delete('/registrations/:regId', deleteRegistration)

module.exports=router;
