const Faculty=require('../Models/faculty')

// Create a new user
exports.createFaculty = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newFaculty = new Faculty({ name, email, password });

        await newFaculty.save();

        res.status(201).json({ message: 'faculty created successfully', faculty: newFaculty });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};