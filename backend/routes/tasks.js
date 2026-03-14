const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ deadline: 1 });
        
        // Calculate statistics
        const completedTasks = tasks.filter(t => t.completed).length;
        const pendingTasks = tasks.filter(t => !t.completed).length;
        const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
        
        res.json({
            tasks,
            stats: {
                completed: completedTasks,
                pending: pendingTasks,
                totalHours,
                completionRate: tasks.length ? (completedTasks / tasks.length * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, subject, deadline, estimatedHours, priority } = req.body;
        
        const task = new Task({
            user: req.userId,
            title,
            description,
            subject,
            deadline,
            estimatedHours,
            priority
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update task
router.put('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.taskId,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updates = ['title', 'description', 'subject', 'deadline', 'estimatedHours', 'priority', 'completed'];
        updates.forEach(update => {
            if (req.body[update] !== undefined) {
                task[update] = req.body[update];
            }
        });

        if (req.body.completed === true && !task.completedAt) {
            task.completedAt = new Date();
            
            // Update user's study streak
            const user = req.user;
            const lastActive = new Date(user.lastActive);
            const today = new Date();
            
            if (lastActive.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
                user.studyStreak += 1;
            } else if (lastActive.toDateString() !== today.toDateString()) {
                user.studyStreak = 1;
            }
            
            user.lastActive = new Date();
            await user.save();
        }

        await task.save();
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete task
router.delete('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.taskId,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
