const express=require("express");
const { createFaculty, verifyFacultyOtp, loginFaculty, createEvent, editevent, deleteEvent } = require("../Controllers/facultycontroller");
const router=express.Router();
const upload =require("../middleware/upload")

// jwt

router.post('/register',createFaculty)
router.post('/otpverify',verifyFacultyOtp)
router.post('/login',loginFaculty)
router.post('/eventcreate',upload.single('image'),createEvent)
router.put('/eventedit/:id',upload.single('image'),editevent)
router.delete('/eventdelete/:id',upload.single('image'),deleteEvent)

// edit 
// delete

module.exports=router;
