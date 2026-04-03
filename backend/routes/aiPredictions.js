const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyPattern = require('../models/StudyPattern');
const Task = require('../models/Task');
const Mood = require('../models/Mood');
const Recommendation = require('../models/Recommendation');

// Get personalized study prediction
router.get('/study-prediction/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.taskId,
            user: req.userId
        });
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const prediction = await StudyPattern.predictOptimalStudyTime(
            req.userId,
            task.subject,
            task.deadline
        );
        
        // Generate AI recommendation based on prediction
        const recommendation = generateStudyRecommendation(prediction, task);
        
        res.json({
            task: task.title,
            prediction,
            recommendation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

// Get mood trend prediction
router.get('/mood-trends', auth, async (req, res) => {
    try {
        const moods = await Mood.find({ 
            user: req.userId,
            createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: 1 });
        
        if (moods.length < 3) {
            return res.json({
                trend: 'insufficient_data',
                message: 'Log more moods to see predictions',
                nextPrediction: null
            });
        }
        
        // Simple trend prediction
        const moodValues = moods.map(m => ({
            date: m.createdAt,
            value: getMoodValue(m.mood)
        }));
        
        const trend = calculateTrend(moodValues);
        const nextPrediction = predictNextMood(moodValues, trend);
        
        // Generate wellness recommendation
        const wellnessTip = generateWellnessTip(trend, moods);
        
        res.json({
            trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
            confidence: Math.abs(trend) * 100,
            nextPrediction: getMoodEmoji(nextPrediction),
            wellnessTip
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to predict mood trends' });
    }
});

// Get study performance analytics
router.get('/performance-analytics', auth, async (req, res) => {
    try {
        const patterns = await StudyPattern.find({ 
            user: req.userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        
        if (patterns.length === 0) {
            return res.json({
                message: 'Not enough data for analysis',
                insights: []
            });
        }
        
        // Calculate performance metrics
        const avgProductivity = patterns.reduce((sum, p) => sum + p.productivityScore, 0) / patterns.length;
        const bestDay = findBestDay(patterns);
        const optimalHours = findOptimalStudyHours(patterns);
        const focusPattern = analyzeFocusPattern(patterns);
        
        // Generate insights using simple ML
        const insights = generateInsights(patterns, avgProductivity);
        
        res.json({
            metrics: {
                averageProductivity: Math.round(avgProductivity),
                totalStudyHours: patterns.reduce((sum, p) => sum + p.studyHours, 0),
                averageFocusDuration: Math.round(patterns.reduce((sum, p) => sum + p.focusDuration, 0) / patterns.length),
                bestPerformingDay: bestDay,
                optimalStudyHours: optimalHours
            },
            focusPattern,
            insights,
            recommendations: generatePerformanceRecommendations(patterns)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
});

// Log study pattern
router.post('/log-pattern', auth, async (req, res) => {
    try {
        const { studyHours, productivityScore, focusDuration, breaksTaken, topicsCovered, distractions, energyLevel, environment } = req.body;
        
        const pattern = new StudyPattern({
            user: req.userId,
            studyHours,
            productivityScore,
            focusDuration,
            breaksTaken: breaksTaken || 0,
            topicsCovered: topicsCovered || [],
            distractions: distractions || 0,
            energyLevel,
            environment: environment || 'home'
        });
        
        await pattern.save();
        
        // Generate and save recommendations based on this pattern
        const recommendations = await generateRecommendationsFromPattern(req.userId, pattern);
        
        res.status(201).json({
            pattern,
            recommendations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log study pattern' });
    }
});

// Helper functions
function getMoodValue(mood) {
    const values = {
        great: 5,
        good: 4,
        motivated: 4,
        okay: 3,
        tired: 2,
        stressed: 1.5,
        anxious: 1
    };
    return values[mood] || 3;
}

function getMoodEmoji(value) {
    if (value >= 4.5) return '😄';
    if (value >= 3.5) return '🙂';
    if (value >= 2.5) return '😐';
    if (value >= 1.5) return '😰';
    return '😴';
}

function calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i].value;
        sumXY += i * values[i].value;
        sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

function predictNextMood(values, trend) {
    const lastValue = values[values.length - 1].value;
    const nextValue = Math.min(5, Math.max(1, lastValue + trend));
    return nextValue;
}

function findBestDay(patterns) {
    const dayPerformance = {};
    
    patterns.forEach(p => {
        const day = new Date(p.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayPerformance[day]) {
            dayPerformance[day] = { total: 0, count: 0 };
        }
        dayPerformance[day].total += p.productivityScore;
        dayPerformance[day].count++;
    });
    
    let bestDay = '';
    let bestScore = 0;
    
    for (const [day, data] of Object.entries(dayPerformance)) {
        const avgScore = data.total / data.count;
        if (avgScore > bestScore) {
            bestScore = avgScore;
            bestDay = day;
        }
    }
    
    return bestDay;
}

function findOptimalStudyHours(patterns) {
    const hourRanges = [
        { min: 0, max: 1, label: '1 hour', scores: [] },
        { min: 1, max: 2, label: '2 hours', scores: [] },
        { min: 2, max: 3, label: '3 hours', scores: [] },
        { min: 3, max: 4, label: '4 hours', scores: [] },
        { min: 4, max: 6, label: '5+ hours', scores: [] }
    ];
    
    patterns.forEach(p => {
        for (const range of hourRanges) {
            if (p.studyHours >= range.min && p.studyHours < range.max) {
                range.scores.push(p.productivityScore);
                break;
            }
        }
    });
    
    let bestRange = hourRanges[0];
    let bestAvg = 0;
    
    for (const range of hourRanges) {
        if (range.scores.length > 0) {
            const avg = range.scores.reduce((a, b) => a + b, 0) / range.scores.length;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestRange = range;
            }
        }
    }
    
    return bestRange.label;
}

function analyzeFocusPattern(patterns) {
    const focusByDuration = {};
    
    patterns.forEach(p => {
        const durationBucket = Math.floor(p.focusDuration / 30) * 30;
        if (!focusByDuration[durationBucket]) {
            focusByDuration[durationBucket] = { totalProductivity: 0, count: 0 };
        }
        focusByDuration[durationBucket].totalProductivity += p.productivityScore;
        focusByDuration[durationBucket].count++;
    });
    
    let optimalFocus = 60;
    let maxProductivity = 0;
    
    for (const [duration, data] of Object.entries(focusByDuration)) {
        const avgProductivity = data.totalProductivity / data.count;
        if (avgProductivity > maxProductivity) {
            maxProductivity = avgProductivity;
            optimalFocus = parseInt(duration);
        }
    }
    
    return {
        optimalFocusMinutes: optimalFocus,
        productivityAtOptimal: Math.round(maxProductivity),
        recommendation: optimalFocus < 60 ? "Try longer focus sessions" : optimalFocus > 90 ? "Consider shorter, more frequent breaks" : "Your focus duration is optimal"
    };
}

function generateInsights(patterns, avgProductivity) {
    const insights = [];
    
    if (avgProductivity > 80) {
        insights.push("🌟 Excellent productivity! You're performing better than 90% of students.");
    } else if (avgProductivity > 60) {
        insights.push("📈 Good productivity! Small improvements could make you exceptional.");
    } else {
        insights.push("💪 Room for improvement. Try our recommended study techniques.");
    }
    
    const totalHours = patterns.reduce((sum, p) => sum + p.studyHours, 0);
    const avgBreaks = patterns.reduce((sum, p) => sum + p.breaksTaken, 0) / patterns.length;
    
    if (avgBreaks < patterns.length * 0.3) {
        insights.push("🧠 Taking more breaks could improve your retention by up to 40%");
    }
    
    if (totalHours > 100) {
        insights.push("🏆 Dedicated student! Your consistency is impressive.");
    }
    
    return insights;
}

function generatePerformanceRecommendations(patterns) {
    const recommendations = [];
    const avgDistractions = patterns.reduce((sum, p) => sum + p.distractions, 0) / patterns.length;
    
    if (avgDistractions > 5) {
        recommendations.push("Try using website blockers during study sessions");
        recommendations.push("Study in a quieter environment to minimize distractions");
    }
    
    const avgEnergy = patterns.reduce((sum, p) => sum + p.energyLevel, 0) / patterns.length;
    if (avgEnergy < 5) {
        recommendations.push("Consider adjusting your study schedule to match your energy peaks");
        recommendations.push("Take power naps or light exercise before studying");
    }
    
    recommendations.push("Use the Pomodoro technique: 25 min focus, 5 min break");
    recommendations.push("Review your notes within 24 hours for better retention");
    
    return recommendations.slice(0, 4);
}

function generateStudyRecommendation(prediction, task) {
    if (prediction.confidence > 0.8) {
        return `Based on your study patterns, you're most productive during ${prediction.bestTimeOfDay}. Schedule ${task.title} for ${prediction.recommendedHours} hours then. Your productivity score of ${Math.round(prediction.productivityScore)}% is excellent! 🎯`;
    } else if (prediction.confidence > 0.6) {
        return `We recommend studying ${task.title} for ${prediction.recommendedHours} hours, preferably in the ${prediction.bestTimeOfDay}. Keep tracking your sessions for more accurate predictions. 📚`;
    } else {
        return `Start with ${prediction.recommendedHours} hours for ${task.title}. Log your study patterns to get personalized AI recommendations. 🚀`;
    }
}

function generateWellnessTip(trend, moods) {
    if (trend > 0.2) {
        return "Your mood is improving! Keep up the positive habits that are working for you. 🌈";
    } else if (trend < -0.2) {
        return "Notice you've been feeling down. Try our breathing exercises or take a mental health break. You matter! 💙";
    } else {
        return "Consistent mood patterns. Great job maintaining emotional awareness! 🌟";
    }
}

async function generateRecommendationsFromPattern(userId, pattern) {
    const recommendations = [];
    
    if (pattern.productivityScore < 50) {
        recommendations.push({
            user: userId,
            type: 'study',
            content: 'Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break',
            reason: 'Your productivity score was below average',
            priority: 8
        });
    }
    
    if (pattern.distractions > 3) {
        recommendations.push({
            user: userId,
            type: 'wellness',
            content: 'Consider using focus music or white noise to minimize distractions',
            reason: 'You reported multiple distractions during your study session',
            priority: 7
        });
    }
    
    if (pattern.energyLevel < 4) {
        recommendations.push({
            user: userId,
            type: 'break',
            content: 'Take a 15-minute power nap or go for a short walk to boost energy',
            reason: 'Low energy levels detected',
            priority: 9
        });
    }
    
    for (const rec of recommendations) {
        await Recommendation.create(rec);
    }
    
    return recommendations;
}

module.exports = router;
