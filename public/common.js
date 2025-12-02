/**
 * Common JavaScript Utilities for NeuroAssist
 */
console.log('Attempting to load common.js...');

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Client
const api = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            showToast(error.message, 'error');
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
};

// Local Storage Helpers
const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};

// Current User Management
function getCurrentUser() {
    return storage.get('currentUser');
}

function setCurrentUser(user) {
    storage.set('currentUser', user);
}

function clearCurrentUser() {
    storage.remove('currentUser');
}

// Date/Time Formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(dateString) {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icon}</span>
    <span>${message}</span>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

// Loading Spinner
function showSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.margin = '2rem auto';
    container.appendChild(spinner);
    return spinner;
}

function hideSpinner(spinner) {
    if (spinner && spinner.parentNode) {
        spinner.remove();
    }
}

// Validation Helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Array Helpers
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomItems(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
}

// Number Helpers
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function roundToDecimal(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Status Color Helper
function getStatusColor(status) {
    const colors = {
        green: 'var(--success-green)',
        amber: 'var(--warning-amber)',
        red: 'var(--danger-red)'
    };
    return colors[status] || colors.amber;
}

function getStatusLabel(status) {
    const labels = {
        green: 'Good Condition',
        amber: 'Needs Attention',
        red: 'Immediate Concern'
    };
    return labels[status] || 'Unknown';
}

// DOM Helpers
function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Chart Helper (Simple Canvas-based)
function drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const {
        color = 'var(--primary-blue)',
        strokeWidth = 2,
        showDots = true,
        showGrid = true
    } = options;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value), 0);
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    if (showGrid) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
    }

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();

    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw dots
    if (showDots) {
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Export all utilities
window.NeuroAssist = {
    api,
    storage,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    formatDate,
    formatTime,
    formatDateTime,
    getRelativeTime,
    showToast,
    showSpinner,
    hideSpinner,
    validateEmail,
    validateRequired,
    shuffleArray,
    getRandomItems,
    clamp,
    roundToDecimal,
    getStatusColor,
    getStatusLabel,
    createElement,
    clearElement,
    debounce,
    drawLineChart
};
console.log('common.js execution completed. NeuroAssist object:', window.NeuroAssist);
