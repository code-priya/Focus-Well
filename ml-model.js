// ML Model for stress prediction and recommendations
class StressMLModel {
    constructor() {
        this.model = null;
        this.recommendations = {
            low: {
                title: "Low Stress Level",
                description: "You're managing stress well! Here are some tips to maintain your healthy state:",
                activities: [
                    {
                        icon: "🧘",
                        title: "Maintenance Meditation",
                        description: "10-minute daily mindfulness practice",
                        duration: "10 mins/day"
                    },
                    {
                        icon: "📚",
                        title: "Stress Prevention Reading",
                        description: "Read about stress management techniques",
                        duration: "15 mins/day"
                    },
                    {
                        icon: "🚶",
                        title: "Regular Exercise",
                        description: "Light physical activity to maintain balance",
                        duration: "30 mins/day"
                    }
                ],
                quickTips: [
                    "Practice gratitude daily",
                    "Maintain your current healthy habits",
                    "Stay connected with supportive people",
                    "Get adequate sleep (7-9 hours)"
                ]
            },
            moderate: {
                title: "Moderate Stress Level",
                description: "You're experiencing some stress. Here are strategies to help you cope:",
                activities: [
                    {
                        icon: "🧘",
                        title: "Guided Meditation",
                        description: "20-minute guided relaxation session",
                        duration: "20 mins/day"
                    },
                    {
                        icon: "📝",
                        title: "Stress Journaling",
                        description: "Write down stressors and potential solutions",
                        duration: "15 mins/day"
                    },
                    {
                        icon: "🏃",
                        title: "Aerobic Exercise",
                        description: "Moderate cardio to release endorphins",
                        duration: "30 mins/day"
                    },
                    {
                        icon: "🎵",
                        title: "Music Therapy",
                        description: "Listen to calming music or nature sounds",
                        duration: "20 mins/day"
                    }
                ],
                quickTips: [
                    "Take short breaks during work",
                    "Practice deep breathing exercises",
                    "Limit caffeine and alcohol intake",
                    "Reach out to friends or family"
                ]
            },
            high: {
                title: "High Stress Level",
                description: "You're experiencing significant stress. It's important to take action:",
                activities: [
                    {
                        icon: "🏥",
                        title: "Professional Consultation",
                        description: "Consider speaking with a mental health professional",
                        duration: "As needed"
                    },
                    {
                        icon: "🧘",
                        title: "Intensive Relaxation",
                        description: "45-minute deep relaxation session",
                        duration: "45 mins/day"
                    },
                    {
                        icon: "🥗",
                        title: "Nutritional Support",
                        description: "Focus on stress-reducing foods and supplements",
                        duration: "Ongoing"
                    },
                    {
                        icon: "💤",
                        title: "Sleep Hygiene",
                        description: "Establish a strict sleep routine",
                        duration: "8 hours/night"
                    },
                    {
                        icon: "🤝",
                        title: "Support Group",
                        description: "Join a stress management support group",
                        duration: "Weekly"
                    }
                ],
                quickTips: [
                    "Practice emergency stress relief techniques",
                    "Avoid major decisions when stressed",
                    "Seek professional help if symptoms persist",
                    "Prioritize self-care activities"
                ]
            }
        };
    }

    // Calculate stress level based on answers
    predictStressLevel(answers) {
        const totalScore = answers.reduce((sum, value) => sum + value, 0);
        const maxScore = answers.length * 5;
        const percentage = (totalScore / maxScore) * 100;
        
        let level;
        if (percentage <= 35) {
            level = 'low';
        } else if (percentage <= 65) {
            level = 'moderate';
        } else {
            level = 'high';
        }
        
        return {
            score: Math.round(percentage),
            level: level,
            rawScore: totalScore
        };
    }

    // Get recommendations based on stress level
    getRecommendations(level) {
        return this.recommendations[level] || this.recommendations.moderate;
    }

    // Generate personalized insights
    generateInsights(answers) {
        const insights = [];
        const categories = {
            sleep: answers[1], // Question about sleep
            anxiety: answers[2], // Question about anxiety
            concentration: answers[3], // Question about concentration
            physical: answers[4], // Question about physical symptoms
            workLife: answers[5], // Question about work-life balance
            social: answers[8] // Question about social support
        };

        if (categories.sleep >= 4) {
            insights.push("Your sleep quality needs immediate attention - try establishing a consistent bedtime routine");
        }
        
        if (categories.anxiety >= 4) {
            insights.push("Consider learning anxiety management techniques like deep breathing or grounding exercises");
        }
        
        if (categories.physical >= 4) {
            insights.push("Physical symptoms suggest high stress - try incorporating relaxation techniques throughout your day");
        }
        
        if (categories.social >= 4) {
            insights.push("Building your support network could help - consider joining group activities or reaching out to friends");
        }

        return insights;
    }
}

// Initialize model and display results when on results page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('results.html')) {
        displayResults();
    }
});

function displayResults() {
    const resultsData = localStorage.getItem('stressResults');
    if (!resultsData) {
        window.location.href = 'stress-test.html';
        return;
    }

    const results = JSON.parse(resultsData);
    const model = new StressMLModel();
    const prediction = model.predictStressLevel(results.answers);
    const recommendations = model.getRecommendations(prediction.level);
    const insights = model.generateInsights(results.answers);

    // Update UI with results
    document.getElementById('stressScore').textContent = prediction.score;
    
    const stressLevelElement = document.getElementById('stressLevel');
    stressLevelElement.innerHTML = `
        <span class="level-indicator"></span>
        <span class="level-text">${recommendations.title}</span>
    `;
    stressLevelElement.className = `stress-level ${prediction.level}-stress`;

    // Display recommendations
    const recommendationsList = document.getElementById('recommendations');
    recommendationsList.innerHTML = `
        <p>${recommendations.description}</p>
        ${recommendations.activities.map(activity => `
            <div class="recommendation-item">
                <i class="fas fa-${getIconForActivity(activity.icon)}"></i>
                <div>
                    <strong>${activity.title}</strong>
                    <p>${activity.description}</p>
                    <small>⏱️ ${activity.duration}</small>
                </div>
            </div>
        `).join('')}
    `;

    // Display quick tips
    const tipsList = document.getElementById('quickTips');
    tipsList.innerHTML = recommendations.quickTips.map(tip => `
        <li><i class="fas fa-check-circle" style="color: #00b894;"></i> ${tip}</li>
    `).join('');

    // Create stress breakdown chart
    createStressChart(prediction, results.answers);
}

function getIconForActivity(icon) {
    const iconMap = {
        '🧘': 'meditation',
        '📚': 'book-open',
        '🚶': 'walking',
        '📝': 'pencil-alt',
        '🏃': 'running',
        '🎵': 'music',
        '🏥': 'hospital',
        '🥗': 'utensils',
        '💤': 'moon',
        '🤝': 'handshake'
    };
    return iconMap[icon] || 'heart';
}

function createStressChart(prediction, answers) {
    const ctx = document.getElementById('stressChart').getContext('2d');
    
    // Calculate category scores
    const categories = [
        { name: 'Work/Life', score: (answers[5] / 5) * 100 },
        { name: 'Sleep', score: (answers[1] / 5) * 100 },
        { name: 'Anxiety', score: (answers[2] / 5) * 100 },
        { name: 'Physical', score: (answers[4] / 5) * 100 },
        { name: 'Social', score: (answers[8] / 5) * 100 }
    ];

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                label: 'Your Stress Levels',
                data: categories.map(c => c.score),
                backgroundColor: 'rgba(108, 92, 231, 0.2)',
                borderColor: 'rgba(108, 92, 231, 1)',
                pointBackgroundColor: 'rgba(108, 92, 231, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(108, 92, 231, 1)'
            }]
        },
        options: {
            scale: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function downloadResults() {
    const resultsData = localStorage.getItem('stressResults');
    if (!resultsData) return;
    
    const results = JSON.parse(resultsData);
    const model = new StressMLModel();
    const prediction = model.predictStressLevel(results.answers);
    
    const report = `
        FOCUS WELL - STRESS ASSESSMENT REPORT
        Generated: ${new Date().toLocaleString()}
        
        Your Stress Score: ${prediction.score}/100
        Stress Level: ${prediction.level.toUpperCase()}
        
        This report is for informational purposes only and not a medical diagnosis.
        Please consult with a healthcare professional for medical advice.
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focus-well-report.txt';
    a.click();
}
