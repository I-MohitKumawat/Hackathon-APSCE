# Patient.js Debugging Checklist

## When you load http://localhost:3000/patient.html

Please check your browser console (F12) and report which of these messages appear:

### Expected Messages (in order):

1. ✅ "Attempting to load common.js..."
2. ✅ "common.js execution completed. NeuroAssist object: [Object]"
3. ✅ "patient.js loading..."
4. ✅ "NeuroAssist available? true"
5. ✅ "DOMContentLoaded fired in patient.js"
6. ✅ "Current user: {id: '...', name: '...'}"
7. ✅ "Setting up routine buttons..."
8. ✅ "Found routine buttons: 6"
9. ✅ "Routine button listeners attached"
10. ✅ "Setting up mood buttons..."
11. ✅ "Setting up test cards..."
12. ✅ "Setting up games..."
13. ✅ "Patient.js initialization complete!"

### When you click a button (e.g., Medication):

14. ✅ "Routine button clicked: medication"

---

## Diagnostic Scenarios

### Scenario A: No messages at all
**Problem**: JavaScript is completely blocked or files aren't loading
**Action**: Check Network tab for 404 errors on .js files

### Scenario B: Only messages 1-2 appear
**Problem**: patient.js file isn't loading
**Action**: Check if patient.js exists and is referenced in HTML

### Scenario C: Messages 1-4 appear, then stops
**Problem**: patient.js crashes during initialization
**Action**: Look for red error message after message 4

### Scenario D: All messages 1-13 appear, but no message 14 on click
**Problem**: Event listener attached but not firing
**Action**: Check if buttons have correct class names

### Scenario E: All messages appear including 14
**Problem**: Everything works! Buttons should be functional

---

## Please Report

Copy and paste the EXACT console output when you:
1. Load the patient.html page
2. Click the Medication button

Include any RED error messages.
