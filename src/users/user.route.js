const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
// const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

//Registering the user endpoint
router.post('/register', async (req, res) => {
    try {
        // console.log('User registration data:', req.body); 
        const { username, email, password } = req.body; // Destructure the request body to get user data  
        const user = new User ({
            username,
            email,
            password // In a real application, you should hash the password before saving it
        });
        await user.save(); // Assuming you have a User model to save the user data
        // console.log('User registered successfully:', user);     
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        // console.error("Error registering user", error);
        res.status(500).json({ message: 'Error registering user' });
    }
});


//Login the user endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Destructure the request body to get user credentials
        // console.log('User login data:', req.body); 
        const user = await User.findOne({ email }); // Find the user by email
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        // Here you would typically compare the password with a hashed password stored in the database
        const isMatch = await user.comparePassword(password); // Assuming you have a method to compare passwords
        if (!isMatch) {
            return res.status(401).send({ message: 'Password not matched..!!' });
        }
        // if (user.password !== password) { // This is a simple check, use bcrypt or similar for real applications
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }

        // generate a token or session here if needed
        const token = await generateToken(user._id); // Assuming you have a method to generate a token
        // console.log("token :", token);
        // Set the token in a cookie or send it in the response
        res.cookie('token', token, {
            httpOnly: true,    // Make the cookie inaccessible to JavaScript (helps prevent XSS attacks)
            // secure: process.env.NODE_ENV === 'production',     // Use secure cookies in production
            secure: true,     // Use secure cookies in production
            sameSite: 'None',      // ✅ 'Lax' or 'Strict' works for localhost
            // sameSite: 'None',   // Helps prevent CSRF attacks
            // maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
        });

        //
        // console.log('User logged in successfully:', user);
        res.status(200).send({ message: 'User logged in successfully', token , user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            bio: user.bio,
            profession: user.profession,
            createdAt: user.createdAt,
        } }); // Send user data and token in the response
        // res.status(200).json({ message: 'User logged in successfully', user });  
    } catch (error) {
        // console.error("Error logging in user", error);
        res.status(500).send({ message: 'Error logging in user' });
    }
});

// Logout endpoint
// router.get('/users', verifyToken ,async (req, res) => {
//     res.send({message: 'Protected users..!!'});
// });

//Logout the user endpoint
router.post('/logout', (req, res) => {
    try {
        // Clear the token cookie to log out the user
        res.clearCookie('token', {
            httpOnly: true,
            // secure: false, // Use secure cookies in production
            secure: true,
            sameSite: 'None' // Helps prevent CSRF attacks
        });
        // console.log('User logged out successfully');
        res.status(200).send({ message: 'User logged out successfully' });
    } catch (error) {
        // console.error("Error logging out user", error);
        res.status(500).send({ message: 'Error logging out user' });
    }
});

//Delete a user endpoint
router.delete('/users/:id', async (req, res) => {
    try {
        const {id} = req.params; // Get the user ID from the request parameters
        // console.log('Deleting user with ID:', id);
        const user = await User.findByIdAndDelete(id); // Find and delete the user by ID
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        // console.log('User deleted successfully:', user);
        res.status(200).send({ message: 'User deleted successfully', user });
    } catch (error) {
        // console.error("Error deleting user", error);
        res.status(500).send({ message: 'Error deleting user' });
    }
});


//Get all users endpoint
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'id email role').sort({createdAt: -1}); // Find all users
        // console.log('Fetched all users successfully:', users);
        // res.status(200).send({ message: 'All users fetched successfully', users });
        res.status(200).send(users);
    } catch (error) {
        // console.error("Error fetching users", error);
        res.status(500).send({ message: 'Error fetching users' });
    }
});


//Update user role endpoint
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the user ID from the request parameters
        const { role } = req.body; // Destructure the request body to get updated user data
        // console.log('Updating user with ID:', id, 'Data:', req.body);
        
        const user = await User.findByIdAndUpdate(id, {
            role
        }, { new: true }); // Find and update the user by ID
        
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        // console.log('User Role updated successfully:', user);
        res.status(200).send({ message: 'User Role updated successfully', user });
    } catch (error) {
        // console.error("Error updating user role", error);
        res.status(500).send({ message: 'Error updating user role' });
    }
});

//edit or update user profile endpoint
router.patch('/users/edit-profile', async (req, res) => {
    try {
        const { userId, username, email, profileImage, bio, profession } = req.body; // Destructure the request body to get updated user data
        // console.log('Updating user profile with ID:', userId, 'Data:', req.body);

        if (!userId ) {
            return res.status(400).send({ message: 'User ID is required' });
        }  
        
        const user = await User.findById(userId); // Find the user by ID

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Update the user profile with the provided data
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;
        await user.save(); // Save the updated user profile
        // console.log('User profile updated successfully:', user);
        // Return the updated user profile in the response
        res.status(200).send({ message: 'User profile updated successfully', user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            bio: user.bio,
            profession: user.profession,
            createdAt: user.createdAt,
        } });
       
        
        // console.log('User profile updated successfully:', user);
        res.status(200).send({ message: 'User profile updated successfully', user });
    } catch (error) {
        // console.error("Error updating user profile", error);
        res.status(500).send({ message: 'Error updating user profile' });
    }
});


//exporting the router
module.exports = router;