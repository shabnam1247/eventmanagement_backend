const Faculty=require('../Models/faculty')
const emailverification=require("../config/email")
const Event =require('../Models/event')




// Create a new user
exports.createFaculty = async (req, res) => {
    try {
        const { name, email, password, phonenumber } = req.body;

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
            otp,
            otpExpires: otpExpiry
        });

        await newFaculty.save();

        // Function same as createAdmin - send OTP
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
        console.log("jkkkjjkjkhjkhkjhh");
        
        const { otp } = req.body;

        const faculty = await Faculty.findOne({ otp: otp });

        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        if (faculty.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

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

        if(faculty.isapproved===false){
            return res.status(401).json({ message: "Faculty not approved by admin yet" });
        }

        res.status(200).json({ message: "Login successful", faculty });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createEvent = async (req, res) => {
    try {
        console.log(req.file,'llllllllll');
        
   const imageUrl = req.file ? req.file.path : null;
   console.log(imageUrl,"jjjjjjjjjjjjjj");

    const { title, description, date, location, category, maxParticipants } = req.body;
   

    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      maxParticipants,
      image: imageUrl
    });

    await event.save();


        res.status(201).json({ message: "Event created successfully",success:true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editevent = async (req, res) => {
    try {
        const eventId = req.params.id;
        
        const { title, description, date, location, category, maxParticipants } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        const updatedData = {
            title,
            description,

            date,
            location,
            category,   
            maxParticipants
        };

        if (imageUrl) {
            updatedData.image = imageUrl;
        }
        const event = await Event.findByIdAndUpdate(eventId, updatedData, { new: true });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event updated successfully", event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
