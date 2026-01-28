const Faculty = require('../Models/faculty');
const emailverification = require("../config/email");
const Event = require('../Models/event');
const cloudinary = require("../config/cloudinary");
const Eventregistermodel = require('../Models/eventRegister');

// Mark user attendance for an event
exports.markAttendance = async (req, res) => {
  try {
    const { regId } = req.params;

    const registration = await Eventregistermodel.findById(regId).populate('eventid');
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    if (registration.attended) {
      return res.status(400).json({
        success: false,
        message: "User has already checked in",
        registration: {
          firstName: registration.firstName,
          lastName: registration.lastName,
          eventTitle: registration.eventid?.title,
          attendedAt: registration.attendedAt
        }
      });
    }

    // Mark as attended
    registration.attended = true;
    registration.attendedAt = new Date();
    await registration.save();

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      registration: {
        firstName: registration.firstName,
        lastName: registration.lastName,
        eventTitle: registration.eventid?.title,
        attendedAt: registration.attendedAt,
        email: registration.email,
        department: registration.department,
        year: registration.year
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
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

// Get all registrations across all events
exports.getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Eventregistermodel.find()
            .populate('eventid', 'title date venue status category')
            .sort({ registeredAt: -1 });

        // Calculate stats
        const totalRegistrations = registrations.length;
        const attendedCount = registrations.filter(r => r.attended).length;
        const pendingCount = registrations.filter(r => !r.attended).length;

        res.status(200).json({
            success: true,
            registrations,
            stats: {
                total: totalRegistrations,
                attended: attendedCount,
                pending: pendingCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get registrations for a specific event with attendance stats
exports.getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const registrations = await Eventregistermodel.find({ eventid: eventId })
            .populate('eventid', 'title date venue status category maxParticipants')
            .sort({ registeredAt: -1 });

        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        const totalRegistrations = registrations.length;
        const attendedCount = registrations.filter(r => r.attended).length;
        const pendingCount = registrations.filter(r => !r.attended).length;

        res.status(200).json({
            success: true,
            event: {
                _id: event._id,
                title: event.title,
                date: event.date,
                venue: event.venue,
                maxParticipants: event.maxParticipants
            },
            registrations,
            stats: {
                total: totalRegistrations,
                attended: attendedCount,
                pending: pendingCount,
                attendanceRate: totalRegistrations > 0 
                    ? Math.round((attendedCount / totalRegistrations) * 100) 
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a registration
exports.deleteRegistration = async (req, res) => {
    try {
        const { regId } = req.params;
        
        const registration = await Eventregistermodel.findById(regId);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        await Eventregistermodel.findByIdAndDelete(regId);

        res.status(200).json({
            success: true,
            message: "Registration deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get feedback for events organized by faculty
exports.getFeedbacks = async (req, res) => {
    try {
        const { facultyId } = req.query;
        
        // Find events organized by this faculty
        const events = await Event.find({ organizer: facultyId }).select('_id');
        const eventIds = events.map(e => e._id);

        const Feedback = require('../Models/feedback');
        const feedbacks = await Feedback.find({ eventId: { $in: eventIds } })
            .populate('eventId', 'title')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const formattedFeedbacks = feedbacks.map(f => ({
            _id: f._id,
            rating: f.rating,
            message: f.message,
            createdAt: f.createdAt,
            name: f.userId?.name || "Verified Student",
            email: f.userId?.email || "Email hidden",
            eventTitle: f.eventId?.title || "Deleted Event"
        }));

        res.status(200).json({
            success: true,
            feedbacks: formattedFeedbacks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { facultyId } = req.params;

        // 1. Basic Counts
        const events = await Event.find({ organizer: facultyId });
        const eventIds = events.map(e => e._id);

        const registrations = await Eventregistermodel.find({ eventid: { $in: eventIds } });
        
        const totalEvents = events.length;
        const totalRegistrations = registrations.length;
        const totalAttendance = registrations.filter(r => r.attended).length;
        
        // 2. Average Rating
        const Feedback = require('../Models/feedback');
        const feedbacks = await Feedback.find({ eventId: { $in: eventIds } });
        const avgRating = feedbacks.length > 0 
            ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        // 3. Category Split
        const categoryStats = events.reduce((acc, event) => {
            // Since we need category names, and events.category is an ID, we might need to populate or just count by ID
            // For simplicity, let's just count and we can populate later if needed or return IDs
            const catId = event.category.toString();
            acc[catId] = (acc[catId] || 0) + 1;
            return acc;
        }, {});

        // 4. Registration Trend (Last 4 weeks)
        // This is a simplified version, ideally we'd use mongo aggregation
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const registrationTrend = weeks.map((w, i) => ({
            date: w,
            registrations: Math.floor(totalRegistrations / 4) + (i * 10), // Placeholder logic for now
            attendance: Math.floor(totalAttendance / 4) + (i * 5)
        }));

        // 5. Detailed Event List
        const eventStats = events.map(event => {
            const eventRegs = registrations.filter(r => r.eventid.toString() === event._id.toString());
            const attendedCount = eventRegs.filter(r => r.attended).length;
            return {
                _id: event._id,
                name: event.title,
                date: event.date,
                registrations: eventRegs.length,
                attended: attendedCount
            };
        });

        res.status(200).json({
            success: true,
            stats: {
                totalEvents,
                totalRegistrations,
                totalAttendance,
                avgRating,
                registrationTrend,
                eventStats
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
