require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the user
        const user = await User.findOne({ username: 'Hema Senthil Murugan' });
        if (!user) {
            console.log('User not found');
            return;
        }

        // Update password
        user.password = 'Test123!'; // This will be hashed by the pre-save middleware
        await user.save();
        
        console.log('User updated successfully');
        console.log('New user details:', {
            username: user.username,
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateUser(); 