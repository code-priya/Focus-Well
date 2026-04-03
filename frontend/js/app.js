// API Configuration
const API_URL = 'http://localhost:5000/api';

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message and redirect
        errorDiv.className = 'success-message';
        errorDiv.textContent = 'Registration successful! Redirecting...';
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } catch (error) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

// Dashboard functions
async function loadDashboard() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    document.getElementById('userName').textContent = user.name || 'User';
    
    try {
        // Load tasks
        const tasksResponse = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!tasksResponse.ok) {
            throw new Error('Failed to load tasks');
        }
        
        const tasksData = await tasksResponse.json();
        updateTasksUI(tasksData);
        
        // Load moods
        const moodsResponse = await fetch(`${API_URL}/moods`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (moodsResponse.ok) {
            const moodsData = await moodsResponse.json();
            updateMoodUI(moodsData);
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function updateTasksUI(data) {
    // Update stats
    document.getElementById('completedTasks').textContent = data.stats.completed || 0;
    document.getElementById('pendingTasks').textContent = data.stats.pending || 0;
    document.getElementById('completionRate').textContent = data.stats.completionRate || 0;
    
    // Update tasks list
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    data.tasks.slice(0, 5).forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}')">
        </div>
        <div class="task-details">
            <h4>${task.title}</h4>
            <p>${task.subject} - Due: ${new Date(task.deadline).toLocaleDateString()}</p>
        </div>
        <div class="task-priority ${task.priority}">${task.priority}</div>
    `;
    return div;
}

function updateMoodUI(data) {
    const moodHistory = document.getElementById('moodHistory');
    moodHistory.innerHTML = '';
    
    data.moods.slice(0, 7).forEach(mood => {
        const moodElement = document.createElement('div');
        moodElement.className = 'mood-entry';
        moodElement.innerHTML = `
            <span class="mood-emoji">${getMoodEmoji(mood.mood)}</span>
            <span class="mood-date">${new Date(mood.createdAt).toLocaleDateString()}</span>
        `;
        moodHistory.appendChild(moodElement);
    });
}

function getMoodEmoji(mood) {
    const emojis = {
        great: '😄',
        good: '🙂',
        okay: '😐',
        stressed: '😰',
        tired: '😴',
        anxious: '😟',
        motivated: '💪'
    };
    return emojis[mood] || '😐';
}

async function addTask(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        // Reload tasks
        loadDashboard();
        event.target.reset();
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Failed to add task');
    }
}

async function toggleTask(taskId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: true })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        // Reload tasks
        loadDashboard();
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
    }
}

async function logMood(mood) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/moods`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mood })
        });
        
        if (!response.ok) {
            throw new Error('Failed to log mood');
        }
        
        const data = await response.json();
        
        // Show supportive response
        const responseDiv = document.getElementById('moodResponse');
        responseDiv.innerHTML = `<p>${data.response}</p>`;
        responseDiv.style.display = 'block';
        
        // Reload mood history
        loadDashboard();
    } catch (error) {
        console.error('Error logging mood:', error);
        showError('Failed to log mood');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    document.querySelector('.main-content').prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Add task form
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', addTask);
    }
    
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            logMood(mood);
        });
    });
});
