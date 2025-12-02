/**
 * Caregiver Dashboard JavaScript
 * Displays patient data, analytics, risk scores, and alerts
 */

// const { api, formatDate, ... } = NeuroAssist; // REMOVED to avoid collisions
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
