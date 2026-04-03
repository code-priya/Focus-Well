const mongoose = require('mongoose');

const studyPatternSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    studyHours: {
        type: Number,
        required: true
    },
    productivityScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    focusDuration: {
        type: Number, // in minutes
        required: true
    },
    breaksTaken: {
        type: Number,
        default: 0
    },
    topicsCovered: [String],
    distractions: {
        type: Number,
        default: 0
    },
    energyLevel: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    environment: {
        type: String,
        enum: ['library', 'home', 'cafe', 'dorm', 'other'],
        default: 'home'
    }
});

// Calculate optimal study time prediction
studyPatternSchema.statics.predictOptimalStudyTime = async function(userId, subject, deadline) {
    const patterns = await this.find({ 
        user: userId,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });
    
    if (patterns.length === 0) {
        return {
            recommendedHours: 2,
            confidence: 0.5,
            bestTimeOfDay: "morning"
        };
    }
    
    // Simple ML prediction based on historical data
    const avgProductivity = patterns.reduce((sum, p) => sum + p.productivityScore, 0) / patterns.length;
    const avgStudyHours = patterns.reduce((sum, p) => sum + p.studyHours, 0) / patterns.length;
    
    // Time of day analysis
    const timePerformance = {
        morning: patterns.filter(p => new Date(p.date).getHours() < 12).length,
        afternoon: patterns.filter(p => new Date(p.date).getHours() >= 12 && new Date(p.date).getHours() < 17).length,
        evening: patterns.filter(p => new Date(p.date).getHours() >= 17).length
    };
    
    const bestTimeOfDay = Object.keys(timePerformance).reduce((a, b) => 
        timePerformance[a] > timePerformance[b] ? a : b
    );
    
    const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const recommendedHours = Math.min(6, Math.max(1, avgStudyHours * (avgProductivity / 100) * (7 / daysUntilDeadline)));
    
    return {
        recommendedHours: Math.round(recommendedHours * 10) / 10,
        confidence: avgProductivity / 100,
        bestTimeOfDay,
        historicalAverage: avgStudyHours,
        productivityScore: avgProductivity
    };
};

module.exports = mongoose.model('StudyPattern', studyPatternSchema);
