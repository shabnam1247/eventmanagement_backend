const mongoose = require('mongoose');
const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,   
        required: true
    },
    otp: { type: String },
otpExpires: { type: Date },
isVerified: { type: Boolean, default: false },
isapproved: { type: Boolean, default: false },
    createdAt: {    
        type: Date,
        default: Date.now
    }
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
