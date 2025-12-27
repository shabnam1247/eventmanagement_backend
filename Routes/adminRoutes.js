
const express=require("express");
const { createAdmin, verifyOtp, loginAdmin, approveUser, approvefaculty, addcategory, editEvent, editEventadmin } = require("../Controllers/admincontroller");
const { authMiddleware } = require("../config/jwttoken");
const router=express.Router();
const upload =require("../middleware/upload");
const { createEvent,  deleteEvent } = require("../Controllers/admincontroller");

// jwt
// router.post('/register',createAdmin)
// router.post('/otpverify',verifyOtp)
router.post('/login',loginAdmin)
router.put('/approveuser/:id',approveUser)
router.put('/approvefaculty/:id',approvefaculty)

router.post('/addcategory',addcategory)
router.post('/eventcreate',upload.single('image'),createEvent)
router.put('/eventedit/:id',upload.single('image'),editEventadmin)
router.delete('/eventdelete/:id',deleteEvent)



module.exports=router;