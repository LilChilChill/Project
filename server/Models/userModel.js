const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        default: null,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: null,
    },
    avatar: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
