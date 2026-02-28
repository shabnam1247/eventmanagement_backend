require('dotenv').config();
const nodemailer = require('nodemailer');

// otp email
const sentotpemail = async (email, otp) => {
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
};

// Event registration confirmation email
const sendEventConfirmation = async (email, eventDetails, registrationDetails) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const eventDate = new Date(eventDetails.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Registration Confirmed - ${eventDetails.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-icon { font-size: 48px; margin-bottom: 10px; }
                    .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #667eea; }
                    .registration-id { background: #667eea; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">✅</div>
                        <h1>Registration Successful!</h1>
                        <p>You're all set for the event</p>
                    </div>
                    <div class="content">
                        <p>Dear ${registrationDetails.firstName} ${registrationDetails.lastName},</p>
                        <p>Thank you for registering! We're excited to have you at our event.</p>
                        
                        <div class="registration-id">
                            Registration ID: ${registrationDetails.registrationId}
                        </div>

                        <div class="event-details">
                            <h2 style="margin-top: 0; color: #667eea;">📅 Event Details</h2>
                            
                            <div class="detail-row">
                                <span class="detail-label">Event:</span><br>
                                ${eventDetails.title}
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Date:</span><br>
                                ${eventDate}
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Time:</span><br>
                                ${eventDetails.timing}
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Venue:</span><br>
                                ${eventDetails.location}
                            </div>

                            <div class="detail-row" style="border-bottom: none;">
                                <span class="detail-label">Category:</span><br>
                                ${eventDetails.category || 'General'}
                            </div>
                        </div>

                        <div class="event-details">
                            <h3 style="margin-top: 0; color: #667eea;">👤 Your Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Name:</span> ${registrationDetails.firstName} ${registrationDetails.lastName}
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span> ${registrationDetails.email}
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Phone:</span> ${registrationDetails.phone}
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Department:</span> ${registrationDetails.department}
                            </div>
                            <div class="detail-row" style="border-bottom: none;">
                                <span class="detail-label">Year:</span> ${registrationDetails.year}
                            </div>
                        </div>

                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <strong>⚠️ Important:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Please arrive 15 minutes before the event starts</li>
                                <li>Keep this email for your records</li>
                                <li>Show your registration ID at the venue</li>
                            </ul>
                        </div>

                        <p style="text-align: center; margin-top: 30px;">
                            <strong>We look forward to seeing you!</strong>
                        </p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>If you have any questions, please contact the event organizer.</p>
                        <p>&copy; 2026 Event Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log('Event confirmation email sent to ' + email);
};

module.exports = { sentotpemail, sendEventConfirmation };
