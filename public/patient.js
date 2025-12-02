/**
 * Patient Interface JavaScript
 * Handles routine logging, cognitive tests, games, and functional tasks
 */

const { api, showToast, getCurrentUser, shuffleArray, getRandomItems } = NeuroAssist;

let currentUser = null;
let currentTest = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentUser = getCurrentUser();

    if (!currentUser) {
        // Create demo user
        currentUser = { id: 'demo-patient', name: 'John Doe' };
        NeuroAssist.setCurrentUser(currentUser);
    }

    document.getElementById('patientName').textContent = currentUser.name;

    setupRoutineButtons();
    setupMoodButtons();
    setupTestCards();
    setupGames();
});

// ============================================
// ROUTINE TRACKER
// ============================================

function setupRoutineButtons() {
    const routineButtons = document.querySelectorAll('.routine-btn');

    routineButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const activity = btn.dataset.activity;

            try {
                await api.post('/routine-log', {
                    userId: currentUser.id,
                    activity: activity,
                    value: 1
                });

                btn.classList.add('completed');
                showToast(`✓ ${activity.charAt(0).toUpperCase() + activity.slice(1)} logged!`, 'success');

                // Remove completed state after 2 seconds for repeated logging
                setTimeout(() => btn.classList.remove('completed'), 2000);
            } catch (error) {
                console.error('Error logging routine:', error);
            }
        });
    });
}

function setupMoodButtons() {
    const moodButtons = document.querySelectorAll('.mood-btn');

    moodButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const mood = btn.dataset.mood;

            // Visual feedback
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            try {
                await api.post('/routine-log', {
                    userId: currentUser.id,
                    activity: 'mood',
                    mood: mood
                });

                showToast(`Mood recorded: ${mood}`, 'success');
            } catch (error) {
                console.error('Error logging mood:', error);
            }
        });
    });
}

// ============================================
// COGNITIVE TESTS
// ============================================

function setupTestCards() {
    const testCards = document.querySelectorAll('.test-card[data-test]');

    testCards.forEach(card => {
        const button = card.querySelector('.btn');
        const testType = card.dataset.test;

        button.addEventListener('click', () => {
            if (testType === 'orientation') {
                startOrientationTest();
            } else if (testType === 'recall') {
                startRecallTest();
            } else if (testType === 'trail') {
                startTrailTest();
            }
        });
    });
}

// ============================================
// ORIENTATION TEST
// ============================================

function startOrientationTest() {
    const today = new Date();
    const correctDate = today.getDate();
    const correctDay = today.toLocaleDateString('en-US', { weekday: 'long' });

    const questions = [
        {
            question: "What is today's date?",
            correctAnswer: correctDate,
            options: generateDateOptions(correctDate)
        },
        {
            question: "What day of the week is it?",
            correctAnswer: correctDay,
            options: shuffleArray(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        },
        {
            question: "Where are you right now?",
            correctAnswer: 'Home',
            options: ['Home', 'Hospital', 'Office', 'Park']
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    const answers = [];

    showModal();
    renderQuestion();

    function renderQuestion() {
        const q = questions[currentQuestion];
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Orientation Check</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(currentQuestion / questions.length) * 100}%"></div>
      </div>
      <div class="question-container">
        <p class="question-text">${q.question}</p>
        <div class="options-grid" id="optionsGrid"></div>
      </div>
    `;

        const optionsGrid = document.getElementById('optionsGrid');
        q.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.onclick = () => selectAnswer(option);
            optionsGrid.appendChild(btn);
        });
    }

    function selectAnswer(answer) {
        const q = questions[currentQuestion];
        const isCorrect = answer == q.correctAnswer;

        if (isCorrect) score++;
        answers.push({ question: q.question, answer, correct: isCorrect });

        currentQuestion++;

        if (currentQuestion < questions.length) {
            renderQuestion();
        } else {
            showResults();
        }
    }

    async function showResults() {
        const content = document.getElementById('testContent');
        const percentage = (score / questions.length) * 100;

        content.innerHTML = `
      <div class="results-container">
        <h2 class="modal-title">Test Complete! 🎉</h2>
        <div class="results-score">${score} / ${questions.length}</div>
        <p class="results-message">${getEncouragementMessage(percentage)}</p>
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    `;

        // Submit results
        try {
            await api.post('/cognitive-test', {
                userId: currentUser.id,
                testType: 'orientation',
                score: score,
                maxScore: questions.length,
                details: answers
            });
        } catch (error) {
            console.error('Error submitting test:', error);
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
    return shuffleArray(options);
}

// ============================================
// FIVE-WORD RECALL TEST
// ============================================

function startRecallTest() {
    const wordBank = ['Apple', 'Chair', 'Ocean', 'Book', 'Smile', 'Garden', 'Music', 'Cloud', 'River', 'Mountain', 'Coffee', 'Window', 'Star', 'Flower', 'Bridge'];
    const selectedWords = getRandomItems(wordBank, 5);

    let phase = 'display'; // display, distraction, recall
    let timer = 10;
    let timerInterval;

    showModal();
    displayWords();

    function displayWords() {
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Memory Recall Test</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-center text-lg">Remember these words:</p>
      <div class="timer">${timer}s</div>
      <div class="word-display" id="wordDisplay"></div>
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
            document.querySelector('.timer').textContent = `${timer}s`;

            if (timer <= 0) {
                clearInterval(timerInterval);
                showDistraction();
            }
        }, 1000);
    }

    function showDistraction() {
        const content = document.getElementById('testContent');
        let countdown = 10;

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Memory Recall Test</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div class="results-container">
        <p class="text-2xl font-semibold">Count backwards from 10...</p>
        <div class="results-score">${countdown}</div>
      </div>
    `;

        const countdownInterval = setInterval(() => {
            countdown--;
            const scoreEl = document.querySelector('.results-score');
            if (scoreEl) scoreEl.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                showRecallInput();
            }
        }, 1000);
    }

    function showRecallInput() {
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Memory Recall Test</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-center text-lg">Type the words you remember:</p>
      <div class="recall-inputs" id="recallInputs"></div>
      <button class="btn btn-primary" id="submitRecall" style="margin-top: var(--spacing-6); width: 100%;">Submit</button>
    `;

        const inputsContainer = document.getElementById('recallInputs');
        for (let i = 0; i < 5; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Word ${i + 1}`;
            input.className = 'fade-in';
            inputsContainer.appendChild(input);
        }

        document.getElementById('submitRecall').onclick = checkRecall;
    }

    async function checkRecall() {
        const inputs = document.querySelectorAll('#recallInputs input');
        const userWords = Array.from(inputs).map(input => input.value.trim().toLowerCase());
        const correctWords = selectedWords.map(w => w.toLowerCase());

        let score = 0;
        userWords.forEach(word => {
            if (correctWords.includes(word)) score++;
        });

        const content = document.getElementById('testContent');
        const percentage = (score / 5) * 100;

        content.innerHTML = `
      <div class="results-container">
        <h2 class="modal-title">Test Complete! 🎉</h2>
        <div class="results-score">${score} / 5</div>
        <p class="results-message">${getEncouragementMessage(percentage)}</p>
        <div class="results-details">
          <p class="font-medium">Correct words: ${selectedWords.join(', ')}</p>
        </div>
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    `;

        // Submit results
        try {
            await api.post('/cognitive-test', {
                userId: currentUser.id,
                testType: 'recall',
                score: score,
                maxScore: 5,
                details: { correctWords: selectedWords, userWords }
            });
        } catch (error) {
            console.error('Error submitting test:', error);
        }
    }
}

// ============================================
// TRAIL-MAKING TEST
// ============================================

function startTrailTest() {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let expectedNumber = 1;
    let errors = 0;
    let startTime = Date.now();

    showModal();
    renderGrid();

    function renderGrid() {
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Number Trail Test</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-center text-lg">Click the numbers in order (1 → 10)</p>
      <div class="timer">Next: ${expectedNumber}</div>
      <div class="trail-grid" id="trailGrid"></div>
      <p class="text-center text-neutral-600">Errors: <span id="errorCount">0</span></p>
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
                document.querySelector('.timer').textContent = `Next: ${expectedNumber}`;
            } else {
                showResults();
            }
        } else {
            errors++;
            cell.classList.add('error');
            document.getElementById('errorCount').textContent = errors;

            setTimeout(() => cell.classList.remove('error'), 500);
        }
    }

    async function showResults() {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const timePenalty = Math.floor(timeTaken / 10);
        let score = 10 - (errors * 2) - timePenalty;
        score = Math.max(0, Math.min(10, score));

        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="results-container">
        <h2 class="modal-title">Test Complete! 🎉</h2>
        <div class="results-score">${score} / 10</div>
        <div class="results-details">
          <p>Time: ${timeTaken} seconds</p>
          <p>Errors: ${errors}</p>
        </div>
        <p class="results-message">${getEncouragementMessage(score * 10)}</p>
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    `;

        // Submit results
        try {
            await api.post('/cognitive-test', {
                userId: currentUser.id,
                testType: 'trail-making',
                score: score,
                maxScore: 10,
                timeTaken: timeTaken,
                details: { errors, timeTaken }
            });
        } catch (error) {
            console.error('Error submitting test:', error);
        }
    }
}

// ============================================
// MATCHING PAIRS GAME
// ============================================

function setupGames() {
    document.getElementById('startMatchingGame').addEventListener('click', startMatchingGame);
    document.getElementById('startTeaTask').addEventListener('click', startTeaTask);
}

function startMatchingGame() {
    const icons = ['🍎', '🚗', '⭐', '🌸', '🎵', '🏠'];
    const cards = shuffleArray([...icons, ...icons]);

    let flippedCards = [];
    let matchedPairs = 0;
    let errors = 0;
    let startTime = Date.now();

    showModal();
    renderCards();

    function renderCards() {
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Matching Pairs Game</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-center text-lg">Find all matching pairs!</p>
      <div class="card-grid" id="cardGrid"></div>
      <p class="text-center text-neutral-600">Pairs found: <span id="pairCount">0 / 6</span></p>
    `;

        const grid = document.getElementById('cardGrid');
        cards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.icon = icon;
            card.dataset.index = index;
            card.textContent = '?';
            card.onclick = () => flipCard(card);
            grid.appendChild(card);
        });
    }

    function flipCard(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        card.textContent = card.dataset.icon;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 800);
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.icon === card2.dataset.icon) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            document.getElementById('pairCount').textContent = `${matchedPairs} / 6`;

            if (matchedPairs === 6) {
                setTimeout(showResults, 500);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '?';
            card2.textContent = '?';
            errors++;
        }

        flippedCards = [];
    }

    async function showResults() {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);

        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="results-container">
        <h2 class="modal-title">Great Job! 🎉</h2>
        <div class="results-score">All Matched!</div>
        <div class="results-details">
          <p>Time: ${timeTaken} seconds</p>
          <p>Mistakes: ${errors}</p>
        </div>
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    `;

        showToast('All pairs matched! 🎉', 'success');
    }
}

// ============================================
// TEA-MAKING FUNCTIONAL TASK
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
    let sequenceCorrect = true;
    let errors = 0;
    let startTime = Date.now();
    let completedSteps = [];

    showModal();
    renderSteps();

    function renderSteps() {
        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Make a Cup of Tea ☕</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-center text-lg">Click the steps in the correct order</p>
      <div class="tea-steps" id="teaSteps"></div>
    `;

        const container = document.getElementById('teaSteps');
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'tea-step';
            stepDiv.innerHTML = `
        <div class="tea-step-number">${index + 1}</div>
        <div class="tea-step-icon">${step.icon}</div>
        <div class="tea-step-text">${step.text}</div>
      `;
            stepDiv.onclick = () => clickStep(step.id, stepDiv);
            container.appendChild(stepDiv);
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
                setTimeout(showResults, 500);
            }
        } else {
            sequenceCorrect = false;
            errors++;
            stepDiv.classList.add('error');

            setTimeout(() => stepDiv.classList.remove('error'), 500);
            showToast('Wrong step! Try again.', 'error');
        }
    }

    async function showResults() {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);

        const content = document.getElementById('testContent');

        content.innerHTML = `
      <div class="results-container">
        <h2 class="modal-title">Task Complete! ☕</h2>
        <div class="results-score">${sequenceCorrect ? 'Perfect!' : 'Completed'}</div>
        <div class="results-details">
          <p>Sequence: ${sequenceCorrect ? '✓ Correct' : '✗ Had errors'}</p>
          <p>Time: ${timeTaken} seconds</p>
          <p>Errors: ${errors}</p>
        </div>
        <button class="btn btn-primary" onclick="closeModal()">Done</button>
      </div>
    `;

        // Submit results
        try {
            await api.post('/functional-task', {
                userId: currentUser.id,
                taskType: 'make-tea',
                completed: true,
                errors: errors,
                sequenceCorrect: sequenceCorrect,
                timeTaken: timeTaken,
                steps: completedSteps
            });
        } catch (error) {
            console.error('Error submitting task:', error);
        }
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showModal() {
    document.getElementById('testModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('testModal').style.display = 'none';
}

window.closeModal = closeModal;

function getEncouragementMessage(percentage) {
    if (percentage >= 80) {
        return '🌟 Excellent work! You did great!';
    } else if (percentage >= 60) {
        return '👍 Good job! Keep it up!';
    } else if (percentage >= 40) {
        return '💪 Nice try! Practice makes perfect!';
    } else {
        return '🤗 That\'s okay! Try again when you\'re ready.';
    }
}
