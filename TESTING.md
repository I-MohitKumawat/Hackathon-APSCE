# NeuroAssist - Testing & Verification Guide

## ✅ Issue Fixed: JavaScript Syntax Error

**Problem Found**: Duplicate `drawLineChart` function declaration in `dashboard.js`
- The function was already imported from `common.js` via `NeuroAssist.drawLineChart`
- Redeclaring it in dashboard.js caused a syntax error
- **Fix Applied**: Removed the duplicate function (122 lines deleted)

**Status**: ✅ All JavaScript files now have valid syntax

---

## 🧪 Testing Instructions

### Step 1: Verify Server is Running

Open your browser and check:
- Server status: http://localhost:3000
- Should see the NeuroAssist landing page with Patient/Caregiver cards

### Step 2: Test Diagnostic Page

Navigate to: **http://localhost:3000/test.html**

This page will automatically test:
1. ✅ JavaScript loading
2. ✅ Common.js library
3. 🔘 API connectivity (click "Test API Connection")
4. 🔘 Database (click "Test Database")
5. 🔘 User creation (click "Create Test User")

**Expected Results**:
- All tests should show green ✓ checkmarks
- Console output should display without errors
- User creation should return a new user ID

---

### Step 3: Test Onboarding Flow

Navigate to: **http://localhost:3000/onboarding.html**

**Test Sequence**:
1. Click "Begin Assessment"
2. **Part 1 - Orientation**: Answer 3 questions (date, day, location)
3. **Part 2 - Memory Recall**: 
   - Watch 5 words for 10 seconds
   - Count backwards distraction
   - Type the words you remember
4. **Part 3 - Trail Making**: Click numbers 1-10 in order
5. **Part 4 - Tea Making**: Click steps in correct sequence:
   - Boil Water → Add Tea Bag → Pour Water → Add Sugar → Stir → Done
6. **Results**: View your baseline score (0-15) and risk level

**What to Check**:
- ✅ All buttons respond to clicks
- ✅ Progress bar advances
- ✅ Timers count down
- ✅ Inputs accept text
- ✅ Final score calculates correctly
- ✅ Report displays with recommendations

---

### Step 4: Test Patient Interface

Navigate to: **http://localhost:3000/patient.html**

**Daily Routine Tracker**:
1. Click each large button (Medication, Breakfast, Lunch, Dinner, Water, Sleep)
2. **Expected**: Success animation + toast notification "Activity logged!"
3. Click mood buttons (😊 Happy, 😐 Normal, 😕 Confused)
4. **Expected**: Toast showing "Mood logged!"

**Cognitive Tests**:

**Test 1 - Orientation Check**:
1. Click "Start Test" button
2. Answer 3 questions
3. **Expected**: Score shows (X/3), feedback message

**Test 2 - Five-Word Recall**:
1. Click "Start Test"
2. Watch words for 10 seconds
3. Count backwards
4. Type words in input fields
5. Click "Submit"
6. **Expected**: Score shows (X/5)

**Test 3 - Trail-Making**:
1. Click "Start Test"
2. Click numbers 1-10 in order
3. **Expected**: Timer runs, errors counted, score calculated

**Matching Pairs Game**:
1. Click "Play" button
2. Click cards to flip and match pairs
3. **Expected**: Cards flip, matches stay revealed, completion message

**Tea-Making Task**:
1. Click "Start Task"
2. Click steps in order: Boil → Tea Bag → Pour → Sugar → Stir → Done
3. **Expected**: Steps turn green when correct, red when wrong

---

### Step 5: Test Caregiver Dashboard

Navigate to: **http://localhost:3000/dashboard.html**

**Layout Check**:
- ✅ Header shows patient name
- ✅ Risk score badge visible (top right)
- ✅ "Today's Activities" panel populated
- ✅ Alerts panel (may be empty initially)
- ✅ 7-day cognitive stability graph
- ✅ Cognitive test performance section
- ✅ Routine adherence heatmap
- ✅ Functional tasks analytics

**Interactivity Check**:
- ✅ Data loads automatically
- ✅ Refresh every 30 seconds (watch for updates)
- ✅ Alert count badge updates
- ✅ Graphs render correctly

---

### Step 6: Test Data Persistence

**Test Database Persistence**:
1. Complete a cognitive test on patient interface
2. Stop the server: `Ctrl+C` in terminal
3. Restart server: `npm start`
4. Go to dashboard
5. **Expected**: Previous test results still visible

---

## 🔍 Common Issues & Solutions

### Issue: Buttons Don't Respond

**Check**:
1. Open browser console (F12)
2. Look for JavaScript errors
3. Verify `NeuroAssist` object exists: Type `console.log(NeuroAssist)` in console

**Solution**:
- Hard refresh: `Ctrl+Shift+R` (Chrome/Edge) or `Ctrl+F5`
- Clear browser cache
- Check server is running on port 3000

### Issue: API Errors

**Check**:
1. Server terminal for error messages
2. Browser console Network tab for failed requests
3. Verify server running: http://localhost:3000

**Solution**:
- Restart server: `Ctrl+C` then `npm start`
- Check SQLite database exists: Look for `neuroassist.db` file

### Issue: Data Not Saving

**Check**:
1. Browser console for API errors
2. Server terminal for database errors
3. Verify `neuroassist.db` file created

**Solution**:
- Check file permissions on project folder
- Delete `neuroassist.db` and restart server (will recreate)

### Issue: Layout Looks Broken

**Check**:
1. Browser console for CSS loading errors
2. Network tab for failed CSS requests

**Solution**:
- Verify all CSS files in `public/` folder
- Hard refresh browser
- Check CSS file paths in HTML

---

## 📊 API Testing with cURL

Test backend directly:

```powershell
# Test user creation
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{\"name\":\"Test User\",\"role\":\"patient\"}'

# Test routine log (replace USER_ID)
curl -X POST http://localhost:3000/api/routine-log -H "Content-Type: application/json" -d '{\"userId\":\"USER_ID\",\"activity\":\"medication\"}'

# Get dashboard data (replace USER_ID)
curl http://localhost:3000/api/dashboard/USER_ID

# Test baseline assessment (replace USER_ID)
curl -X POST http://localhost:3000/api/baseline-assessment -H "Content-Type: application/json" -d '{\"userId\":\"USER_ID\",\"cognitiveScore\":8,\"functionalScore\":4,\"totalScore\":12,\"riskLevel\":\"normal\",\"components\":{\"orientation\":3,\"recall\":4,\"trail\":1,\"teaTask\":4}}'
```

---

## ✅ Verification Checklist

Before considering the system fully functional, verify:

### Frontend
- [x] All JavaScript files have valid syntax
- [ ] All buttons respond to clicks
- [ ] Forms submit correctly
- [ ] Animations play smoothly
- [ ] Toast notifications appear
- [ ] Modal popups work
- [ ] Navigation works between pages

### Backend
- [x] Server starts without errors
- [x] SQLite database created
- [ ] All API endpoints respond
- [ ] Data persists across restarts
- [ ] Alerts generate correctly
- [ ] Risk scores calculate

### Integration
- [ ] Patient actions appear in dashboard
- [ ] Baseline assessment saves to database
- [ ] Trend analysis works
- [ ] Decline detection triggers alerts
- [ ] Heatmap updates with new data
- [ ] Graphs render with data

---

## 🎯 Quick Functional Test Script

**Complete this sequence to verify everything works**:

1. Go to: http://localhost:3000/test.html
   - Click all test buttons → All should be green ✓

2. Go to: http://localhost:3000/onboarding.html
   - Complete full assessment → Get score & risk level

3. Go to: http://localhost:3000/patient.html
   - Log medication → Toast appears
   - Complete orientation test → Score shows
   - Start tea task → Steps respond

4. Go to: http://localhost:3000/dashboard.html
   - See logged medication in "Today's Activities"
   - See test score in performance section
   - Graph shows data

**If all 4 steps work: System is fully functional! ✅**

---

## 🐛 Debugging Tools

### Browser Console Commands

```javascript
// Check if NeuroAssist loaded
console.log(NeuroAssist);

// Check current user
console.log(NeuroAssist.getCurrentUser());

// Test API manually
NeuroAssist.api.get('/dashboard/demo-patient').then(console.log);

// Create test user
NeuroAssist.api.post('/users', {name: 'Debug User', role: 'patient'}).then(console.log);
```

### Server Logs

Watch terminal for:
- ✅ `Database initialized successfully`
- ✅ `NeuroAssist server running on http://localhost:3000`
- ✅ API request logs (if enabled)
- ❌ Error stack traces
- ❌ Database errors

---

## 📝 Next Steps After Testing

Once frontend is working:

1. **Test all features systematically** using this guide
2. **Report any specific buttons/features not working**
3. **Check browser console** for JavaScript errors
4. **Verify API responses** in Network tab
5. **Test data flow** from patient → database → dashboard

The syntax error has been fixed. All JavaScript should now load and execute properly!
