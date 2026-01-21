
const { response } = require('express');
const users =require('../Models/Users')
const Event = require('../Models/event');
const Eventregistermodel=require('../Models/eventRegister')
const emailverification=require("../config/email")


// Create a new user
exports.createUser = async (req, res) => {
    try {
        console.log("hj");
        const { name, email, password, regno, department, year, phonenumber } = req.body;

        // Check if user already exists
        const exist = await users.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 mins

        // Create new user
        const newUser = new users({
            name,
            email,
            password,
            regno,
            department,
            year,
            phonenumber,
            otp,
            otpExpires: otpExpiry
        });

        await newUser.save();

        // Send OTP via mail function
        emailverification(email, otp);
        res.status(201).json({
            message: "User created successfully. OTP sent to email.",
            userId: newUser._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



exports.verifyUserOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log(otp,";;;;;;;;;;;;;;")

        const user = await users.findOne({ otp: otp });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or regno

        const user = await users.findOne({
            $or: [{ email: identifier }, { regno: identifier }],
            password: password
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials. Please check your email/register number and password." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Email not verified. Please verify your account.", email: user.email });
        }

        if (user.isapproved === false) {
            return res.status(401).json({ message: "Your account is pending admin approval. Please try again later." });
        }

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// search ,sort,filter,listing
exports.getEvents = async (req, res) => {
  try {
    const { title, category,sort,status } = req.query;

    let filter = {};
    let sortOption={};

    // 🔍 Search by event title
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    // 🏷️ Filter by category (ObjectId)
    if (category && category !== 'all') {
      filter.category = category;
    }


    if(status && status!== 'all'){
        filter.status=status;
    }

    if(sort === 'seats'){
        sortOption={maxParticipants:-1}
    }else if(sort === 'date'){
        sortOption={date:1}
    }

    const events = await Event.find(filter)
      .populate('category', 'name')
      .sort(sortOption);

    res.status(200).json({
      message: "Events fetched successfully",
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// need to take user id form auth middleware
exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.params.userid; 
    const { eventId, firstName, lastName, email, phone, department, year, comments } = req.body;
    console.log(eventId);

    if(!eventId || !department || !year || !firstName || !lastName || !email || !phone ){
        return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: "Registration closed" });
    }

    //  prevent duplicate registration
    const alreadyRegistered = await Eventregistermodel.findOne({
      eventid: eventId,
      userid: userId
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    // capacity check
    const count = await Eventregistermodel.countDocuments({
      eventid: eventId
    });

    if (count >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    const registration = new Eventregistermodel({
        firstName,
        lastName,
        email,
        phone,
      eventid: eventId,
      userid: userId,
      department,
      year,
      comments
    });

    await registration.save();

    res.status(201).json({
      message: "Successfully registered for event",
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







