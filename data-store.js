/**
 * In-Memory Data Store for NeuroAssist
 * Collections: users, routine_logs, cognitive_tests, functional_tasks, alerts, risk_scores
 */

const { v4: uuidv4 } = require('uuid');

// Data collections
const dataStore = {
    users: [],
    routine_logs: [],
    cognitive_tests: [],
    functional_tasks: [],
    alerts: [],
    risk_scores: []
};

// Helper functions
const store = {
    // Users
    createUser(userData) {
        const user = {
            id: uuidv4(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        dataStore.users.push(user);
        return user;
    },

    getUserById(userId) {
        return dataStore.users.find(u => u.id === userId);
    },

    // Routine Logs
    addRoutineLog(logData) {
        const log = {
            id: uuidv4(),
            ...logData,
            timestamp: new Date().toISOString()
        };
        dataStore.routine_logs.push(log);
        return log;
    },

    getRoutineLogsByUser(userId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dataStore.routine_logs
            .filter(log => log.userId === userId && new Date(log.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Cognitive Tests
    addCognitiveTest(testData) {
        const test = {
            id: uuidv4(),
            ...testData,
            timestamp: new Date().toISOString()
        };
        dataStore.cognitive_tests.push(test);
        return test;
    },

    getCognitiveTestsByUser(userId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dataStore.cognitive_tests
            .filter(test => test.userId === userId && new Date(test.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Functional Tasks
    addFunctionalTask(taskData) {
        const task = {
            id: uuidv4(),
            ...taskData,
            timestamp: new Date().toISOString()
        };
        dataStore.functional_tasks.push(task);
        return task;
    },

    getFunctionalTasksByUser(userId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dataStore.functional_tasks
            .filter(task => task.userId === userId && new Date(task.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Alerts
    createAlert(alertData) {
        const alert = {
            id: uuidv4(),
            ...alertData,
            timestamp: new Date().toISOString(),
            read: false
        };
        dataStore.alerts.push(alert);
        return alert;
    },

    getAlertsByUser(userId, unreadOnly = false) {
        let alerts = dataStore.alerts.filter(alert => alert.userId === userId);
        if (unreadOnly) {
            alerts = alerts.filter(alert => !alert.read);
        }
        return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    markAlertAsRead(alertId) {
        const alert = dataStore.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
        }
        return alert;
    },

    // Risk Scores
    addRiskScore(scoreData) {
        const score = {
            id: uuidv4(),
            ...scoreData,
            timestamp: new Date().toISOString()
        };
        dataStore.risk_scores.push(score);
        return score;
    },

    getRiskScoresByUser(userId, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dataStore.risk_scores
            .filter(score => score.userId === userId && new Date(score.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    getLatestRiskScore(userId) {
        const scores = dataStore.risk_scores
            .filter(score => score.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return scores[0] || null;
    },

    // Utility: Get all data for a user (for dashboard)
    getAllUserData(userId, days = 7) {
        return {
            user: this.getUserById(userId),
            routineLogs: this.getRoutineLogsByUser(userId, days),
            cognitiveTests: this.getCognitiveTestsByUser(userId, days),
            functionalTasks: this.getFunctionalTasksByUser(userId, days),
            alerts: this.getAlertsByUser(userId),
            riskScores: this.getRiskScoresByUser(userId, days)
        };
    }
};

module.exports = store;
