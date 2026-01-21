const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        
    },
    password: {
        type: String,
        required: true
    },
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;