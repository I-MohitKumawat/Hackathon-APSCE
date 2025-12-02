/**
 * Caregiver Dashboard JavaScript
 * Displays patient data, analytics, risk scores, and alerts
 */

// ============================================
// RISK SCORE UPDATE
// ============================================

function updateRiskScore(riskScore) {
  const badge = document.getElementById('riskScoreBadge');
  const value = badge.querySelector('.risk-score-value');

  if (!riskScore || riskScore.score === undefined) {
    value.textContent = '-';
    return;
  }

  value.textContent = riskScore.score.toFixed(1);

  // Color code based on score (0-10 scale)
  badge.classList.remove('risk-low', 'risk-medium', 'risk-high');
  if (riskScore.score >= 7) {
    badge.classList.add('risk-low');
  } else if (riskScore.score >= 4) {
    badge.classList.add('risk-medium');
  } else {
    badge.classList.add('risk-high');
  }
}

// ============================================
// TODAY'S ACTIVITIES
// ============================================

function updateTodayActivities(activities) {
  const container = document.getElementById('todayActivities');

  if (!activities || activities.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No activities logged today</p></div>';
    return;
  }

  let html = '<div class="activity-list">';
  activities.forEach(activity => {
    const icon = activity.type === 'routine' ? '✓' : '🧠';
    const time = new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    html += `
            <div class="activity-item">
                <span class="activity-icon">${icon}</span>
                <div class="activity-details">
                    <div class="activity-name">${activity.name || activity.type}</div>
                    <div class="activity-time">${time}</div>
                </div>
            </div>
        `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// ALERTS
// ============================================

function updateAlerts(alerts) {
  const container = document.getElementById('alertsList');
  const count = document.getElementById('alertCount');

  if (!alerts || alerts.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No alerts</p></div>';
    count.textContent = '0';
    return;
  }

  count.textContent = alerts.length;

  let html = '<div class="alerts-list">';
  alerts.forEach(alert => {
    const severity = alert.severity || 'info';
    const icon = severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : 'ℹ️';
    html += `
            <div class="alert-item alert-${severity}">
                <span class="alert-icon">${icon}</span>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${NeuroAssist.getRelativeTime(alert.timestamp)}</div>
                </div>
            </div>
        `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// STABILITY CHART
// ============================================

function updateStabilityChart(stabilityHistory) {
  const canvas = document.getElementById('stabilityChart');
  if (!canvas || !stabilityHistory || stabilityHistory.length === 0) {
    return;
  }

  const days = stabilityHistory.slice(-7);
  const labels = days.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
  const scores = days.map(d => d.score);

  NeuroAssist.drawLineChart(canvas, {
    labels,
    datasets: [{
      label: 'Cognitive Stability',
      data: scores,
      color: '#2563eb'
    }],
    yMin: 0,
    yMax: 10
  });
}

// ============================================
// TEST PERFORMANCE
// ============================================

function updateTestPerformance(testPerformance) {
  const container = document.getElementById('testPerformance');

  if (!testPerformance || testPerformance.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🧠</div><p>No cognitive tests completed yet</p></div>';
    return;
  }

  let html = '<div class="test-list">';
  testPerformance.slice(0, 5).forEach(test => {
    const scorePercent = (test.score / test.maxScore) * 100;
    const statusClass = scorePercent >= 70 ? 'test-good' : scorePercent >= 40 ? 'test-medium' : 'test-poor';

    html += `
            <div class="test-item ${statusClass}">
                <div>
                    <div class="test-name">${test.name}</div>
                    <div class="test-date">${NeuroAssist.getRelativeTime(test.timestamp)}</div>
                </div>
                <div class="test-score">
                    <span class="score-value">${test.score}/${test.maxScore}</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scorePercent}%"></div>
                    </div>
                </div>
            </div>
        `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// ROUTINE HEATMAP
// ============================================

function updateRoutineHeatmap(routineAdherence) {
  const container = document.getElementById('routineHeatmap');

  if (!routineAdherence || routineAdherence.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No routine data available</p></div>';
    return;
  }

  const last7Days = routineAdherence.slice(-7);

  let html = '<div class="heatmap-grid">';
  last7Days.forEach(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const completed = day.completed || 0;
    const total = day.total || 1;
    const percentage = (completed / total) * 100;
    const level = percentage >= 80 ? 3 : percentage >= 50 ? 2 : percentage >= 20 ? 1 : 0;

    html += `
            <div class="heatmap-day">
                <div class="heatmap-cell level-${level}" title="${completed}/${total} tasks completed">
                    <span class="heatmap-value">${completed}</span>
                </div>
                <div class="heatmap-label">${dayName}</div>
            </div>
        `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// FUNCTIONAL TASKS
// ============================================

function updateFunctionalTasks(functionalTasks) {
  const container = document.getElementById('functionalTasks');

  if (!functionalTasks || functionalTasks.length === 0) {
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
                    <div class="test-date">${NeuroAssist.getRelativeTime(task.timestamp)}</div>
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
// INITIALIZATION
// ============================================

async function initDashboard() {
  try {
    console.log('Initializing dashboard...');

    // Get current user
    const user = NeuroAssist.getCurrentUser();

    // Redirect if no user or invalid user
    if (!user) {
      console.log('No user found, redirecting to home');
      window.location.href = '/';
      return;
    }

    if (user.id === 'demo-user' || user.id === 'demo-patient') {
      console.log('Invalid demo user, clearing and redirecting');
      NeuroAssist.clearCurrentUser();
      window.location.href = '/';
      return;
    }

    console.log('Loading dashboard for user:', user.id);

    // Set patient name and date
    document.getElementById('patientName').textContent = user.name;
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Fetch dashboard data
    const data = await NeuroAssist.api.get(`/dashboard/${user.id}`);
    console.log('Dashboard data loaded:', data);

    // Update all sections
    updateRiskScore(data.riskScore);
    updateTodayActivities(data.todayActivities || []);
    updateAlerts(data.alerts || []);
    updateStabilityChart(data.stabilityHistory || []);
    updateTestPerformance(data.testPerformance || []);
    updateRoutineHeatmap(data.routineAdherence || []);
    updateFunctionalTasks(data.functionalTasks || []);

  } catch (error) {
    console.error('Dashboard initialization error:', error);

    // Show error state in all loading sections
    document.querySelectorAll('.loading').forEach(el => {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Unable to load data. Please try refreshing.</p></div>';
    });

    NeuroAssist.showToast('Error loading dashboard data', 'error');
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
