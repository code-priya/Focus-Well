// Questions array for stress assessment
const questions = [
    {
        id: 1,
        text: "How often do you feel overwhelmed by your responsibilities?",
        options: [
            { value: 1, text: "Rarely or never" },
            { value: 2, text: "Sometimes" },
            { value: 3, text: "Often" },
            { value: 4, text: "Very often" },
            { value: 5, text: "Almost always" }
        ]
    },
    {
        id: 2,
        text: "How would you rate your sleep quality lately?",
        options: [
            { value: 1, text: "Excellent - I sleep soundly and wake up refreshed" },
            { value: 2, text: "Good - Occasional restless nights" },
            { value: 3, text: "Fair - Frequently have trouble sleeping" },
            { value: 4, text: "Poor - Often can't fall asleep or wake up during night" },
            { value: 5, text: "Very poor - Chronic insomnia or disturbed sleep" }
        ]
    },
    {
        id: 3,
        text: "How often do you feel anxious or worried without a clear reason?",
        options: [
            { value: 1, text: "Rarely or never" },
            { value: 2, text: "Once or twice a month" },
            { value: 3, text: "Once or twice a week" },
            { value: 4, text: "Several times a week" },
            { value: 5, text: "Daily or almost daily" }
        ]
    },
    {
        id: 4,
        text: "How well are you able to concentrate on tasks?",
        options: [
            { value: 1, text: "Very well - Can focus for long periods" },
            { value: 2, text: "Well - Minor distractions occasionally" },
            { value: 3, text: "Moderately - Often get distracted" },
            { value: 4, text: "Poorly - Difficulty focusing most of the time" },
            { value: 5, text: "Very poorly - Can't concentrate at all" }
        ]
    },
    {
        id: 5,
        text: "How often do you experience physical symptoms like headaches, muscle tension, or fatigue?",
        options: [
            { value: 1, text: "Rarely or never" },
            { value: 2, text: "Once a month" },
            { value: 3, text: "Once a week" },
            { value: 4, text: "Several times a week" },
            { value: 5, text: "Daily" }
        ]
    },
    {
        id: 6,
        text: "How would you describe your work-life balance?",
        options: [
            { value: 1, text: "Excellent - Well balanced and satisfied" },
            { value: 2, text: "Good - Generally balanced with occasional stress" },
            { value: 3, text: "Fair - Often struggle to maintain balance" },
            { value: 4, text: "Poor - Frequently work/study during personal time" },
            { value: 5, text: "Very poor - No clear boundaries" }
        ]
    },
    {
        id: 7,
        text: "How often do you feel irritable or short-tempered?",
        options: [
            { value: 1, text: "Rarely or never" },
            { value: 2, text: "Once in a while" },
            { value: 3, text: "Sometimes" },
            { value: 4, text: "Often" },
            { value: 5, text: "Very often" }
        ]
    },
    {
        id: 8,
        text: "How often do you engage in relaxing activities or hobbies?",
        options: [
            { value: 1, text: "Daily" },
            { value: 2, text: "Several times a week" },
            { value: 3, text: "Once a week" },
            { value: 4, text: "Rarely" },
            { value: 5, text: "Never" }
        ]
    },
    {
        id: 9,
        text: "How would you rate your social support system?",
        options: [
            { value: 1, text: "Excellent - Strong support network" },
            { value: 2, text: "Good - Few close relationships" },
            { value: 3, text: "Fair - Limited support" },
            { value: 4, text: "Poor - Very few people to talk to" },
            { value: 5, text: "Very poor - Feel completely alone" }
        ]
    },
    {
        id: 10,
        text: "How often do you feel in control of your life?",
        options: [
            { value: 1, text: "Almost always" },
            { value: 2, text: "Most of the time" },
            { value: 3, text: "Sometimes" },
            { value: 4, text: "Rarely" },
            { value: 5, text: "Never" }
        ]
    }
];

let currentQuestion = 0;
let answers = new Array(questions.length).fill(null);

document.addEventListener('DOMContentLoaded', function() {
    loadQuestion(currentQuestion);
    updateProgress();
});

function loadQuestion(index) {
    const container = document.getElementById('questionContainer');
    const question = questions[index];
    
    let html = `
        <div class="question" data-question-id="${question.id}">
            <h3>Question ${index + 1} of ${questions.length}</h3>
            <p>${question.text}</p>
            <div class="options">
    `;
    
    question.options.forEach((option, optIndex) => {
        const checked = answers[index] === optIndex + 1 ? 'checked' : '';
        html += `
            <label class="option">
                <input type="radio" name="question${index}" value="${option.value}" ${checked} onchange="saveAnswer(${index}, ${option.value})">
                <span>${option.text}</span>
            </label>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    
    if (index === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'block';
    } else {
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'none';
    }
    
    document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${questions.length}`;
}

function saveAnswer(questionIndex, value) {
    answers[questionIndex] = value;
}

function changeQuestion(direction) {
    const newIndex = currentQuestion + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
        currentQuestion = newIndex;
        loadQuestion(currentQuestion);
        updateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Handle form submission
document.getElementById('stressTestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if all questions are answered
    if (answers.includes(null)) {
        // Find first unanswered question
        const firstUnanswered = answers.findIndex(ans => ans === null);
        alert('Please answer all questions before submitting.');
        currentQuestion = firstUnanswered;
        loadQuestion(currentQuestion);
        updateProgress();
        return;
    }
    
    // Calculate stress score
    const totalScore = answers.reduce((sum, value) => sum + value, 0);
    const maxScore = questions.length * 5;
    const stressPercentage = (totalScore / maxScore) * 100;
    
    // Store results in localStorage
    const results = {
        score: Math.round(stressPercentage),
        answers: answers,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('stressResults', JSON.stringify(results));
    
    // Redirect to results page
    window.location.href = 'results.html';
});

// Add animation to options on hover
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.option')) {
        e.target.closest('.option').style.transform = 'translateX(10px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.closest('.option')) {
        e.target.closest('.option').style.transform = 'translateX(0)';
    }
});
