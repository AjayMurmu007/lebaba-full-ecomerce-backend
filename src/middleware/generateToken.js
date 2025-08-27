const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

const generateToken = async (userId) => {
    try {
        // Create a token with user ID and role
        const user = await User.findById(userId); // Assuming you have a User model to find the user
        if (!user) {
            // console.error("Invalid user data:", user);
            throw new Error('User not found or invalid data');
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET_KEY, // Ensure you have this environment variable set
            { expiresIn: '1d' } // Token expires in 1 day
        );
        return token;
    } catch (error) {
        // console.error("Error generating token:", error);
        throw new Error('Token generation failed');
    }
}

// export the function to be used in other parts of the application
module.exports = generateToken;
