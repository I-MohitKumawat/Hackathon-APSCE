/**
 * Caregiver Dashboard JavaScript
 * Displays patient data, analytics, risk scores, and alerts
 */

const { api, formatDate, formatTime, getRelativeTime, drawLineChart, getCurrentUser } = NeuroAssist;

let patientId = 'demo-patient';
let dashboardData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user && user.role === 'patient') {
        patientId = user.id;
    }

    loadDashboard();

    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});

// ============================================
// MAIN DASHBOARD LOADER
// ============================================

async function loadDashboard() {
    try {
        // Fetch all dashboard data
        const [dashboard, riskScore, alerts] = await Promise.all([
            api.get(`/dashboard/${patientId}`),
            api.get(`/risk-score/${patientId}`),
            api.get(`/alerts/${patientId}`)
        ]);

        dashboardData = { ...dashboard, riskScore, alerts };

        // Update all sections
        updateHeader(dashboard.user);
        updateRiskScore(riskScore);
        updateTodayActivities(dashboard.routineLogs);
        updateAlerts(alerts);
        updateCognitiveStabilityGraph(dashboard.riskScores);
        updateTestPerformance(dashboard.cognitiveTests);
        updateRoutineHeatmap(dashboard.routineLogs);
        updateFunctionalTasks(dashboard.functionalTasks);

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============================================
// HEADER & RISK SCORE
// ============================================

function updateHeader(user) {
    if (user) {
        document.getElementById('patientName').textContent = user.name;
    }
}

function updateRiskScore(riskScore) {
    const badge = document.getElementById('riskScoreBadge');

    if (!riskScore) {
        badge.className = 'risk-score-badge';
        badge.querySelector('.risk-score-value').textContent = '-';
        return;
    }

    badge.className = `risk-score-badge ${riskScore.status}`;
    badge.querySelector('.risk-score-value').textContent = riskScore.score.toFixed(1);
}

// ============================================
// TODAY'S ACTIVITIES
// ============================================

function updateTodayActivities(routineLogs) {
    const container = document.getElementById('todayActivities');
    const today = new Date().toDateString();
    document.getElementById('todayDate').textContent = formatDate(new Date());

    // Expected activities
    const expectedActivities = ['medication', 'breakfast', 'lunch', 'dinner', 'water'];

    // Filter today's logs
    const todayLogs = routineLogs.filter(log =>
        new Date(log.timestamp).toDateString() === today
    );

    // Group by activity
    const activityMap = {};
    todayLogs.forEach(log => {
        if (!activityMap[log.activity]) {
            activityMap[log.activity] = [];
        }
        activityMap[log.activity].push(log);
    });

    if (todayLogs.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No activities logged today</p></div>';
        return;
    }

    let html = '<div class="activity-list">';

    expectedActivities.forEach(activity => {
        const logs = activityMap[activity] || [];
        const completed = logs.length > 0;
        const latestLog = logs[logs.length - 1];

        const icons = {
            medication: '💊',
            breakfast: '🍳',
            lunch: '🍽️',
            dinner: '🍲',
            water: '💧'
        };

        html += `
      <div class="activity-item ${completed ? 'completed' : 'missed'}">
        <div class="activity-info">
          <span class="activity-icon">${icons[activity] || '📌'}</span>
          <div>
            <div class="activity-name">${activity.charAt(0).toUpperCase() + activity.slice(1)}</div>
            ${completed && latestLog ? `<div class="activity-time">${formatTime(latestLog.timestamp)}</div>` : ''}
          </div>
        </div>
        <span class="activity-status ${completed ? 'done' : 'pending'}">
          ${completed ? '✓ Done' : 'Pending'}
        </span>
      </div>
    `;
    });

    // Add mood if logged
    if (activityMap.mood) {
        const moodLog = activityMap.mood[activityMap.mood.length - 1];
        const moodIcons = { happy: '😊', normal: '😐', confused: '😕' };
        html += `
      <div class="activity-item completed">
        <div class="activity-info">
          <span class="activity-icon">${moodIcons[moodLog.mood] || '😐'}</span>
          <div>
            <div class="activity-name">Mood: ${moodLog.mood}</div>
            <div class="activity-time">${formatTime(moodLog.timestamp)}</div>
          </div>
        </div>
        <span class="activity-status done">✓ Logged</span>
      </div>
    `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// ALERTS
// ============================================

function updateAlerts(alerts) {
    const container = document.getElementById('alertsList');
    const countBadge = document.getElementById('alertCount');

    const unreadAlerts = alerts.filter(a => !a.read);
    countBadge.textContent = unreadAlerts.length;

    if (alerts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No alerts</p></div>';
        return;
    }

    // Sort by priority and time
    const sortedAlerts = [...alerts].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (diff !== 0) return diff;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const priorityIcons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };

    let html = '<div class="alerts-list">';

    sortedAlerts.slice(0, 10).forEach(alert => {
        html += `
      <div class="alert-item ${alert.priority}">
        <div class="alert-header">
          <span class="alert-priority">${priorityIcons[alert.priority]}</span>
          <span class="alert-type">${alert.type.replace('_', ' ')}</span>
        </div>
        <div class="alert-message">${alert.message}</div>
        <div class="alert-time">${getRelativeTime(alert.timestamp)}</div>
      </div>
    `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// COGNITIVE STABILITY GRAPH
// ============================================

function updateCognitiveStabilityGraph(riskScores) {
    const canvas = document.getElementById('stabilityChart');

    if (riskScores.length === 0) {
        // Show placeholder
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Inter';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('No data available yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Prepare data (reverse to show oldest first)
    const data = [...riskScores].reverse().map(score => ({
        label: formatDate(score.timestamp),
        value: score.score
    }));

    // Pad with zeros if less than 7 days
    while (data.length < 7) {
        const date = new Date();
        date.setDate(date.getDate() - (7 - data.length));
        data.unshift({ label: formatDate(date), value: 0 });
    }

    drawLineChart(canvas, data, {
        color: '#2563eb',
        strokeWidth: 3,
        showDots: true,
        showGrid: true
    });
}

// ============================================
// COGNITIVE TEST PERFORMANCE
// ============================================

function updateTestPerformance(cognitiveTests) {
    const container = document.getElementById('testPerformance');

    if (cognitiveTests.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🧠</div><p>No cognitive tests completed yet</p></div>';
        return;
    }

    // Group by test type and get latest
    const testTypes = {
        'orientation': 'Orientation Check',
        'recall': 'Memory Recall',
        'trail-making': 'Trail Making'
    };

    const latestTests = {};
    cognitiveTests.forEach(test => {
        if (!latestTests[test.testType] || new Date(test.timestamp) > new Date(latestTests[test.testType].timestamp)) {
            latestTests[test.testType] = test;
        }
    });

    let html = '<div class="test-grid">';

    Object.keys(testTypes).forEach(type => {
        const test = latestTests[type];

        if (test) {
            const percentage = (test.score / test.maxScore) * 100;
            const trend = getTrend(cognitiveTests, type);

            html += `
        <div class="test-item">
          <div class="test-info">
            <div class="test-name">${testTypes[type]}</div>
            <div class="test-date">${getRelativeTime(test.timestamp)}</div>
          </div>
          <div class="test-score">
            <div class="score-value" style="color: ${getScoreColor(percentage)}">${test.score}/${test.maxScore}</div>
            <span class="score-trend ${trend.class}">${trend.icon}</span>
          </div>
        </div>
      `;
        }
    });

    html += '</div>';
    container.innerHTML = html;
}

function getTrend(tests, testType) {
    const typeTests = tests.filter(t => t.testType === testType).slice(0, 3);

    if (typeTests.length < 2) {
        return { icon: '→', class: 'trend-stable' };
    }

    const latest = (typeTests[0].score / typeTests[0].maxScore) * 100;
    const previous = (typeTests[1].score / typeTests[1].maxScore) * 100;

    if (latest > previous + 10) {
        return { icon: '↑', class: 'trend-up' };
    } else if (latest < previous - 10) {
        return { icon: '↓', class: 'trend-down' };
    } else {
        return { icon: '→', class: 'trend-stable' };
    }
}

function getScoreColor(percentage) {
    if (percentage >= 70) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
}

// ============================================
// ROUTINE ADHERENCE HEATMAP
// ============================================

function updateRoutineHeatmap(routineLogs) {
    const container = document.getElementById('routineHeatmap');

    const activities = ['Medication', 'Breakfast', 'Lunch', 'Dinner', 'Water'];
    const days = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date);
    }

    let html = '<div class="heatmap-grid">';

    // Header row
    html += '<div class="heatmap-label"></div>';
    days.forEach(day => {
        html += `<div class="heatmap-day-label">${day.toLocaleDateString('en-US', { weekday: 'short' })}</div>`;
    });

    // Activity rows
    activities.forEach(activity => {
        html += `<div class="heatmap-label">${activity}</div>`;

        days.forEach(day => {
            const dayStr = day.toDateString();
            const activityLower = activity.toLowerCase();

            const dayLogs = routineLogs.filter(log =>
                new Date(log.timestamp).toDateString() === dayStr &&
                log.activity === activityLower
            );

            let cellClass = 'heatmap-cell';
            if (dayLogs.length > 0) {
                cellClass += ' done';
            } else if (day < new Date()) {
                cellClass += ' missed';
            }

            html += `<div class="${cellClass}" title="${activity} - ${formatDate(day)}"></div>`;
        });
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// FUNCTIONAL TASKS
// ============================================

function updateFunctionalTasks(functionalTasks) {
    const container = document.getElementById('functionalTasks');

    if (functionalTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">☕</div><p>No functional tasks completed yet</p></div>';
        return;
    }

    // Calculate stats
    const totalTasks = functionalTasks.length;
    const perfectTasks = functionalTasks.filter(t => t.sequenceCorrect && t.errors === 0).length;
    const avgTime = functionalTasks.reduce((sum, t) => sum + (t.timeTaken || 0), 0) / totalTasks;
    const avgErrors = functionalTasks.reduce((sum, t) => sum + (t.errors || 0), 0) / totalTasks;

    let html = `
    <div class="task-summary">
      <div class="task-stat">
        <div class="task-stat-value">${totalTasks}</div>
        <div class="task-stat-label">Total Tasks</div>
      </div>
      <div class="task-stat">
        <div class="task-stat-value">${Math.round(avgTime)}s</div>
        <div class="task-stat-label">Avg Time</div>
      </div>
      <div class="task-stat">
        <div class="task-stat-value">${avgErrors.toFixed(1)}</div>
        <div class="task-stat-label">Avg Errors</div>
      </div>
    </div>
    <div class="task-list">
  `;

    functionalTasks.slice(0, 5).forEach(task => {
        html += `
      <div class="task-item">
        <div>
          <div class="test-name">Tea Making Task</div>
          <div class="test-date">${getRelativeTime(task.timestamp)}</div>
        </div>
        <div class="test-score">
          <div style="font-size: var(--font-size-sm); color: var(--neutral-600)">
            ${task.sequenceCorrect ? '✓ Correct' : '✗ Errors'} • ${task.timeTaken}s • ${task.errors} mistakes
          </div>
        </div>
      </div>
    `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// CHART DRAWING (Enhanced)
// ============================================

function drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const {
        color = '#2563eb',
        strokeWidth = 2,
        showDots = true,
        showGrid = true
    } = options;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value), 10);
    const minValue = 0;
    const valueRange = maxValue - minValue || 1;

    // Draw grid & labels
    if (showGrid) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.font = '12px Inter';
        ctx.fillStyle = '#6b7280';

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            const value = maxValue - (valueRange / 5) * i;

            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1), padding - 10, y + 4);
        }
    }

    // Draw area under line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.fillStyle = gradient;
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

    ctx.lineTo(padding + chartWidth, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

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

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    // Draw x-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';

    data.forEach((point, index) => {
        if (index % Math.ceil(data.length / 7) === 0 || index === data.length - 1) {
            const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
            const label = point.label.split(' ')[0]; // Just the date part
            ctx.fillText(label, x, height - padding + 20);
        }
    });
}
