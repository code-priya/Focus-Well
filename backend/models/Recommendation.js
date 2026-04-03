const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['study', 'wellness', 'break', 'motivation'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    reason: String,
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
