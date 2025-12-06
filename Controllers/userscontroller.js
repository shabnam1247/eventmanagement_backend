
const users =require('../Models/Users')
const emailverification=require("../config/email")


// Create a new user
exports.createUser = async (req, res) => {
    try {
        console.log("hj");
        
        const { name, email, password, phonenumber } = req.body;

        // Check if user already exists
        const exist = await users.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

        // Create new user
        const newUser = new users({
            name,
            email,
            password,
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

        res.status(200).json({ message: "Email verified successfully" });

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

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



