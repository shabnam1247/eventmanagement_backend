
const Admin=require('../Models/admin')

const emailverification=require("../config/email")

// Admin register
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, phonenumber } = req.body;

        const exist = await Admin.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const otpExpiry = Date.now() + 5 * 60 * 1000; 

        const newAdmin = new Admin({
            name,
            email,
            password,
            phonenumber,
            otp,
            otpExpires: otpExpiry
        });

        await newAdmin.save();

        emailverification(email,otp)
        res.status(201).json({
            message: 'admin created successfully. OTP sent to email.',
            adminId: newAdmin._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};




exports.verifyOtp = async (req, res) => {
    try {
        const {otp } = req.body;

        const admin = await Admin.findOne({otp:otp});
          console.log(admin,"lklkl");

        if (!admin) return res.status(404).json({ message: "admin not found" });

        if (admin.otp !== otp){
         return res.status(400).json({ message: "Invalid OTP" });
        }

        if (admin.otpExpires < Date.now())
            return res.status(400).json({ message: "OTP expired" });

        admin.isVerified = true;
        admin.otp = null;
        admin.otpExpires = null;

        await admin.save();

        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email, password });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        if (!admin.isVerified) {
            return res.status(401).json({ message: "Email not verified" });
        }
        res.status(200).json({ message: "Login successful", admin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};