const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function(next) {
    console.log('\n=== Saving User ===');
    console.log('Username:', this.username);
    console.log('Password being saved:', this.password);
    console.log('=== End Saving User ===\n');
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 