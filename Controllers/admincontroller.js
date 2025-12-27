
const Admin = require('../Models/admin')
const User = require('../Models/Users')
const category = require('../Models/category')
const Faculty = require('../Models/faculty')
const Event=require('../Models/event')
const emailverification = require("../config/email")
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();



// Admin register
// exports.createAdmin = async (req, res) => {
//     try {
//         const { name, email, password, phonenumber } = req.body;

//         const exist = await Admin.findOne({ email });
//         if (exist) {
//             return res.status(400).json({ message: "Email already registered" });
//         }

//         // generate otp
//         const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
//         const otpExpiry = Date.now() + 5 * 60 * 1000; 

//         const newAdmin = new Admin({
//             name,
//             email,
//             password,
//             phonenumber,
//             otp,
//             otpExpires: otpExpiry
//         });

//         await newAdmin.save();

//         emailverification(email,otp)
//         res.status(201).json({
//             message: 'admin created successfully. OTP sent to email.',
//             adminId: newAdmin._id
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }
// };




// exports.verifyOtp = async (req, res) => {
//     try {
//         const {otp } = req.body;

//         const admin = await Admin.findOne({otp:otp});
//           console.log(admin,"lklkl");

//         if (!admin) return res.status(404).json({ message: "admin not found" });

//         if (admin.otp !== otp){
//          return res.status(400).json({ message: "Invalid OTP" });
//         }

//         if (admin.otpExpires < Date.now())
//             return res.status(400).json({ message: "OTP expired" });

//         admin.isVerified = true;
//         admin.otp = null;
//         admin.otpExpires = null;

//         await admin.save();

//         res.status(200).json({ message: "Email verified successfully" });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

exports.loginAdmin = async (req, res) => {
    try {
        console.log("jhjg");

        const { email, password } = req.body;
        const admin = await Admin.findOne({ email, password });

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        if (!admin.isVerified) {
            return res.status(401).json({ message: "Email not verified" });
        }

        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phonenumber: admin.phonenumber
            },
        });
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

