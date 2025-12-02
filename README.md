# NeuroAssist

**Dementia Early Detection & Cognitive Monitoring Platform**

A comprehensive browser-based system for tracking cognitive health through daily routine monitoring, cognitive assessments, and functional task evaluation.

## 🌟 Features

### Patient Interface
- **Daily Routine Tracker**: Log medications, meals, water intake, sleep, and mood with large accessible buttons
- **Cognitive Tests**:
  - Orientation Test (date, day, location)
  - Five-Word Recall Test (memory assessment)
  - Trail-Making Test (number sequencing)
- **Brain Exercise**: Matching pairs memory game
- **Functional Task Simulation**: Tea-making workflow with step validation

### Caregiver Dashboard
- **Real-time Risk Scoring**: 0-10 cognitive stability score with traffic-light status (Green/Amber/Red)
- **Activity Monitoring**: Today's tasks completion tracking
- **Alert System**: Rule-driven notifications for missed activities, low test scores, and concerning patterns
- **7-Day Cognitive Graph**: Visual trend analysis
- **Test Performance**: Comparison and trending of cognitive assessments
- **Routine Adherence Heatmap**: 7-day adherence visualization
- **Functional Task Analytics**: Completion rates and error patterns

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Access the Application

- **Landing Page**: http://localhost:3000
- **Patient Interface**: http://localhost:3000/patient.html
- **Caregiver Dashboard**: http://localhost:3000/dashboard.html

## 📊 API Endpoints

### Users
- `POST /api/users` - Create user account
- `POST /api/login` - User authentication

### Routine Logging
- `POST /api/routine-log` - Log daily activity
- `GET /api/routine-log/:userId` - Get routine logs

### Cognitive Tests
- `POST /api/cognitive-test` - Submit test results
- `GET /api/cognitive-test/:userId` - Get test history

### Functional Tasks
- `POST /api/functional-task` - Submit task results
- `GET /api/functional-task/:userId` - Get task history

### Analytics
- `GET /api/dashboard/:userId` - Get all dashboard data
- `GET /api/risk-score/:userId` - Get current risk score
- `GET /api/alerts/:userId` - Get alerts

## 🧮 Risk Score Algorithm

```javascript
score = 10
  - (missed_medications_7days × 1)
  - (abnormal_functional_tasks × 2)
  - (low_memory_recall_avg × 1)
  - (slow_trail_making_avg × 1)
  - (negative_mood_days × 1)
```

**Traffic-Light Status:**
- 🟢 Green (8-10): Good condition
- 🟡 Amber (5-7): Needs attention
- 🔴 Red (0-4): Immediate concern

## 🎨 Design Philosophy

- **Accessibility First**: Large buttons, high contrast, WCAG AA compliance
- **Clinical Aesthetic**: Professional medical blue palette with trust-building design
- **Calming Interface**: Gentle animations, encouraging feedback, positive reinforcement
- **Responsive**: Works on desktop, tablet, and mobile devices

## 📁 Project Structure

```
neuroassist/
├── server.js              # Express backend server
├── data-store.js          # In-memory data storage
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Landing page
│   ├── patient.html       # Patient interface
│   ├── patient.css        # Patient styles
│   ├── patient.js         # Patient logic
│   ├── dashboard.html     # Caregiver dashboard
│   ├── dashboard.css      # Dashboard styles
│   ├── dashboard.js       # Dashboard logic
│   ├── common.css         # Shared design system
│   └── common.js          # Shared utilities
└── README.md
```

## 🔧 Technology Stack

- **Backend**: Node.js + Express.js
- **Data Storage**: In-memory (upgradeable to MongoDB)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Charts**: Canvas-based custom charts

## 🎯 Key Design Decisions

1. **No External Dependencies**: Pure vanilla JavaScript for rapid development and minimal overhead
2. **In-Memory Storage**: Suitable for demo and prototype; easily upgradeable to persistent database
3. **Modular Architecture**: Separation of concerns between patient interface, dashboard, and backend
4. **Rule-Based Intelligence**: No ML required; uses validated clinical thresholds
5. **Real-Time Updates**: Dashboard auto-refreshes every 30 seconds

## 🧪 Testing the System

### Patient Flow
1. Visit patient interface
2. Log daily activities (medication, meals, mood)
3. Complete cognitive tests (orientation, recall, trail-making)
4. Play matching pairs game
5. Complete tea-making task

### Caregiver Flow
1. Visit dashboard
2. View risk score and activity summary
3. Check alerts for concerning patterns
4. Review 7-day cognitive stability trend
5. Analyze test performance and adherence

## 📈 Future Enhancements

- PDF report generation
- Email/SMS notifications
- Multi-patient management
- Persistent database (MongoDB/PostgreSQL)
- Advanced analytics and ML predictions
- Mobile apps (React Native)
- Integration with EHR systems

## 🔒 Privacy & Security

- All data stored locally (in-memory)
- No external API calls
- No camera or sensor access
- No location tracking
- HIPAA-ready architecture

## 📝 License

MIT License - See LICENSE file for details

## 👥 Demo User

A demo patient "John Doe" is automatically created on server startup for testing purposes.

---

Built with ❤️ for early dementia detection and cognitive health monitoring.
