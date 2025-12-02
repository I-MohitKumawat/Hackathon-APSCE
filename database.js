/**
 * SQLite Database Layer for NeuroAssist
 * Persistent storage for users, baseline assessments, and monitoring data
 */

const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'neuroassist.db');
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      date_of_birth TEXT,
      caregiver_id TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // Baseline assessments (onboarding)
  db.exec(`
    CREATE TABLE IF NOT EXISTS baseline_assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cognitive_score INTEGER NOT NULL,
      functional_score INTEGER NOT NULL,
      total_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      components TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Routine logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS routine_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity TEXT NOT NULL,
      value INTEGER,
      mood TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cognitive tests
  db.exec(`
    CREATE TABLE IF NOT EXISTS cognitive_tests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      test_type TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      time_taken INTEGER,
      details TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Functional tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS functional_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      completed INTEGER NOT NULL,
      errors INTEGER NOT NULL,
      sequence_correct INTEGER NOT NULL,
      time_taken INTEGER,
      steps TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Alerts
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      read INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Risk scores (historical)
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      score REAL NOT NULL,
      status TEXT NOT NULL,
      breakdown TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_routine_logs_user_timestamp 
    ON routine_logs(user_id, timestamp DESC);
    
    CREATE INDEX IF NOT EXISTS idx_cognitive_tests_user_timestamp 
    ON cognitive_tests(user_id, timestamp DESC);
    
    CREATE INDEX IF NOT EXISTS idx_functional_tasks_user_timestamp 
    ON functional_tasks(user_id, timestamp DESC);
    
    CREATE INDEX IF NOT EXISTS idx_alerts_user_read 
    ON alerts(user_id, read);
    
    CREATE INDEX IF NOT EXISTS idx_risk_scores_user_timestamp 
    ON risk_scores(user_id, timestamp DESC);
  `);

  console.log('✅ Database initialized successfully');
}

// ============================================
// USERS
// ============================================

function createUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (id, name, role, date_of_birth, caregiver_id, onboarding_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    userData.name,
    userData.role,
    userData.dateOfBirth || null,
    userData.caregiverId || null,
    0,
    now
  );
  
  return getUserById(id);
}

function getUserById(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId);
}

function getAllUsers() {
  const stmt = db.prepare('SELECT * FROM users');
  return stmt.all();
}

function updateUserOnboardingStatus(userId, completed) {
  const stmt = db.prepare('UPDATE users SET onboarding_completed = ? WHERE id = ?');
  stmt.run(completed ? 1 : 0, userId);
}

// ============================================
// BASELINE ASSESSMENTS
// ============================================

function insertBaselineAssessment(data) {
  const stmt = db.prepare(`
    INSERT INTO baseline_assessments 
    (id, user_id, cognitive_score, functional_score, total_score, risk_level, components, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.cognitiveScore,
    data.functionalScore,
    data.totalScore,
    data.riskLevel,
    JSON.stringify(data.components),
    now
  );
  
  // Mark user's onboarding as completed
  updateUserOnboardingStatus(data.userId, true);
  
  return getBaselineByUserId(data.userId);
}

function getBaselineByUserId(userId) {
  const stmt = db.prepare('SELECT * FROM baseline_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1');
  const result = stmt.get(userId);
  
  if (result && result.components) {
    result.components = JSON.parse(result.components);
  }
  
  return result;
}

// ============================================
// ROUTINE LOGS
// ============================================

function insertRoutineLog(data) {
  const stmt = db.prepare(`
    INSERT INTO routine_logs (id, user_id, activity, value, mood, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.activity,
    data.value || null,
    data.mood || null,
    now
  );
  
  return { id, ...data, timestamp: now };
}

function getRoutineLogs(userId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    SELECT * FROM routine_logs 
    WHERE user_id = ? AND timestamp >= ?
    ORDER BY timestamp DESC
  `);
  
  return stmt.all(userId, cutoffDate.toISOString());
}

// ============================================
// COGNITIVE TESTS
// ============================================

function insertCognitiveTest(data) {
  const stmt = db.prepare(`
    INSERT INTO cognitive_tests (id, user_id, test_type, score, max_score, time_taken, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.testType,
    data.score,
    data.maxScore,
    data.timeTaken || null,
    data.details ? JSON.stringify(data.details) : null,
    now
  );
  
  return { id, ...data, timestamp: now };
}

function getCognitiveTests(userId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    SELECT * FROM cognitive_tests 
    WHERE user_id = ? AND timestamp >= ?
    ORDER BY timestamp DESC
  `);
  
  const results = stmt.all(userId, cutoffDate.toISOString());
  
  return results.map(test => ({
    ...test,
    details: test.details ? JSON.parse(test.details) : null
  }));
}

// ============================================
// FUNCTIONAL TASKS
// ============================================

function insertFunctionalTask(data) {
  const stmt = db.prepare(`
    INSERT INTO functional_tasks 
    (id, user_id, task_type, completed, errors, sequence_correct, time_taken, steps, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.taskType,
    data.completed ? 1 : 0,
    data.errors || 0,
    data.sequenceCorrect ? 1 : 0,
    data.timeTaken || null,
    data.steps ? JSON.stringify(data.steps) : null,
    now
  );
  
  return { id, ...data, timestamp: now };
}

function getFunctionalTasks(userId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    SELECT * FROM functional_tasks 
    WHERE user_id = ? AND timestamp >= ?
    ORDER BY timestamp DESC
  `);
  
  const results = stmt.all(userId, cutoffDate.toISOString());
  
  return results.map(task => ({
    ...task,
    completed: task.completed === 1,
    sequenceCorrect: task.sequence_correct === 1,
    steps: task.steps ? JSON.parse(task.steps) : null
  }));
}

// ============================================
// ALERTS
// ============================================

function insertAlert(data) {
  const stmt = db.prepare(`
    INSERT INTO alerts (id, user_id, type, priority, message, data, read, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.type,
    data.priority,
    data.message,
    data.data ? JSON.stringify(data.data) : null,
    0,
    now
  );
  
  return { id, ...data, read: false, timestamp: now };
}

function getAlerts(userId, unreadOnly = false) {
  let query = 'SELECT * FROM alerts WHERE user_id = ?';
  if (unreadOnly) {
    query += ' AND read = 0';
  }
  query += ' ORDER BY timestamp DESC';
  
  const stmt = db.prepare(query);
  const results = stmt.all(userId);
  
  return results.map(alert => ({
    ...alert,
    read: alert.read === 1,
    data: alert.data ? JSON.parse(alert.data) : null
  }));
}

function markAlertAsRead(alertId) {
  const stmt = db.prepare('UPDATE alerts SET read = 1 WHERE id = ?');
  stmt.run(alertId);
  
  const getStmt = db.prepare('SELECT * FROM alerts WHERE id = ?');
  const result = getStmt.get(alertId);
  
  if (result) {
    return {
      ...result,
      read: true,
      data: result.data ? JSON.parse(result.data) : null
    };
  }
  
  return null;
}

// ============================================
// RISK SCORES
// ============================================

function insertRiskScore(data) {
  const stmt = db.prepare(`
    INSERT INTO risk_scores (id, user_id, score, status, breakdown, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  stmt.run(
    id,
    data.userId,
    data.score,
    data.status,
    data.breakdown ? JSON.stringify(data.breakdown) : null,
    now
  );
  
  return { id, ...data, timestamp: now };
}

function getRiskScores(userId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    SELECT * FROM risk_scores 
    WHERE user_id = ? AND timestamp >= ?
    ORDER BY timestamp DESC
  `);
  
  const results = stmt.all(userId, cutoffDate.toISOString());
  
  return results.map(score => ({
    ...score,
    breakdown: score.breakdown ? JSON.parse(score.breakdown) : null
  }));
}

function getLatestRiskScore(userId) {
  const stmt = db.prepare(`
    SELECT * FROM risk_scores 
    WHERE user_id = ?
    ORDER BY timestamp DESC LIMIT 1
  `);
  
  const result = stmt.get(userId);
  
  if (result && result.breakdown) {
    result.breakdown = JSON.parse(result.breakdown);
  }
  
  return result;
}

// ============================================
// DASHBOARD HELPER
// ============================================

function getAllUserData(userId, days = 7) {
  return {
    user: getUserById(userId),
    baseline: getBaselineByUserId(userId),
    routineLogs: getRoutineLogs(userId, days),
    cognitiveTests: getCognitiveTests(userId, days),
    functionalTasks: getFunctionalTasks(userId, days),
    alerts: getAlerts(userId),
    riskScores: getRiskScores(userId, days)
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  initDatabase,
  
  // Users
  createUser,
  getUserById,
  getAllUsers,
  updateUserOnboardingStatus,
  
  // Baseline
  insertBaselineAssessment,
  getBaselineByUserId,
  
  // Routine
  insertRoutineLog,
  getRoutineLogs,
  
  // Cognitive Tests
  insertCognitiveTest,
  getCognitiveTests,
  
  // Functional Tasks
  insertFunctionalTask,
  getFunctionalTasks,
  
  // Alerts
  insertAlert,
  getAlerts,
  markAlertAsRead,
  
  // Risk Scores
  insertRiskScore,
  getRiskScores,
  getLatestRiskScore,
  
  // Dashboard
  getAllUserData,
  
  // Direct DB access (for advanced queries)
  db
};
