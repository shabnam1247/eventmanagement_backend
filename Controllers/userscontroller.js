
const { response } = require('express');
const users =require('../Models/Users')
const Event = require('../Models/event');
const emailverification=require("../config/email")


// Create a new user
exports.createUser = async (req, res) => {
    try {
        console.log("hj");
        
        const { name, email, password } = req.body;

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
        const { email, password } = req.body;

        const user = await users.findOne({ email, password });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Email not verified" });
        }

        if(user.isapproved===false){
            return res.status(401).json({ message: "User not approved by admin yet" });
        }

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// exports.getEvents = async (req, res) => {
//     try {
//         const events = await Event.find(); // Assuming Event is a Mongoose model 

//         res.status(200).json({message:"Events fetched successfully", events});
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.searchEventByName = async (req, res) => {
//   try {
//     const { title } = req.query;

//     if (!title) {
//       return res.status(400).json({ message: 'Event title is required' });
//     }

//     const events = await Event.find({
//       title: { $regex: title, $options: 'i' } // case-insensitive search
//     });

//     res.status(200).json(events);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


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










