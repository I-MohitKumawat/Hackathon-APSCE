/**
 * Onboarding Module - Baseline Assessment
 * Implements cognitive + functional tests for initial identification
 */

// const { api, showToast, ... } = NeuroAssist; // REMOVED to avoid collisions

let currentUser = null;
let assessmentData = {
    orientation: { score: 0, maxScore: 3, answers: [] },
    recall: { score: 0, maxScore: 5, words: [], userAnswers: [] },
    trail: { score: 0, maxScore: 2, time: 0, errors: 0 },
    teaTask: { score: 0, maxScore: 5, errors: 0, sequence: [] }
};

//================================
// NAVIGATION
// ============================================

function startAssessment() {
    showStep('step1');
    renderOrientationTest();
}

function showStep(stepId) {
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

// ============================================
// STEP 1: ORIENTATION TEST
// ============================================

function renderOrientationTest() {
    const container = document.getElementById('orientationTest');
    const today = new Date();

    const questions = [
        {
            question: "What is today's date?",
            correctAnswer: today.getDate(),
            options: generateDateOptions(today.getDate())
        },
        {
            question: "What day of the week is today?",
            correctAnswer: today.toLocaleDateString('en-US', { weekday: 'long' }),
            options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        {
            question: "Where are you right now?",
            correctAnswer: 'Home',
            options: ['Home', 'Hospital', 'Office', 'Clinic']
        }
    ];

    let currentQ = 0;
    const answers = [];

    renderQuestion();

    function renderQuestion() {
        const q = questions[currentQ];

        container.innerHTML = `
      <div class="test-container">
        <div class="question">
          <div class="question-text">${currentQ + 1}. ${q.question}</div>
          <div class="options" id="options"></div>
        </div>
        <div style="text-align: center; margin-top: var(--spacing-6); color: var(--neutral-500);">
          Question ${currentQ + 1} of 3
        </div>
      </div>
    `;

        const optionsContainer = document.getElementById('options');
        q.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.onclick = () => selectAnswer(option);
            optionsContainer.appendChild(btn);
        });
    }

    function selectAnswer(answer) {
        const q = questions[currentQ];
        const isCorrect = answer == q.correctAnswer;

        if (isCorrect) {
            assessmentData.orientation.score++;
        }

        answers.push({ question: q.question, answer, correct: isCorrect });
        currentQ++;

        if (currentQ < 3) {
            renderQuestion();
        } else {
            assessmentData.orientation.answers = answers;
            setTimeout(() => {
                showStep('step2');
                startRecallTest();
            }, 500);
        }
    }
}
/**
 * Onboarding Module - Baseline Assessment
 * Implements cognitive + functional tests for initial identification
 */

// const { api, showToast, ... } = NeuroAssist; // REMOVED to avoid collisions

let currentUser = null;
let assessmentData = {
    orientation: { score: 0, maxScore: 3, answers: [] },
    recall: { score: 0, maxScore: 5, words: [], userAnswers: [] },
    trail: { score: 0, maxScore: 2, time: 0, errors: 0 },
    teaTask: { score: 0, maxScore: 5, errors: 0, sequence: [] }
};

//================================
// NAVIGATION
// ============================================

function startAssessment() {
    showStep('step1');
    renderOrientationTest();
}

function showStep(stepId) {
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

// ============================================
// STEP 1: ORIENTATION TEST
// ============================================

function renderOrientationTest() {
    const container = document.getElementById('orientationTest');
    const today = new Date();

    const questions = [
        {
            question: "What is today's date?",
            correctAnswer: today.getDate(),
            options: generateDateOptions(today.getDate())
        },
        {
            question: "What day of the week is today?",
            correctAnswer: today.toLocaleDateString('en-US', { weekday: 'long' }),
            options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        {
            question: "Where are you right now?",
            correctAnswer: 'Home',
            options: ['Home', 'Hospital', 'Office', 'Clinic']
        }
    ];

    let currentQ = 0;
    const answers = [];

    renderQuestion();

    function renderQuestion() {
        const q = questions[currentQ];

        container.innerHTML = `
      <div class="test-container">
        <div class="question">
          <div class="question-text">${currentQ + 1}. ${q.question}</div>
          <div class="options" id="options"></div>
        </div>
        <div style="text-align: center; margin-top: var(--spacing-6); color: var(--neutral-500);">
          Question ${currentQ + 1} of 3
        </div>
      </div>
    `;

        const optionsContainer = document.getElementById('options');
        q.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.onclick = () => selectAnswer(option);
            optionsContainer.appendChild(btn);
        });
    }

    function selectAnswer(answer) {
        const q = questions[currentQ];
        const isCorrect = answer == q.correctAnswer;

        if (isCorrect) {
            assessmentData.orientation.score++;
        }

        answers.push({ question: q.question, answer, correct: isCorrect });
        currentQ++;

        if (currentQ < 3) {
            renderQuestion();
        } else {
            assessmentData.orientation.answers = answers;
            setTimeout(() => {
                showStep('step2');
                startRecallTest();
            }, 500);
        }
    }
}

function generateDateOptions(correctDate) {
    const options = [correctDate];
    while (options.length < 4) {
        const randomDate = Math.floor(Math.random() * 28) + 1;
        if (!options.includes(randomDate)) {
            options.push(randomDate);
        }
    }
    return NeuroAssist.shuffleArray(options);
}

// ============================================
// STEP 2: FIVE-WORD RECALL TEST
// ============================================

function startRecallTest() {
    const wordBank = ['Apple', 'Chair', 'Ocean', 'Book', 'Smile', 'Garden', 'Music', 'Cloud', 'River', 'Mountain'];
    const selectedWords = NeuroAssist.getRandomItems(wordBank, 5);
    assessmentData.recall.words = selectedWords;

    let phase = 'display';
    let timer = 10;
    let timerInterval;

    displayWords();

    function displayWords() {
        const container = document.getElementById('recallTest');

        container.innerHTML = `
      <div class="test-container">
        <p style="text-align: center; font-size: var(--font-size-lg); margin-bottom: var(--spacing-4);">
          Remember these words:
        </p>
        <div class="countdown">${timer}s</div>
        <div class="word-display" id="wordDisplay"></div>
      </div>
    `;

        const wordDisplay = document.getElementById('wordDisplay');
        selectedWords.forEach(word => {
            const card = document.createElement('div');
            card.className = 'word-card fade-in';
            card.textContent = word;
            wordDisplay.appendChild(card);
        });

        timerInterval = setInterval(() => {
            timer--;
            const countdownEl = document.querySelector('.countdown');
            if (countdownEl) countdownEl.textContent = `${timer}s`;

            if (timer <= 0) {
                clearInterval(timerInterval);
                showDistraction();
            }
        }, 1000);
    }

    function showDistraction() {
        let countdown = 10;
        const container = document.getElementById('recallTest');

        container.innerHTML = `
      <div class="test-container" style="text-align: center;">
        <p style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-4);">
          Count backwards from 10...
        </p>
        <div class="countdown">${countdown}</div>
      </div>
    `;

        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.querySelector('.countdown');
            if (countdownEl) countdownEl.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                showRecallInput();
            }
        }, 1000);
    }

    function showRecallInput() {
        const container = document.getElementById('recallTest');

        container.innerHTML = `
      <div class="test-container">
        <p style="text-align: center; font-size: var(--font-size-lg); margin-bottom: var(--spacing-4);">
          Type the words you remember:
        </p>
        <div class="recall-inputs" id="recallInputs"></div>
        <button class="btn btn-primary" id="submitRecall" style="margin-top: var(--spacing-6); width: 100%;">
          Next →
        </button>
      </div>
    `;

        const inputsContainer = document.getElementById('recallInputs');
        for (let i = 0; i < 5; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Word ${i + 1}`;
            input.className = 'fade-in';
            inputsContainer.appendChild(input);
        }

        document.getElementById('submitRecall').onclick = () => {
            const inputs = document.querySelectorAll('#recallInputs input');
            const userWords = Array.from(inputs).map(input => input.value.trim().toLowerCase());
            const correctWords = selectedWords.map(w => w.toLowerCase());

            let score = 0;
            userWords.forEach(word => {
                if (correctWords.includes(word)) score++;
            });

            assessmentData.recall.score = score;
            assessmentData.recall.userAnswers = userWords;

            showStep('step3');
            startTrailTest();
        };
    }
}

// ============================================
// STEP 3: MINI TRAIL-MAKING TEST
// ============================================

function startTrailTest() {
    const numbers = NeuroAssist.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let expectedNumber = 1;
    let errors = 0;
    let startTime = Date.now();

    renderGrid();

    function renderGrid() {
        const container = document.getElementById('trailTest');

        container.innerHTML = `
      <div class="test-container">
        <div class="timer-display">Next: ${expectedNumber}</div>
        <div class="trail-grid" id="trailGrid"></div>
        <div style="text-align: center; margin-top: var(--spacing-4); color: var(--neutral-600);">
          Errors: <span id="errorCount">0</span>
        </div>
      </div>
    `;

        const grid = document.getElementById('trailGrid');
        numbers.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'trail-cell';
            cell.textContent = num;
            cell.onclick = () => handleClick(num, cell);
            grid.appendChild(cell);
        });
    }

    function handleClick(number, cell) {
        if (number === expectedNumber) {
            cell.classList.add('clicked');
            cell.onclick = null;
            expectedNumber++;

            if (expectedNumber <= 10) {
                document.querySelector('.timer-display').textContent = `Next: ${expectedNumber}`;
            } else {
                finishTest();
            }
        } else {
            errors++;
            cell.classList.add('error');
            document.getElementById('errorCount').textContent = errors;

            setTimeout(() => cell.classList.remove('error'), 500);
        }
    }

    function finishTest() {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);

        // Scoring: 2 points max, deduct for errors and time
        let score = 2;
        if (errors > 3) score -= 1;
        if (timeTaken > 60) score -= 1;
        score = Math.max(0, score);

        assessmentData.trail.score = score;
        assessmentData.trail.time = timeTaken;
        assessmentData.trail.errors = errors;

        setTimeout(() => {
            showStep('step4');
            startTeaTask();
        }, 1000);
    }
}

// ============================================
// STEP 4: TEA-MAKING FUNCTIONAL TASK
// ============================================

function startTeaTask() {
    const correctSequence = ['boil', 'teabag', 'pour', 'sugar', 'stir', 'done'];
    const steps = [
        { id: 'boil', icon: '🔥', text: 'Boil Water' },
        { id: 'teabag', icon: '🫖', text: 'Add Tea Bag' },
        { id: 'pour', icon: '💧', text: 'Pour Water' },
        { id: 'sugar', icon: '🍯', text: 'Add Sugar' },
        { id: 'stir', icon: '🥄', text: 'Stir' },
        { id: 'done', icon: '✅', text: 'Done!' }
    ];

    let currentStep = 0;
    let errors = 0;
    let sequenceCorrect = true;
    let completedSteps = [];

    renderSteps();

    function renderSteps() {
        const container = document.getElementById('functionalTest');

        container.innerHTML = `
      <div class="test-container">
        <p style="text-align: center; font-size: var(--font-size-lg); margin-bottom: var(--spacing-6);">
          Click the steps in the correct order
        </p>
        <div class="tea-steps" id="teaSteps"></div>
      </div>
    `;

        const stepsContainer = document.getElementById('teaSteps');
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'tea-step';
            stepDiv.innerHTML = `
        <div class="tea-step-number">${index + 1}</div>
        <div class="tea-step-icon">${step.icon}</div>
        <div class="tea-step-text">${step.text}</div>
      `;
            stepDiv.onclick = () => clickStep(step.id, stepDiv);
            stepsContainer.appendChild(stepDiv);
        });
    }

    function clickStep(stepId, stepDiv) {
        if (completedSteps.includes(stepId)) return;

        const expectedStepId = correctSequence[currentStep];

        if (stepId === expectedStepId) {
            stepDiv.classList.add('completed');
            completedSteps.push(stepId);
            currentStep++;

            if (currentStep === correctSequence.length) {
                calculateFunctionalScore();
            }
        } else {
            sequenceCorrect = false;
            errors++;
            stepDiv.classList.add('error');

            setTimeout(() => stepDiv.classList.remove('error'), 500);
        }
    }

    function calculateFunctionalScore() {
        // Score 0-5 based on errors and sequence
        let score = 5;

        if (!sequenceCorrect) {
            if (errors <= 2) score = 2;
            else score = 1;
        } else {
            if (errors === 0) score = 5;
            else if (errors <= 2) score = 4;
            else score = 3;
        }

        assessmentData.teaTask.score = score;
        assessmentData.teaTask.errors = errors;
        assessmentData.teaTask.sequence = completedSteps;

        setTimeout(() => {
            calculateAndShowResults();
        }, 1000);
    }
}

// ============================================
// CALCULATE RESULTS
// ============================================

function calculateAndShowResults() {
    // Cognitive Score (0-10)
    const cognitiveScore =
        assessmentData.orientation.score + // 0-3
        assessmentData.recall.score + // 0-5
        assessmentData.trail.score; // 0-2

    // Functional Score (0-5)
    const functionalScore = assessmentData.teaTask.score;

    // Total Score (0-15)
    const totalScore = cognitiveScore + functionalScore;

    // Risk Level Classification
    let riskLevel;
    if (totalScore >= 10) {
        riskLevel = 'normal';
    } else if (totalScore >= 6) {
        riskLevel = 'mild';
    } else {
        riskLevel = 'high';
    }

    // Show results
    showStep('results');
    displayResults(cognitiveScore, functionalScore, totalScore, riskLevel);

    // Store assessment data for submission
    window.baselineResults = {
        cognitiveScore,
        functionalScore,
        totalScore,
        riskLevel,
        components: {
            orientation: assessmentData.orientation.score,
            recall: assessmentData.recall.score,
            trail: assessmentData.trail.score,
            teaTask: assessmentData.teaTask.score
        }
    };
}

function displayResults(cognitive, functional, total, risk) {
    document.getElementById('totalScore').textContent = total;
    document.getElementById('cognitiveScore').textContent = `${cognitive} / 10`;
    document.getElementById('functionalScore').textContent = `${functional} / 5`;

    const riskBadge = document.getElementById('riskLevel');
    riskBadge.className = `risk-badge ${risk}`;

    if (risk === 'normal') {
        riskBadge.textContent = '✓ Normal';
    } else if (risk === 'mild') {
        riskBadge.textContent = '⚠ Mild Concern';
    } else {
        riskBadge.textContent = '⚠ Needs Attention';
    }

    // Interpretation
    const interpretation = document.getElementById('interpretation');
    let message = '';

    if (risk === 'normal') {
        message = `
      <h3 style="color: var(--success-green);">No Cognitive Impairment Detected</h3>
      <p>Your baseline assessment indicates normal cognitive function. We recommend:</p>
      <ul>
        <li>Weekly cognitive monitoring to track any changes</li>
        <li>Maintain healthy lifestyle with regular exercise</li>
        <li>Engage in mentally stimulating activities</li>
      </ul>
    `;
    } else if (risk === 'mild') {
        message = `
      <h3 style="color: var(--warning-amber);">Mild Cognitive Indicators</h3>
      <p>Your assessment shows some areas that may benefit from closer monitoring. We recommend:</p>
      <ul>
        <li>Complete cognitive tests twice weekly</li>
        <li>Consider consultation with a healthcare provider</li>
        <li>Engage in daily cognitive exercises</li>
        <li>Maintain social engagement and activities</li>
      </ul>
    `;
    } else {
        message = `
      <h3 style="color: var(--danger-red);">Medical Consultation Recommended</h3>
      <p>Your assessment indicates areas requiring professional evaluation. We strongly recommend:</p>
      <ul>
        <li>Schedule a consultation with your healthcare provider</li>
        <li>Complete daily cognitive monitoring</li>
        <li>Have a caregiver monitor closely</li>
        <li>Consider comprehensive neurological evaluation</li>
      </ul>
    `;
    }

    interpretation.innerHTML = message;
}

// ============================================
// COMPLETE ONBOARDING
// ============================================

async function completeOnboarding() {
    try {
        // Get or create user
        let user = NeuroAssist.getCurrentUser();

        if (!user) {
            // Create new user
            user = await NeuroAssist.api.post('/users', {
                name: prompt('Please enter your name:') || 'Patient',
                role: 'patient'
            });
            NeuroAssist.setCurrentUser(user);
        }

        // Submit baseline assessment
        const results = window.baselineResults;
        await NeuroAssist.api.post('/baseline-assessment', {
            userId: user.id,
            cognitiveScore: results.cognitiveScore,
            functionalScore: results.functionalScore,
            totalScore: results.totalScore,
            riskLevel: results.riskLevel,
            components: results.components
        });

        NeuroAssist.showToast('Baseline assessment completed!', 'success');

        // Redirect to patient interface
        setTimeout(() => {
            window.location.href = '/patient.html';
        }, 1500);

    } catch (error) {
        console.error('Error completing onboarding:', error);
        NeuroAssist.showToast('Error saving assessment. Please try again.', 'error');
    }
}

// Make functions globally accessible
window.startAssessment = startAssessment;
window.completeOnboarding = completeOnboarding;
