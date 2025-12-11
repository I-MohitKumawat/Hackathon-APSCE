# NeuroAssist

**Dementia Early Detection & Cognitive Monitoring Platform**

A comprehensive browser-based system for tracking cognitive health through daily routine monitoring, cognitive assessments, and functional task evaluation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-web-blue)](https://github.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Technology Stack](#-technology-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Features

### Patient Interface
- ✅ **Daily Routine Tracker**: Log medications, meals, water intake, sleep, and mood with large accessible buttons
- ✅ **Cognitive Tests**:
  - Orientation Test (date, day, location)
  - Five-Word Recall Test (memory assessment)
  - Trail-Making Test (number sequencing)
- ✅ **Brain Exercise**: Matching pairs memory game with performance tracking
- ✅ **Functional Task Simulation**: Tea-making workflow with step validation and cognitive challenges
- ✅ **Baseline Assessment**: Initial comprehensive cognitive evaluation

### Caregiver Dashboard
- 📊 **Real-time Risk Scoring**: 0-10 cognitive stability score with traffic-light status (Green/Amber/Red)
- 📈 **Activity Monitoring**: Today's tasks completion tracking
- 🔔 **Alert System**: Rule-driven notifications for missed activities, low test scores, and concerning patterns
- 📉 **7-Day Cognitive Graph**: Visual trend analysis
- 📝 **Test Performance**: Comparison and trending of cognitive assessments
- 🗓️ **Routine Adherence Heatmap**: 7-day adherence visualization
- ⚙️ **Functional Task Analytics**: Completion rates and error patterns

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (version 14.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     ```
   - Should output: `v14.0.0` or higher

2. **npm** (Node Package Manager)
   - Comes bundled with Node.js
   - Verify installation:
     ```bash
     npm --version
     ```
   - Should output: `6.0.0` or higher

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk Space**: 300MB free space for Node.js dependencies
- **Browser**: Modern web browser (Chrome, Firefox, Safari, or Edge)
- **Internet**: Required for initial npm package installation only

---

## 📦 Installation

### Step 1: Download or Clone the Project

If you have Git installed:
```bash
git clone <repository-url>
cd Hackathon-APSCE
```

Or download the project as a ZIP file and extract it to your desired location.

### Step 2: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`, type `cmd`, press Enter
- Navigate to project directory:
  ```cmd
  cd C:\dev\Hackathon-APSCE
  ```

**macOS/Linux:**
- Open Terminal application
- Navigate to project directory:
  ```bash
  cd /path/to/Hackathon-APSCE
  ```

### Step 3: Install Dependencies

Run the following command to install all required Node.js packages:

```bash
npm install
```

This will install:
- **express** (v4.18.2) - Web server framework
- **better-sqlite3** (v12.5.0) - SQLite database driver
- **body-parser** (v1.20.2) - Request body parsing middleware
- **cors** (v2.8.5) - Cross-Origin Resource Sharing middleware
- **uuid** (v9.0.0) - Unique identifier generation

**Expected Output:**
```
npm WARN deprecated ...
added 150 packages from 200 contributors
```

**Installation Time:** Approximately 2-5 minutes depending on internet speed.

### Step 4: Verify Installation

Check that all dependencies installed correctly:

```bash
npm list --depth=0
```

You should see:
```
neuroassist@1.0.0
├── better-sqlite3@12.5.0
├── body-parser@1.20.2
├── cors@2.8.5
├── express@4.18.2
└── uuid@9.0.0
```

---

## 🚀 Running the Application

### Start the Server

From the project directory, run:

```bash
npm start
```

Or alternatively:

```bash
node server.js
```

**Expected Output:**
```
✅ Database initialized successfully
✅ NeuroAssist server running on http://localhost:3000
📊 API endpoints ready at http://localhost:3000/api/
💾 Database: SQLite persistent storage
👤 Demo user created: John Doe (ID: <uuid>)
```

### Access the Application

Once the server is running, open your web browser and navigate to:

**Landing Page:**
```
http://localhost:3000
```

**Patient Interface:**
```
http://localhost:3000/patient.html
```

**Caregiver Dashboard:**
```
http://localhost:3000/dashboard.html
```

**Onboarding/Baseline Assessment:**
```
http://localhost:3000/onboarding.html
```

### Stop the Server

To stop the server, press:
```
Ctrl + C
```
(On Mac: `Cmd + C`)

Then confirm by typing `Y` if prompted.

---

## 📂 Project Structure

```
Hackathon-APSCE/
│
├── server.js                 # Main Express.js backend server (791 lines)
├── database.js              # SQLite database layer with all CRUD operations (538 lines)
├── package.json             # Node.js dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── neuroassist.db          # SQLite database file (auto-created)
│
├── public/                  # Frontend files (served statically)
│   ├── index.html          # Landing/welcome page
│   ├── patient.html        # Patient interface - activities, tests, games
│   ├── patient.css         # Patient interface styles
│   ├── patient.js          # Patient interface logic (25KB)
│   │
│   ├── dashboard.html      # Caregiver dashboard
│   ├── dashboard.css       # Dashboard styles
│   ├── dashboard.js        # Dashboard logic with charts
│   │
│   ├── onboarding.html     # Baseline assessment interface
│   ├── onboarding.css      # Onboarding styles
│   ├── onboarding.js       # Onboarding logic (20KB)
│   │
│   ├── baseline-report.html # Assessment results page
│   │
│   ├── common.css          # Shared design system and utilities
│   └── common.js           # Shared JavaScript utilities
│
├── README.md               # This file - installation and usage guide
├── writeup.doc             # Comprehensive project documentation
├── TESTING.md              # Testing checklist and procedures
└── DEBUG-CHECKLIST.md      # Debugging guide
```

---

## 📖 Usage Guide

### First Time Setup

#### 1. Create a User Account

**Option A: Use Demo User**
- A demo user "John Doe" is automatically created when you first start the server
- You can use this account immediately for testing

**Option B: Complete Onboarding**
1. Navigate to `http://localhost:3000/onboarding.html`
2. Enter your name
3. Complete the baseline cognitive assessment:
   - Orientation test (3 questions)
   - Five-word recall test
   - Trail-making test
   - Tea-making task simulation
4. Review your baseline report
5. Click "Go to Dashboard" to start monitoring

### Patient Daily Workflow

1. **Access Patient Interface**
   ```
   http://localhost:3000/patient.html
   ```

2. **Log Daily Activities**
   - Click large buttons to log: Medication, Breakfast, Lunch, Dinner, Water, Sleep
   - Select mood with emoji buttons

3. **Complete Cognitive Tests** (Weekly recommended)
   - Orientation Test: Takes 30 seconds
   - Five-Word Recall: Takes 2 minutes
   - Trail-Making Test: Takes 1-2 minutes

4. **Play Brain Games** (Optional)
   - Matching Pairs game for memory practice

5. **Functional Tasks** (Weekly recommended)
   - "Make a Cup of Tea" simulation

### Caregiver Daily Workflow

1. **Access Dashboard**
   ```
   http://localhost:3000/dashboard.html
   ```

2. **Monitor Risk Score**
   - Check the traffic-light colored score (0-10)
   - 🟢 Green (8-10): All good
   - 🟡 Amber (5-7): Monitor closely
   - 🔴 Red (0-4): Take action

3. **Review Alerts**
   - Check unread alerts badge
   - Read any concerning patterns:
     - Missed medications
     - Low test scores
     - Negative mood patterns
     - Cognitive decline vs baseline

4. **Analyze Trends**
   - View 7-day stability graph
   - Check test performance scores
   - Review routine adherence heatmap

5. **Take Action** (if needed)
   - Contact healthcare provider with data
   - Increase monitoring frequency
   - Adjust care plan

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### User Management

**Create User**
```http
POST /api/users
Content-Type: application/json

Body:
{
  "name": "Jane Smith",
  "role": "patient",
  "dateOfBirth": "1950-05-20"
}

Response: 201 Created
{
  "id": "uuid-string",
  "name": "Jane Smith",
  "role": "patient",
  "date_of_birth": "1950-05-20",
  "created_at": "2025-12-11T12:00:00.000Z"
}
```

**User Login**
```http
POST /api/login
Content-Type: application/json

Body:
{
  "name": "Jane Smith"
}

Response: 200 OK
{
  "id": "uuid-string",
  "name": "Jane Smith",
  ...
}
```

#### Baseline Assessment

**Submit Baseline**
```http
POST /api/baseline-assessment
Content-Type: application/json

Body:
{
  "userId": "uuid-string",
  "cognitiveScore": 8,
  "functionalScore": 7,
  "totalScore": 15,
  "riskLevel": "normal",
  "components": {
    "orientation": 3,
    "recall": 5,
    "trail": 2
  }
}
```

**Get Baseline Report**
```http
GET /api/baseline-report/:userId

Response: 200 OK
{
  "baseline": { ... },
  "recommendations": [ ... ],
  "interpretation": "..."
}
```

#### Routine Logging

**Log Activity**
```http
POST /api/routine-log
Content-Type: application/json

Body:
{
  "userId": "uuid-string",
  "activity": "medication",
  "value": 1,
  "mood": "happy"
}
```

**Get Routine Logs**
```http
GET /api/routine-log/:userId?days=7

Response: 200 OK
[
  {
    "id": "log-uuid",
    "activity": "medication",
    "value": 1,
    "timestamp": "2025-12-11T08:30:00.000Z"
  },
  ...
]
```

#### Cognitive Tests

**Submit Test Result**
```http
POST /api/cognitive-test
Content-Type: application/json

Body:
{
  "userId": "uuid-string",
  "testType": "orientation",
  "score": 3,
  "maxScore": 3,
  "timeTaken": 45000,
  "details": { ... }
}
```

#### Dashboard & Analytics

**Get Dashboard Data**
```http
GET /api/dashboard/:userId?days=7

Response: 200 OK
{
  "riskScore": { "score": 8, "level": "green" },
  "todayActivities": [ ... ],
  "alerts": [ ... ],
  "stabilityHistory": [ ... ],
  "testPerformance": [ ... ],
  "routineAdherence": [ ... ],
  "functionalTasks": [ ... ]
}
```

**Get Risk Score**
```http
GET /api/risk-score/:userId

Response: 200 OK
{
  "score": 8,
  "status": "green",
  "breakdown": {
    "missedMedications": 0,
    "abnormalFunctionalTasks": 0,
    ...
  }
}
```

**Get Alerts**
```http
GET /api/alerts/:userId?unreadOnly=true

Response: 200 OK
[
  {
    "id": "alert-uuid",
    "type": "cognitive",
    "priority": "high",
    "message": "Low score on orientation test",
    "timestamp": "2025-12-11T10:00:00.000Z",
    "read": false
  },
  ...
]
```

---

## ⚙️ Configuration

### Environment Variables

You can configure the server using environment variables:

**Port Configuration:**
```bash
# Windows
set PORT=8080 && npm start

# macOS/Linux
PORT=8080 npm start
```

**Database Location:**
The database file `neuroassist.db` is created in the project root directory by default.

### Default Settings

- **Server Port:** 3000
- **Database:** SQLite (neuroassist.db)
- **Risk Score Refresh:** Calculated on-demand per API call
- **Dashboard Auto-Refresh:** 30 seconds (configurable in dashboard.js)
- **Data Retention:** All historical data (no auto-cleanup)

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Stop any other application using port 3000
2. Or change the port:
   ```bash
   PORT=3001 npm start
   ```

### Issue: Module Not Found

**Error Message:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database Locked

**Error Message:**
```
Error: SQLITE_BUSY: database is locked
```

**Solution:**
1. Stop all running instances of the server (Ctrl+C)
2. Delete `neuroassist.db` (WARNING: This deletes all data)
3. Restart the server to recreate the database

### Issue: Windows Build Errors (better-sqlite3)

**Error Message:**
```
Error: Python not found / MSBuild not found
```

**Solution:**
Install Windows Build Tools:
```bash
npm install --global windows-build-tools
npm install
```

Or use pre-built binaries (already included in better-sqlite3 v12.5+).

### Issue: Cannot Access Localhost

**Solution:**
1. Verify server is running (check for green checkmark output)
2. Try `http://127.0.0.1:3000` instead of `localhost`
3. Check firewall settings
4. Ensure no VPN blocking local connections

### Issue: Charts Not Displaying

**Solution:**
1. Check browser console for JavaScript errors (F12)
2. Ensure dashboard.js is loading correctly
3. Verify API is returning data:
   ```
   http://localhost:3000/api/dashboard/<userId>
   ```

---

## 🛠️ Technology Stack

### Backend
- **Node.js** (v14+) - JavaScript runtime
- **Express.js** (v4.18.2) - Web framework
- **Better-SQLite3** (v12.5.0) - Embedded database
- **UUID** (v9.0.0) - Unique ID generation
- **CORS** - Cross-origin resource sharing
- **Body-Parser** - JSON request parsing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Custom Properties
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Canvas API** - Custom chart rendering
- **Fetch API** - HTTP requests

### Database
- **SQLite** - Lightweight relational database
- **7 tables** - Normalized schema
- **Foreign keys** - Data integrity
- **Indexes** - Query performance

### Architecture
- **RESTful API** - Standard HTTP methods
- **MVC-like pattern** - Separation of concerns
- **Static file serving** - Express middleware
- **JSON data exchange** - API communication

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use 2-space indentation
- Follow camelCase naming conventions
- Add comments for complex logic
- Test all API endpoints before committing

---

## 📝 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 NeuroAssist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

For issues, questions, or suggestions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [TESTING.md](TESTING.md) for testing procedures
3. Consult [DEBUG-CHECKLIST.md](DEBUG-CHECKLIST.md) for debugging steps
4. Open an issue on GitHub (if using version control)

---

## 🙏 Acknowledgments

- Clinical assessment methods based on MMSE, MoCA, and TMT standards
- Inspired by real-world dementia care challenges
- Built with accessibility and user dignity in mind

---

## 📊 Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Check installed packages
npm list --depth=0

# Run on different port
PORT=8080 npm start
```

### Essential URLs

```
Landing Page:    http://localhost:3000
Patient:         http://localhost:3000/patient.html
Dashboard:       http://localhost:3000/dashboard.html
Onboarding:      http://localhost:3000/onboarding.html
API Base:        http://localhost:3000/api
```

### Default Demo User

```
Name: John Doe
Role: patient
Date of Birth: 1945-03-15
(Auto-created on first server start)
```

---

**Built with ❤️ for early dementia detection and cognitive health monitoring.**

*Last Updated: December 11, 2025*
