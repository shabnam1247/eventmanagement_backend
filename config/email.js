require('dotenv').config();
const nodemailer = require('nodemailer');

// otp email
const sentotpemail=async(email,otp)=>{

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to ' + email);

}


module.exports = sentotpemail;
