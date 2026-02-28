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
    phonenumber: {
        type: String
    },
    facultyId: {
        type: String,
        unique: true,
        sparse: true
    },
    department: {
        type: String
    },
    designation: {
        type: String
    },
    experience: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'on-leave', 'inactive'],
        default: 'active'
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
