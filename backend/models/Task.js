const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    estimatedHours: {
        type: Number,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate recommended study time based on deadline
taskSchema.methods.getRecommendedHours = function() {
    const now = new Date();
    const daysUntilDeadline = Math.ceil((this.deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 0) return this.estimatedHours;
    return Math.min(4, Math.ceil(this.estimatedHours / daysUntilDeadline));
};

module.exports = mongoose.model('Task', taskSchema);
