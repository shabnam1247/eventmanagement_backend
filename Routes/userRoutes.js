const express=require("express");
const { createUser } = require("../Controllers/userscontroller");

const router=express.Router();

// jwt
router.post('/register',createUser)


module.exports=router;