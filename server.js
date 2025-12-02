/**
 * NeuroAssist Backend Server
 * Express.js API for cognitive monitoring platform
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const store = require('./data-store');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ============================================
// USER & AUTHENTICATION ENDPOINTS
// ============================================

// Create user
app.post('/api/users', (req, res) => {
    try {
        const { name, role, dateOfBirth, caregiverId } = req.body;

        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }

        const user = store.createUser({ name, role, dateOfBirth, caregiverId });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Simple login (get user by name)
app.post('/api/login', (req, res) => {
    try {
        const { name } = req.body;
        const users = store.dataStore ? store.dataStore.users : [];
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTINE LOGGING ENDPOINTS
// ============================================

// Log routine activity
app.post('/api/routine-log', (req, res) => {
    try {
        const { userId, activity, value, mood } = req.body;

        if (!userId || !activity) {
            return res.status(400).json({ error: 'UserId and activity are required' });
        }

        const log = store.addRoutineLog({ userId, activity, value, mood });

        // Check for alert conditions
        checkRoutineAlerts(userId);

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get routine logs for user
app.get('/api/routine-log/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;

        const logs = store.getRoutineLogsByUser(userId, days);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// COGNITIVE TEST ENDPOINTS
// ============================================

// Submit cognitive test
app.post('/api/cognitive-test', (req, res) => {
    try {
        const { userId, testType, score, maxScore, details, timeTaken } = req.body;

        if (!userId || !testType || score === undefined) {
            return res.status(400).json({ error: 'UserId, testType, and score are required' });
        }

        const test = store.addCognitiveTest({
            userId,
            testType,
            score,
            maxScore,
            details,
            timeTaken
        });

        // Check for cognitive decline alerts
        checkCognitiveAlerts(userId, testType, score, maxScore);

        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get cognitive tests for user
app.get('/api/cognitive-test/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;

        const tests = store.getCognitiveTestsByUser(userId, days);
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// FUNCTIONAL TASK ENDPOINTS
// ============================================

// Submit functional task
app.post('/api/functional-task', (req, res) => {
    try {
        const { userId, taskType, completed, errors, sequenceCorrect, timeTaken, steps } = req.body;

        if (!userId || !taskType) {
            return res.status(400).json({ error: 'UserId and taskType are required' });
        }

        const task = store.addFunctionalTask({
            userId,
            taskType,
            completed,
            errors,
            sequenceCorrect,
            timeTaken,
            steps
        });

        // Check for functional task alerts
        if (!sequenceCorrect || errors > 2) {
            store.createAlert({
                userId,
                type: 'functional_task',
                priority: 'high',
                message: `Functional task "${taskType}" completed with ${errors} errors or incorrect sequence`,
                data: { taskId: task.id, errors, sequenceCorrect }
            });
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get functional tasks for user
app.get('/api/functional-task/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;

        const tasks = store.getFunctionalTasksByUser(userId, days);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RISK SCORE & DASHBOARD ENDPOINTS
// ============================================

// Calculate and get risk score
app.get('/api/risk-score/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const riskScore = calculateRiskScore(userId);

        // Save the calculated score
        store.addRiskScore({
            userId,
            score: riskScore.score,
            status: riskScore.status,
            breakdown: riskScore.breakdown
        });

        res.json(riskScore);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard data
app.get('/api/dashboard/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;

        const data = store.getAllUserData(userId, days);
        const riskScore = calculateRiskScore(userId);

        res.json({
            ...data,
            currentRiskScore: riskScore
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get alerts
app.get('/api/alerts/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const unreadOnly = req.query.unreadOnly === 'true';

        const alerts = store.getAlertsByUser(userId, unreadOnly);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark alert as read
app.patch('/api/alerts/:alertId/read', (req, res) => {
    try {
        const { alertId } = req.params;
        const alert = store.markAlertAsRead(alertId);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RISK SCORE CALCULATION LOGIC
// ============================================

function calculateRiskScore(userId) {
    let score = 10;
    const breakdown = {
        missedMedications: 0,
        abnormalFunctionalTasks: 0,
        lowMemoryRecall: 0,
        slowTrailMaking: 0,
        negativeMoodDays: 0
    };

    // Get last 7 days of data
    const routineLogs = store.getRoutineLogsByUser(userId, 7);
    const cognitiveTests = store.getCognitiveTestsByUser(userId, 7);
    const functionalTasks = store.getFunctionalTasksByUser(userId, 7);

    // 1. Check missed medications (last 7 days)
    const medicationLogs = routineLogs.filter(log => log.activity === 'medication');
    const expectedMeds = 7; // 1 per day
    const missedMeds = Math.max(0, expectedMeds - medicationLogs.length);
    breakdown.missedMedications = missedMeds;
    score -= missedMeds * 1;

    // 2. Check abnormal functional tasks
    const abnormalTasks = functionalTasks.filter(task => !task.sequenceCorrect || task.errors > 2);
    breakdown.abnormalFunctionalTasks = abnormalTasks.length;
    score -= abnormalTasks.length * 2;

    // 3. Check memory recall (Five-Word Recall test)
    const recallTests = cognitiveTests.filter(test => test.testType === 'recall');
    if (recallTests.length > 0) {
        const avgRecall = recallTests.reduce((sum, test) => sum + (test.score / test.maxScore), 0) / recallTests.length;
        if (avgRecall < 0.6) { // Less than 60% recall
            breakdown.lowMemoryRecall = 1;
            score -= 1;
        }
    }

    // 4. Check trail-making performance
    const trailTests = cognitiveTests.filter(test => test.testType === 'trail-making');
    if (trailTests.length > 0) {
        const avgScore = trailTests.reduce((sum, test) => sum + (test.score / test.maxScore), 0) / trailTests.length;
        if (avgScore < 0.5) { // Less than 50% score
            breakdown.slowTrailMaking = 1;
            score -= 1;
        }
    }

    // 5. Check negative mood days
    const moodLogs = routineLogs.filter(log => log.mood === 'confused' || log.mood === 'sad');
    const negativeDays = new Set(moodLogs.map(log => new Date(log.timestamp).toDateString())).size;
    breakdown.negativeMoodDays = negativeDays;
    score -= negativeDays * 1;

    // Ensure score is between 0-10
    score = Math.max(0, Math.min(10, score));

    // Determine status
    let status;
    if (score >= 8) {
        status = 'green'; // Good
    } else if (score >= 5) {
        status = 'amber'; // Caution
    } else {
        status = 'red'; // Concern
    }

    return { score, status, breakdown };
}

// ============================================
// ALERT GENERATION LOGIC
// ============================================

function checkRoutineAlerts(userId) {
    const logs = store.getRoutineLogsByUser(userId, 7);

    // Check for consecutive missed medications
    const today = new Date().toDateString();
    const todayMeds = logs.filter(log =>
        log.activity === 'medication' &&
        new Date(log.timestamp).toDateString() === today
    );

    if (todayMeds.length === 0) {
        const hour = new Date().getHours();
        if (hour >= 18) { // After 6 PM
            store.createAlert({
                userId,
                type: 'routine',
                priority: 'high',
                message: 'Medication not logged today'
            });
        }
    }

    // Check for negative mood patterns
    const recentMoodLogs = logs.filter(log => log.mood === 'confused').slice(0, 3);
    if (recentMoodLogs.length === 3) {
        store.createAlert({
            userId,
            type: 'mood',
            priority: 'medium',
            message: 'Pattern of confusion detected in recent mood logs'
        });
    }
}

function checkCognitiveAlerts(userId, testType, score, maxScore) {
    const percentage = (score / maxScore) * 100;

    if (percentage < 40) {
        store.createAlert({
            userId,
            type: 'cognitive',
            priority: 'high',
            message: `Low score on ${testType} test: ${score}/${maxScore} (${percentage.toFixed(0)}%)`,
            data: { testType, score, maxScore }
        });
    } else if (percentage < 60) {
        store.createAlert({
            userId,
            type: 'cognitive',
            priority: 'medium',
            message: `Below average score on ${testType} test: ${score}/${maxScore}`,
            data: { testType, score, maxScore }
        });
    }
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`✅ NeuroAssist server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints ready at http://localhost:${PORT}/api/`);

    // Create demo user
    const demoUser = store.createUser({
        name: 'John Doe',
        role: 'patient',
        dateOfBirth: '1945-03-15'
    });
    console.log(`👤 Demo user created: ${demoUser.name} (ID: ${demoUser.id})`);
});

// Make dataStore accessible for login endpoint
store.dataStore = require('./data-store.js');
