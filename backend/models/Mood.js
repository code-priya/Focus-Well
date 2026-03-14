const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: String,
        enum: ['great', 'good', 'okay', 'stressed', 'tired', 'anxious', 'motivated'],
        required: true
    },
    note: {
        type: String,
        maxLength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mood', moodSchema);
