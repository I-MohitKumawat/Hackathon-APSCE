/**
 * NeuroAssist Backend Server with SQLite
 * Express.js API for cognitive monitoring platform
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
db.initDatabase();

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

        const user = db.createUser({ name, role, dateOfBirth, caregiverId });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Simple login (get user by name)
app.post('/api/login', (req, res) => {
    try {
        const { name } = req.body;
        const users = db.getAllUsers();
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const user = db.getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// BASELINE ASSESSMENT ENDPOINTS
// ============================================

// Submit baseline assessment
app.post('/api/baseline-assessment', (req, res) => {
    try {
        const { userId, cognitiveScore, functionalScore, totalScore, riskLevel, components } = req.body;

        if (!userId || cognitiveScore === undefined || functionalScore === undefined) {
            return res.status(400).json({ error: 'UserId, cognitiveScore, and functionalScore are required' });
        }

        const baseline = db.insertBaselineAssessment({
            userId,
            cognitiveScore,
            functionalScore,
            totalScore,
            riskLevel,
            components
        });

        res.status(201).json(baseline);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get baseline assessment for user
app.get('/api/baseline-assessment/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const baseline = db.getBaselineByUserId(userId);

        if (!baseline) {
            return res.status(404).json({ error: 'No baseline assessment found' });
        }

        res.json(baseline);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get baseline report with recommendations
app.get('/api/baseline-report/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const baseline = db.getBaselineByUserId(userId);

        if (!baseline) {
            return res.status(404).json({ error: 'No baseline assessment found' });
        }

        // Generate recommendations based on risk level
        let recommendations = [];
        if (baseline.risk_level === 'normal') {
            recommendations = [
                'Continue regular cognitive monitoring (weekly tests)',
                'Maintain healthy lifestyle with regular exercise',
                'Engage in mentally stimulating activities',
                'Schedule annual cognitive check-ups'
            ];
        } else if (baseline.risk_level === 'mild') {
            recommendations = [
                'Complete cognitive tests twice weekly',
                'Engage in daily cognitive exercises',
                'Consider consultation with healthcare provider',
                'Monitor for any changes in daily routines',
                'Maintain social engagement and activities'
            ];
        } else { // high
            recommendations = [
                'Medical consultation strongly recommended',
                'Complete daily cognitive monitoring',
                'Caregiver should monitor closely',
                'Consider comprehensive neurological evaluation',
                'Maintain structured daily routine'
            ];
        }

        res.json({
            baseline,
            recommendations,
            interpretation: getRiskLevelInterpretation(baseline.risk_level, baseline.total_score)
        });
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

        const log = db.insertRoutineLog({ userId, activity, value, mood });

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

        const logs = db.getRoutineLogs(userId, days);
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

        const test = db.insertCognitiveTest({
            userId,
            testType,
            score,
            maxScore,
            details,
            timeTaken
        });

        // Check for cognitive decline alerts
        checkCognitiveAlerts(userId, testType, score, maxScore);

        // Check for decline vs baseline
        checkBaselineDecline(userId);

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

        const tests = db.getCognitiveTests(userId, days);
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

        const task = db.insertFunctionalTask({
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
            db.insertAlert({
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

        const tasks = db.getFunctionalTasks(userId, days);
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
        db.insertRiskScore({
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

        // Get raw data from database
        const rawData = db.getAllUserData(userId, days);
        const riskScore = calculateRiskScore(userId);

        // Transform to match frontend expectations
        const dashboardData = {
            // Risk score (frontend expects 'riskScore' object)
            riskScore: {
                score: riskScore?.score || 0,
                level: riskScore?.status || 'unknown',
                trend: 'stable' // Can be enhanced later with trend calculation
            },

            // Today's activities (combine routines + tests from today)
            todayActivities: getTodayActivities(rawData),

            // Alerts (already correct format)
            alerts: (rawData.alerts || []).map(alert => ({
                message: alert.message,
                severity: alert.priority,
                timestamp: alert.timestamp
            })),

            // 7-day stability history (transform risk scores)
            stabilityHistory: transformStabilityHistory(rawData.riskScores),

            // Test performance (transform cognitive tests)
            testPerformance: (rawData.cognitiveTests || []).map(test => ({
                name: test.test_type || test.testType || 'Cognitive Test',
                score: test.score,
                maxScore: test.max_score || test.maxScore || 10,
                timestamp: test.timestamp
            })),

            // Routine adherence (aggregate by day)
            routineAdherence: aggregateRoutinesByDay(rawData.routineLogs),

            // Functional tasks (transform to expected format)
            functionalTasks: (rawData.functionalTasks || []).map(task => ({
                sequenceCorrect: task.sequence_correct || task.sequenceCorrect,
                errors: task.errors,
                timeTaken: task.time_taken || task.timeTaken,
                timestamp: task.timestamp
            }))
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function: Get today's activities
function getTodayActivities(rawData) {
    const today = new Date().toDateString();
    const activities = [];

    // Add routine logs from today
    if (rawData.routineLogs) {
        rawData.routineLogs.forEach(log => {
            if (new Date(log.timestamp).toDateString() === today) {
                activities.push({
                    type: 'routine',
                    name: log.activity,
                    timestamp: log.timestamp
                });
            }
        });
    }

    // Add cognitive tests from today
    if (rawData.cognitiveTests) {
        rawData.cognitiveTests.forEach(test => {
            if (new Date(test.timestamp).toDateString() === today) {
                activities.push({
                    type: 'test',
                    name: test.test_type || test.testType || 'Cognitive Test',
                    timestamp: test.timestamp
                });
            }
        });
    }

    return activities.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

// Helper function: Transform stability history
function transformStabilityHistory(riskScores) {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Find score for this day
        const dayScore = riskScores?.find(s =>
            s.timestamp.startsWith(dateString)
        );

        last7Days.push({
            date: dateString,
            score: dayScore?.score || 5 // Default to mid-range if no data
        });
    }

    return last7Days;
}

// Helper function: Aggregate routines by day
function aggregateRoutinesByDay(routineLogs) {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const dayLogs = routineLogs?.filter(log =>
            log.timestamp.startsWith(dateString)
        ) || [];

        // Count completed activities (value > 0 or mood exists)
        const completed = dayLogs.filter(log =>
            log.value > 0 || log.mood
        ).length;

        last7Days.push({
            date: dateString,
            completed: completed,
            total: Math.max(dayLogs.length, 1) // Avoid division by zero
        });
    }

    return last7Days;
}

// Get trend analysis (current vs baseline)
app.get('/api/trend-analysis/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const baseline = db.getBaselineByUserId(userId);

        if (!baseline) {
            return res.status(404).json({ error: 'No baseline assessment found' });
        }

        const recentTests = db.getCognitiveTests(userId, 7);
        const trendAnalysis = calculateTrendAnalysis(baseline, recentTests);

        res.json(trendAnalysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get alerts
app.get('/api/alerts/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const unreadOnly = req.query.unreadOnly === 'true';

        const alerts = db.getAlerts(userId, unreadOnly);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark alert as read
app.patch('/api/alerts/:alertId/read', (req, res) => {
    try {
        const { alertId } = req.params;
        const alert = db.markAlertAsRead(alertId);

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
        negativeMoodDays: 0,
        trendFactor: 0
    };

    // Get last 7 days of data
    const routineLogs = db.getRoutineLogs(userId, 7);
    const cognitiveTests = db.getCognitiveTests(userId, 7);
    const functionalTasks = db.getFunctionalTasks(userId, 7);

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

    // 6. Check trend vs baseline
    const baseline = db.getBaselineByUserId(userId);
    if (baseline && cognitiveTests.length > 0) {
        const baselineCognitivePercent = (baseline.cognitive_score / 10) * 100;

        // Calculate recent average
        const totalRecentScore = cognitiveTests.reduce((sum, test) => {
            return sum + (test.score / test.maxScore) * 100;
        }, 0);
        const recentAvgPercent = totalRecentScore / cognitiveTests.length;

        const decline = baselineCognitivePercent - recentAvgPercent;

        if (decline > 20) {
            breakdown.trendFactor = -2; // Significant decline
            score -= 2;
        } else if (decline > 10) {
            breakdown.trendFactor = -1; // Mild decline
            score -= 1;
        }
    }

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
// TREND ANALYSIS
// ============================================

function calculateTrendAnalysis(baseline, recentTests) {
    if (!baseline || recentTests.length === 0) {
        return {
            hasBaseline: false,
            message: 'Insufficient data for trend analysis'
        };
    }

    const baselineCognitiveScore = baseline.cognitive_score;

    // Calculate recent average by test type
    const testsByType = {};
    recentTests.forEach(test => {
        if (!testsByType[test.testType]) {
            testsByType[test.testType] = [];
        }
        testsByType[test.testType].push(test);
    });

    const trends = {};
    Object.keys(testsByType).forEach(testType => {
        const tests = testsByType[testType];
        const recentAvg = tests.reduce((sum, t) => sum + (t.score / t.maxScore) * 100, 0) / tests.length;

        // Get baseline component score
        const baselineComponents = baseline.components;
        let baselineScore = 0;
        if (testType === 'orientation' && baselineComponents.orientation) {
            baselineScore = (baselineComponents.orientation / 3) * 100;
        } else if (testType === 'recall' && baselineComponents.recall) {
            baselineScore = (baselineComponents.recall / 5) * 100;
        } else if (testType === 'trail-making' && baselineComponents.trail) {
            baselineScore = (baselineComponents.trail / 2) * 100;
        }

        const change = recentAvg - baselineScore;
        trends[testType] = {
            baseline: baselineScore.toFixed(1),
            current: recentAvg.toFixed(1),
            change: change.toFixed(1),
            direction: change > 10 ? 'improving' : change < -10 ? 'declining' : 'stable'
        };
    });

    return {
        hasBaseline: true,
        baselineDate: baseline.timestamp,
        baselineScore: baselineCognitiveScore,
        trends
    };
}

// ============================================
// ALERT GENERATION LOGIC
// ============================================

function checkRoutineAlerts(userId) {
    const logs = db.getRoutineLogs(userId, 7);

    // Check for consecutive missed medications
    const today = new Date().toDateString();
    const todayMeds = logs.filter(log =>
        log.activity === 'medication' &&
        new Date(log.timestamp).toDateString() === today
    );

    if (todayMeds.length === 0) {
        const hour = new Date().getHours();
        if (hour >= 18) { // After 6 PM
            db.insertAlert({
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
        db.insertAlert({
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
        db.insertAlert({
            userId,
            type: 'cognitive',
            priority: 'high',
            message: `Low score on ${testType} test: ${score}/${maxScore} (${percentage.toFixed(0)}%)`,
            data: { testType, score, maxScore }
        });
    } else if (percentage < 60) {
        db.insertAlert({
            userId,
            type: 'cognitive',
            priority: 'medium',
            message: `Below average score on ${testType} test: ${score}/${maxScore}`,
            data: { testType, score, maxScore }
        });
    }
}

function checkBaselineDecline(userId) {
    const baseline = db.getBaselineByUserId(userId);
    if (!baseline) return;

    const recentTests = db.getCognitiveTests(userId, 7);
    if (recentTests.length === 0) return;

    const trendAnalysis = calculateTrendAnalysis(baseline, recentTests);

    // Check for significant decline in any test type
    Object.keys(trendAnalysis.trends || {}).forEach(testType => {
        const trend = trendAnalysis.trends[testType];
        if (trend.direction === 'declining' && parseFloat(trend.change) < -15) {
            db.insertAlert({
                userId,
                type: 'trend',
                priority: 'high',
                message: `Significant decline detected in ${testType} test (${trend.change}% from baseline)`,
                data: { testType, ...trend }
            });
        }
    });
}

function getRiskLevelInterpretation(riskLevel, totalScore) {
    if (riskLevel === 'normal') {
        return `Score: ${totalScore}/15 - No cognitive impairment detected. Continue regular monitoring.`;
    } else if (riskLevel === 'mild') {
        return `Score: ${totalScore}/15 - Mild Cognitive Impairment (MCI) indicators. Increased monitoring recommended.`;
    } else {
        return `Score: ${totalScore}/15 - Early dementia indicators detected. Medical consultation recommended.`;
    }
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`✅ NeuroAssist server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints ready at http://localhost:${PORT}/api/`);
    console.log(`💾 Database: SQLite persistent storage`);

    // Create demo user if database is empty
    const users = db.getAllUsers();
    if (users.length === 0) {
        const demoUser = db.createUser({
            name: 'John Doe',
            role: 'patient',
            dateOfBirth: '1945-03-15'
        });
        console.log(`👤 Demo user created: ${demoUser.name} (ID: ${demoUser.id})`);
    } else {
        console.log(`👤 Found ${users.length} existing user(s) in database`);
    }
});
