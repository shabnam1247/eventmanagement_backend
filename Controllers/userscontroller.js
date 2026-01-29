

const { response } = require('express');
const users = require('../Models/Users')
const Event = require('../Models/event');
const Eventregistermodel = require('../Models/eventRegister')
const { sentotpemail, sendEventConfirmation } = require("../config/email")
const Feedback = require('../Models/feedback')


// Create a new user
exports.createUser = async (req, res) => {
    try {
        console.log("hj");
        const { name, email, password, regno, department, year, phonenumber } = req.body;

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
            regno,
            department,
            year,
            phonenumber,
            otp,
            otpExpires: otpExpiry
        });

        await newUser.save();

        // Send OTP via mail function
        sentotpemail(email, otp);
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
        const { identifier, password } = req.body; // identifier can be email or regno

        const user = await users.findOne({
            $or: [{ email: identifier }, { regno: identifier }],
            password: password
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials. Please check your email/register number and password." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Email not verified. Please verify your account.", email: user.email });
        }

        if (user.isapproved === false) {
            return res.status(401).json({ message: "Your account is pending admin approval. Please try again later." });
        }

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// search ,sort,filter,listing
exports.getEvents = async (req, res) => {
  try {
    const { title, category, sort, status } = req.query;

    let filter = {};
    let sortOption = {};

    //  Search by event title
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    //  Filter by category (ObjectId)
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (sort === 'seats') {
      sortOption = { maxParticipants: -1 };
    } else if (sort === 'date') {
      sortOption = { date: 1 };
    }

    const events = await Event.find(filter)
      .populate('category', 'name')
      .sort(sortOption);

    // Get registration count for each event
    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const registeredCount = await Eventregistermodel.countDocuments({
          eventid: event._id
        });

        return {
          _id: event._id,
          title: event.title,
          description: event.description,
          location: event.location,
          category: event.category?.name || 'General',
          venue: event.venue,
          maxRegistrations: event.maxParticipants,
          maxParticipants: event.maxParticipants,
          speakers: event.speakers || [],
          images: event.image ? [event.image] : [],
          time: event.timing,
          timing: event.timing,
          eventScheduletime: event.eventScheduletime || [],
          date: event.date,
          organizer: event.organizer,
          status: event.status,
          registeredCount: registeredCount
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      events: eventsWithCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate('category', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Get registration count for this event
    const registeredCount = await Eventregistermodel.countDocuments({
      eventid: event._id
    });

    const eventData = {
      _id: event._id,
      title: event.title,
      description: event.description,
      location: event.location,
      category: event.category?.name || 'General',
      venue: event.venue,
      maxRegistrations: event.maxParticipants,
      maxParticipants: event.maxParticipants,
      speakers: event.speakers || [],
      images: event.image ? [event.image] : [],
      time: event.timing,
      timing: event.timing,
      eventScheduletime: event.eventScheduletime || [],
      date: event.date,
      organizer: event.organizer,
      status: event.status,
      registeredCount: registeredCount,
      availableSeats: event.maxParticipants - registeredCount
    };

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event: eventData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Check if user is already registered for an event
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user is registered
    const registration = await Eventregistermodel.findOne({
      eventid: eventId,
      userid: userId
    });

    if (registration) {
      return res.status(200).json({
        success: true,
        registered: true,
        registration: {
          id: registration._id,
          firstName: registration.firstName,
          lastName: registration.lastName,
          email: registration.email,
          phone: registration.phone,
          department: registration.department,
          year: registration.year,
          registeredAt: registration.createdAt
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        registered: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// need to take user id form auth middleware
exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.params.userid; 
    const { eventId, firstName, lastName, email, phone, department, year, comments } = req.body;
    console.log(eventId);

    if(!eventId || !department || !year || !firstName || !lastName || !email || !phone ){
        return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: "Registration closed" });
    }

    //  prevent duplicate registration
    const alreadyRegistered = await Eventregistermodel.findOne({
      eventid: eventId,
      userid: userId
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    // capacity check
    const count = await Eventregistermodel.countDocuments({
      eventid: eventId
    });

    if (count >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    const registration = new Eventregistermodel({
        firstName,
        lastName,
        email,
        phone,
      eventid: eventId,
      userid: userId,
      department,
      year,
      comments
    });

    await registration.save();

    // Send confirmation email
    try {
      await sendEventConfirmation(email, {
        title: event.title,
        date: event.date,
        timing: event.timing,
        location: event.location,
        category: event.category?.name || 'General'
      }, {
        registrationId: registration._id,
        firstName,
        lastName,
        email,
        phone,
        department,
        year
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: "Successfully registered for event",
      success: true,
      registration: {
        id: registration._id,
        eventId: eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.timing,
        eventLocation: event.location,
        firstName,
        lastName,
        email,
        phone,
        department,
        year
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, phone, rating, message } = req.body;

    if (!name || !email || !rating || !message) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newFeedback = new Feedback({
      name,
      email,
      phone,
      rating,
      message
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events registered by a user
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await Eventregistermodel.find({ userid: userId })
      .populate({
        path: 'eventid',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 });

    const formattedRegistrations = await Promise.all(registrations.map(async reg => {
      // Check if feedback exists for this registration
      const feedback = await Feedback.findOne({ registrationId: reg._id });
      
      return {
        _id: reg._id,
        event: reg.eventid ? {
          _id: reg.eventid._id,
          title: reg.eventid.title,
          date: reg.eventid.date,
          timing: reg.eventid.timing,
          location: reg.eventid.location,
          category: reg.eventid.category?.name || 'General',
          image: reg.eventid.image,
          status: reg.eventid.status
        } : null,
        registeredAt: reg.createdAt,
        firstName: reg.firstName,
        lastName: reg.lastName,
        department: reg.department,
        year: reg.year,
        attended: reg.attended,
        attendedAt: reg.attendedAt,
        feedbackSubmitted: !!feedback
      };
    }));

    res.status(200).json({
      success: true,
      registrations: formattedRegistrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel event registration
exports.cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Eventregistermodel.findById(registrationId).populate('eventid');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Optional: Add logic to check if cancellation is allowed (e.g. 24h before)
    // For now, allow cancellation if event is upcoming
    if (registration.eventid.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: "Can only cancel registrations for upcoming events"
      });
    }

    await Eventregistermodel.findByIdAndDelete(registrationId);

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await users.findById(userId).select('-password -otp -otpExpires');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, phonenumber, department, year } = req.body;

        const user = await users.findByIdAndUpdate(
            userId,
            { name, phonenumber, department, year },
            { new: true }
        ).select('-password -otp -otpExpires');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check old password
        if (user.password !== oldPassword) {
            return res.status(400).json({ success: false, message: "Incorrect old password" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllFaculties = async (req, res) => {
    try {
        const Faculty = require('../Models/faculty');
        const faculties = await Faculty.find({ isVerified: true, isapproved: true })
            .select('name department facultyId email');
        res.status(200).json({ success: true, faculties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get data for certificate generation
exports.getCertificateData = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const registration = await Eventregistermodel.findById(registrationId)
            .populate('eventid')
            .populate('userid', 'name');

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        if (!registration.attended) {
            return res.status(403).json({ 
                success: false, 
                message: "Certificate is only available for attendees" 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                studentName: registration.firstName + " " + registration.lastName,
                eventTitle: registration.eventid.title,
                eventDate: registration.eventid.date,
                category: registration.eventid.category, 
                location: registration.eventid.location,
                issueDate: registration.attendedAt || new Date()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
