
const Admin = require('../Models/admin')
const User = require('../Models/Users')
const category = require('../Models/category')
const Faculty = require('../Models/faculty')
const Event=require('../Models/event')
const EventRegistration = require('../Models/eventRegister')
const emailverification = require("../config/email")
const jwt = require('jsonwebtoken');


exports.loginAdmin = async (req, res) => {
    try {
        console.log("jhjg");

        const { email, password } = req.body;        

        if(email!=process.env.ADMIN_EMAIL){
          return res.status(400).json({message:"Invalid email"})
        }

        if(password!=process.env.ADMIN_PASSWORD){
          return res.status(400).json({message:"Invalid password"})
        }
       

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){

        const token = jwt.sign(
            { id:'admin', email:email },
            process.env.JWT_SECRET,
        );
      

        res.status(200).json({
            message: "Admin Login successful",
            token,
            admin: {
                id: 'admin',
                name: 'admin', 
                email: email,

            },
        });
      }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};



exports.getAllEvents=async(req,res)=>{
  try {
    const events=await Event.find().populate('category').populate('organizer','name').populate('speakers','name')

    if(!events){
      return res.status(404).json({message:"No events found"})
    }
   
    res.status(200).json({
      success:true,
      message:"Events fetched successfully",
      events
    })
  } catch (error) {
    res.status(500).json({message:error.message})
  }
}


















// Get all event registrations for admin
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate('eventid', 'title date status')
      .populate('userid', 'name email')
      .sort({ registeredAt: -1 });

      console.log(registrations,"tttttttttt");
      

    res.status(200).json({
      success: true,
      message: "Registrations fetched successfully",
      registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all approved faculties for organizer dropdown
exports.getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({ isapproved: true })
      .select('name email _id');

    res.status(200).json({
      success: true,
      message: "Faculties fetched successfully",
      faculties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all registered faculties (for Admin management)
exports.getAllFacultiesAdmin = async (req, res) => {
  try {
    const faculties = await Faculty.find({})
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All faculties fetched successfully",
      faculties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.approveUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndUpdate(
            userId,
            { isapproved: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: `User with ID ${userId} approved successfully.`,succes:true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get all registered students (for Admin management)
exports.getAllStudentsAdmin = async (req, res) => {
  try {
    const students = await User.find({})
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All students fetched successfully",
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approvefaculty = async (req, res) => {
    try {
        const facultyId = req.params.id;
        const faculty = await Faculty.findByIdAndUpdate(
            facultyId,
            { isapproved: true },
            { new: true }
        );
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        res.status(200).json({ message: `Faculty with ID ${facultyId} approved successfully.`,succes:true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.addcategory=async(req,res)=>{
    try {
        const { name } = req.body;
        const exist = await category.findOne({ name });
        if (exist) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = new category({ name });
        await newCategory.save();
        res.status(201).json({ message: "Category added successfully", category: newCategory });
    }  
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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

    //  Normalize speakers (form-data safety)
    if (speakers && !Array.isArray(speakers)) {
      speakers = [speakers];
    }
    let parsedSchedule = [];

    if(eventScheduletime){
      parsedSchedule = JSON.parse(eventScheduletime);

    }

    const event = new Event({
      title,
      description,
      date,
      location,
      category,          // ObjectId
      maxParticipants,
      speakers: speakers ? (Array.isArray(speakers) ? speakers : speakers.split(',').map(s => s.trim())) : [],
      image: imageUrl,
      timing,
      venue,
      organizer: (organizer && organizer.trim() !== "") ? organizer : null,
      status: "upcoming",
      eventScheduletime: parsedSchedule
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.editEventadmin = async (req, res) => {
  try {
    const eventId = req.params.id;

    let {
      title,
      description,
      date,
      location,
      category,
      maxParticipants,
      speakers,
      timing,
      status
    } = req.body;

    //  Normalize speakers
    if (speakers && !Array.isArray(speakers)) {
      speakers = [speakers];
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    //  If new image uploaded, delete old image
    if (req.file) {
      if (event.image) {
        const publicId = event.image
          .split("/")
          .slice(-1)[0]
          .split(".")[0];

        await cloudinary.uploader.destroy(`events/${publicId}`);
      }

      event.image = req.file.path;
    }

    // ✅ Update fields
    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.date = date ?? event.date;
    event.location = location ?? event.location;
    event.category = category ?? event.category;
    event.maxParticipants = maxParticipants ?? event.maxParticipants;
    event.speakers = speakers ? (Array.isArray(speakers) ? speakers : speakers.split(',').map(s => s.trim())) : event.speakers;
    event.timing = timing ?? event.timing;
    event.status = status ?? event.status;
    event.venue = req.body.venue ?? event.venue;
    event.organizer = (req.body.organizer && req.body.organizer.trim() !== "") ? req.body.organizer : event.organizer;

    if (req.body.eventScheduletime) {
      event.eventScheduletime = JSON.parse(req.body.eventScheduletime);
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event
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
    const event = await Event.findById(req.params.id)
      .populate('category', 'name')
      .populate('organizer', 'name email');
      console.log(event,"event");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Get all categories
exports.getcategories = async (req, res) => {
  try {
    const categories = await category.find();
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
console.log(eventId,"lllllllll");

    const event = await Event.findById(eventId);
    console.log(event ,"kkkkk");
    

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // ✅ Delete image from Cloudinary if exists
    if (event.image) {
      const publicId = event.image
        .split("/")
        .slice(-1)[0]
        .split(".")[0];

      await cloudinary.uploader.destroy(`events/${publicId}`);
    }

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a new faculty member (Admin only)
exports.addFaculty = async (req, res) => {
  try {
    const { name, email, password, phonenumber, facultyId, department, designation, experience, status } = req.body;

    const exist = await Faculty.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newFaculty = new Faculty({
      name,
      email,
      password, // In a real app, hash this
      phonenumber,
      facultyId,
      department,
      designation,
      experience,
      status: status || 'active',
      isVerified: true, // Pre-verified by admin
      isapproved: true  // Pre-approved by admin
    });

    await newFaculty.save();

    res.status(201).json({
      success: true,
      message: "Faculty member added successfully",
      faculty: newFaculty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

