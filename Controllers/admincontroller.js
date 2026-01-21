
const Admin = require('../Models/admin')
const User = require('../Models/Users')
const category = require('../Models/category')
const Faculty = require('../Models/faculty')
const Event=require('../Models/event')
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
      venue
    } = req.body;

    // ✅ Normalize speakers (form-data safety)
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
      speakers,          // Array of strings
      imageUrl,
      timing,
      venue,
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

    // ✅ Normalize speakers
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

    // ✅ If new image uploaded, delete old image
    if (req.file) {
      if (event.imageUrl) {
        const publicId = event.imageUrl
          .split("/")
          .slice(-1)[0]
          .split(".")[0];

        await cloudinary.uploader.destroy(`events/${publicId}`);
      }

      event.imageUrl = req.file.path;
    }

    // ✅ Update fields
    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.date = date ?? event.date;
    event.location = location ?? event.location;
    event.category = category ?? event.category;
    event.maxParticipants = maxParticipants ?? event.maxParticipants;
    event.speakers = speakers ?? event.speakers;
    event.timing = timing ?? event.timing;
    event.status = status ?? event.status;

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
    if (event.imageUrl) {
      const publicId = event.imageUrl
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

