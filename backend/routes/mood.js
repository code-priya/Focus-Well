const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const auth = require('../middleware/auth');

// Get mood history
router.get('/', auth, async (req, res) => {
    try {
        const moods = await Mood.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .limit(30);
        
        // Analyze mood patterns
        const moodCounts = moods.reduce((acc, mood) => {
            acc[mood.mood] = (acc[mood.mood] || 0) + 1;
            return acc;
        }, {});

        res.json({
            moods,
            analysis: {
                total: moods.length,
                distribution: moodCounts,
                mostCommon: Object.keys(moodCounts).length ? 
                    Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b) : null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Log mood
router.post('/', auth, async (req, res) => {
    try {
        const { mood, note } = req.body;
        
        const moodEntry = new Mood({
            user: req.userId,
            mood,
            note
        });

        await moodEntry.save();
        
        // Generate supportive response based on mood
        const responses = {
            great: "That's wonderful to hear! Your positive energy will help you tackle your studies with enthusiasm. Keep shining! ✨",
            good: "Glad you're feeling good! Remember to maintain this positive momentum. You've got this! 💪",
            okay: "It's okay to feel just okay. Sometimes the best thing we can do is acknowledge our feelings and take a small step forward. 🌱",
            stressed: "It's normal to feel stressed with studies. Take a deep breath. Remember, you're doing your best, and that's enough. Would you like to try a quick breathing exercise? 🧘",
            tired: "Rest is important too! Make sure to take breaks and get some rest. Your brain needs time to recharge. Here's a gentle reminder to be kind to yourself. 💤",
            anxious: "Your feelings are valid. Take a moment to breathe deeply. You have overcome challenges before, and you will get through this too. 🌟",
            motivated: "That's the spirit! Channel that motivation into your studies, but remember to pace yourself. You're on fire! 🔥"
        };

        res.status(201).json({
            mood: moodEntry,
            response: responses[mood] || "Thank you for sharing how you feel. Your well-being matters."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get mood insights
router.get('/insights', auth, async (req, res) => {
    try {
        const moods = await Mood.find({ 
            user: req.userId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Calculate mood trends
        const moodByDay = moods.reduce((acc, mood) => {
            const day = mood.createdAt.toDateString();
            if (!acc[day]) acc[day] = [];
            acc[day].push(mood.mood);
            return acc;
        }, {});

        res.json({
            insights: {
                totalEntries: moods.length,
                moodByDay,
                suggestion: getWellnessSuggestion(moods)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

function getWellnessSuggestion(moods) {
    const recentMoods = moods.slice(-5);
    const negativeMoods = recentMoods.filter(m => ['stressed', 'tired', 'anxious'].includes(m.mood)).length;
    
    if (negativeMoods >= 3) {
        return "You've been feeling stressed lately. Consider taking a break, practicing mindfulness, or talking to someone. Your mental health comes first.";
    } else if (recentMoods.length > 0) {
        return "You're doing great at tracking your emotions. Keep up the self-awareness!";
    }
    return "Start logging your moods to receive personalized wellness insights.";
}

module.exports = router;
