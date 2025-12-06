
const users =require('../Models/Users')

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new users({ name, email, password });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



