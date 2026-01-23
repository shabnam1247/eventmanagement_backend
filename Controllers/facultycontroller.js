const Faculty = require('../Models/faculty');
const emailverification = require("../config/email");
const Event = require('../Models/event');
const cloudinary = require("../config/cloudinary");

// Create a new faculty
exports.createFaculty = async (req, res) => {
    try {
        const { name, email, password, phonenumber, facultyId, department } = req.body;

        // Check if faculty already exists
        const exist = await Faculty.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        const newFaculty = new Faculty({
            name,
            email,
            password,
            phonenumber,
            facultyId,
            department,
            otp,
            otpExpires: otpExpiry
        });

        await newFaculty.save();

        // Send OTP
        emailverification(email, otp);

        res.status(201).json({
            message: "Faculty created successfully. OTP sent to email.",
            facultyId: newFaculty._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyFacultyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const faculty = await Faculty.findOne({ otp: otp });

        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        if (faculty.otpExpires < Date.now())
            return res.status(400).json({ message: "OTP expired" });

        faculty.isVerified = true;
        faculty.otp = null;
        faculty.otpExpires = null;

        await faculty.save();

        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginFaculty = async (req, res) => {
    try {
        const { email, password } = req.body;
        const faculty = await Faculty.findOne({ email, password });

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        if (!faculty.isVerified) {
            return res.status(401).json({ message: "Email not verified" });
        }

        if (faculty.isapproved === false) {
            return res.status(401).json({ message: "Faculty not approved by admin yet" });
        }

        res.status(200).json({ message: "Login successful", faculty });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.path : null;

        let {
            title,
            description,
            date,
            location,
            category,
            maxParticipants,
            speakers,
            timing,
            eventScheduletime,
            venue,
            organizer
        } = req.body;

        // Parse eventSchedule if provided as string
        let parsedSchedule = [];
        if (eventScheduletime) {
            try {
                parsedSchedule = JSON.parse(eventScheduletime);
            } catch (e) {
                console.error("Schedule parse error:", e);
            }
        }

        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            maxParticipants,
            speakers: speakers ? (Array.isArray(speakers) ? speakers : speakers.split(',').map(s => s.trim())) : [],
            image: imageUrl,
            timing,
            venue,
            organizer: organizer || null,
            status: 'upcoming',
            eventScheduletime: parsedSchedule
        });

        await event.save();

        res.status(201).json({
            message: "Event created successfully",
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editevent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        let {
            title,
            description,
            date,
            location,
            category,
            maxParticipants,
            speakers,
            timing,
            venue,
            status,
            eventScheduletime,
            organizer
        } = req.body;

        // If new image uploaded, delete old one from Cloudinary
        if (req.file) {
            if (event.image) {
                const publicId = event.image.split("/").slice(-1)[0].split(".")[0];
                await cloudinary.uploader.destroy(`events/${publicId}`);
            }
            event.image = req.file.path;
        }

        // Update fields
        event.title = title ?? event.title;
        event.description = description ?? event.description;
        event.date = date ?? event.date;
        event.location = location ?? event.location;
        event.category = category ?? event.category;
        event.maxParticipants = maxParticipants ?? event.maxParticipants;
        event.speakers = speakers ? (Array.isArray(speakers) ? speakers : speakers.split(',').map(s => s.trim())) : event.speakers;
        event.timing = timing ?? event.timing;
        event.venue = venue ?? event.venue;
        event.status = status ?? event.status;
        event.organizer = organizer ?? event.organizer;

        if (eventScheduletime) {
            try {
                event.eventScheduletime = JSON.parse(eventScheduletime);
            } catch (e) {
                console.error("Schedule parse error:", e);
            }
        }

        await event.save();

        res.status(200).json({
            message: "Event updated successfully",
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
                success: false
            });
        }

        // Delete image from Cloudinary
        if (event.image) {
            const publicId = event.image.split("/").slice(-1)[0].split(".")[0];
            await cloudinary.uploader.destroy(`events/${publicId}`);
        }

        await Event.findByIdAndDelete(eventId);

        res.status(200).json({
            message: "Event deleted successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

