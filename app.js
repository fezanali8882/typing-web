/**
 * TypeFast - Professional Typing Speed Test
 * Advanced logic for real-time analytics, heatmap, and premium UX.
 */

const SYMBOLS = "~!@#$%^&*()_+{}|:\"<>?`-=[]\\;',./";
const KEYBOARD_LAYOUT = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
    ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
    ["Space"]
];

// Word pools for random text generation
const wordPools = {
    easy: [
        "the","a","and","is","it","in","of","to","be","was","he","she","they","we","you","are","do","go",
        "can","my","on","at","by","up","or","an","so","if","no","me","us","him","her","his","but","not",
        "with","that","this","from","have","had","will","just","like","time","get","one","out","day","now",
        "how","your","our","its","new","who","did","see","way","may","say","big","old","run","man","her",
        "his","has","him","let","ask","cat","dog","sun","sky","bird","tree","river","water","house","road",
        "book","hand","face","door","fire","wind","rain","snow","moon","star","fish","food","home","farm",
        "red","blue","green","black","white","long","good","nice","soft","warm","cool","fast","slow","kind",
        "play","walk","talk","work","read","help","grow","make","take","find","give","know","look","move",
        "love","life","hope","care","hear","feel","rest","wait","come","stop","stay","fall","hold","open",
        "sit","eat","top","cup","pen","bag","hat","bed","box","car","map","air","sky","art","joy","end"
    ],
    intermediate: [
        "success","failure","courage","challenge","improve","practice","achieve","balance","develop","explore",
        "wonder","create","believe","inspire","effort","journey","purpose","growth","wisdom","passion",
        "discover","pattern","master","connect","design","process","system","progress","measure","reflect",
        "strategy","clarity","problem","solution","method","concept","insight","context","meaning","result",
        "however","because","therefore","although","despite","through","between","beyond","during","within",
        "quality","subject","forward","network","chapter","project","control","support","achieve","release",
        "morning","evening","perfect","natural","current","dynamic","complex","creative","logical","simple",
        "provide","require","include","describe","compare","analyze","explain","suggest","produce","observe",
        "critical","general","specific","positive","negative","primary","central","personal","national","global",
        "The","In","When","After","Before","While","Once","Since","Until","As","If","Although","However","Yet",
        "people","world","think","place","point","group","study","level","story","power","voice","focus","value",
        "digital","modern","future","impact","change","action","energy","effort","chance","force","model","scale",
        "building","learning","running","writing","reading","speaking","thinking","working","growing","moving"
    ],
    hard: [
        "juxtaposition","paradigm","infrastructure","metamorphosis","phenomenological","epistemological",
        "synchronization","electromagnetic","computational","psychological","philosophical","methodology",
        "notwithstanding","aforementioned","interdisciplinary","extrapolation","quantification","manifestation",
        "disambiguation","conceptualization","implementation","decentralization","hyperparameters","polymorphism",
        "asynchronous","encapsulation","abstraction","recursion","algorithm","optimization","cryptography",
        "authentication","authorization","serialization","deserialization","parallelization","virtualization",
        "microservices","containerization","orchestration","infrastructure","deployment","configuration",
        "biochemistry","photosynthesis","mitochondria","chromosome","pharmaceutical","neuroscience","ecosystem",
        "simultaneously","consequently","fundamentally","substantially","systematically","theoretically",
        "extraordinarily","predominantly","comprehensively","disproportionately","instantaneously","perpetually",
        "#42","@2026","3.14159","100%","$1,024","(2^10)","[CRITICAL]","{delta}","<EOF>","0x1F4A9",
        "Version 3.0","API-v2","RFC-7519","ISO-8601","UTF-8","HTTP/2","TCP/IP","SQL-99","IEEE-754"
    ]
};

// Generate random text from word pool (~wordCount words, no repeat adjacents)
function generateText(difficulty, wordCount = 80) {
    const pool = wordPools[difficulty] || wordPools.easy;
    const words = [];
    let lastWord = '';
    for (let i = 0; i < wordCount; i++) {
        let word;
        let attempts = 0;
        do {
            word = pool[Math.floor(Math.random() * pool.length)];
            attempts++;
        } while (word === lastWord && attempts < 5);
        words.push(word);
        lastWord = word;
    }
    return words.join(' ');
}

// Legacy difficultyData kept as fallback (not used for random mode)
const difficultyData = {
    easy: [], intermediate: [], hard: []
};

// Application State
let state = {
    timeLeft: 0,
    timeLimit: 30,
    mode: 'time',
    wordLimit: 25,
    wordsCompleted: 0,
    elapsedSeconds: 0,   
    charIndex: 0,
    mistakes: 0,
    totalChars: 0,
    currentDifficulty: 'easy',
    lastParagraphIndex: -1,
    customText: null,
    wpmHistory: [],
    rawWpmHistory: [], // new
    heatmap: {},
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    replayBuffer: [],
    lastKeystrokeTime: 0,
    mistakeLog: {},
    isRunning: false,
    practiceMode: null
};

// DOM Elements
const elements = {
    paragraphDisplay: document.getElementById('paragraph-display'),
    typingInput: document.getElementById('typing-input'),
    timerDisplay: document.getElementById('timer-display'),
    liveWpm: document.getElementById('live-wpm'),
    liveAccuracy: document.getElementById('live-accuracy'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    resultsSection: document.getElementById('results-section'),
    keyboardContainer: document.getElementById('keyboard-container'),
    soundToggle: document.getElementById('sound-toggle'),
    customTextBtn: document.getElementById('custom-text-btn'),
    customTextModal: document.getElementById('custom-text-modal'),
    customTextInput: document.getElementById('custom-text-input'),
    saveCustomText: document.getElementById('save-custom-text'),
    closeModal: document.getElementById('close-modal'),
    finalWpm: document.getElementById('final-wpm'),
    finalAccuracy: document.getElementById('final-accuracy'),
    finalCpm: document.getElementById('final-cpm'),
    finalMistakes: document.getElementById('final-mistakes'),
    coachTriggerBtn: document.getElementById('coach-trigger-btn'), // Added for stability
    customValueModal: document.getElementById('custom-value-modal'),
    customValueInput: document.getElementById('custom-value-input'),
    customValueLabel: document.getElementById('custom-value-label'),
    saveCustomValue: document.getElementById('save-custom-value'),
    closeCustomValue: document.getElementById('close-custom-value'),
    watchReplayBtn: document.getElementById('watch-replay-btn'),
    replayModal: document.getElementById('replay-modal'),
    replayDisplay: document.getElementById('replay-display'),
    closeReplay: document.getElementById('close-replay')
};

let timerInterval;
let chart;

let sounds = {}; // Initialize empty

function initializeSounds() {
    if (Object.keys(sounds).length > 0) return;

    // Using widely supported SoundJay URLs for extreme local compatibility
    sounds = {
        keypress: new Audio('https://www.soundjay.com/communication/typewriter-key-1.mp3'),
        error: new Audio('https://www.soundjay.com/buttons/button-10.mp3'),
        complete: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3')
    };

    sounds.keypress.volume = 0.5;
    sounds.error.volume = 0.5;
    sounds.complete.volume = 0.6;
}

function playSound(type) {
    if (!state.soundEnabled) return;
    initializeSounds(); // Ensure initialized
    const sound = sounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Audio play failed, need interaction", e));
    }
}

// Initialize Keyboard Heatmap
function initKeyboard() {
    console.log("Syncing Keyboard Heatmap with Static UI...");
    const container = document.getElementById('keyboard-container');
    if (!container) {
        console.warn("Keyboard container not found!");
        return;
    }
    
    // Internal Heatmap state sync
    KEYBOARD_LAYOUT.forEach(row => {
        row.forEach((key) => {
            const k = key.toLowerCase();
            if (!state.heatmap[k] && (k.length === 1 || key === 'Space')) {
                state.heatmap[k] = { count: 0, mistakes: 0 };
            }
        });
    });
}

// ----------------------------------------------------
// --- CONSOLIDATED HUB LOGIC (TOP SCOPE) --- 🚀
// ----------------------------------------------------

function hideAllHubs() {
    const sectionIds = ['results-section', 'main-typing-container', 'leaderboard-section'];
    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

/** 🏆 Render and display global rankings */
window.showLeaderboard = async function() {
    console.log("Syncing Elite Rankings via Firestore...");
    const body = document.getElementById('leaderboard-body');
    if (!body) {
        console.error("Leaderboard body not found!");
        return;
    }

    // Prepare visual state 🔄
    hideAllHubs();
    body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 3rem; font-weight: 600; opacity:0.5;">Gathering Global Ranks...</td></tr>';
    
    const lbSection = document.getElementById('leaderboard-section');
    if (lbSection) {
        lbSection.style.display = 'block';
        lbSection.style.animation = 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    }

    try {
        if (!db) throw new Error("Firestore Database (db) not initialized.");
        
        const snapshot = await db.collection('users')
            .orderBy('bestWpm', 'desc')
            .limit(10)
            .get();

        body.innerHTML = '';
        if (snapshot.empty) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No entries found yet. Be the first!</td></tr>';
            return;
        }

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
            
            let medal = rank;
            if (rank === 1) medal = '🥇';
            else if (rank === 2) medal = '🥈';
            else if (rank === 3) medal = '🥉';

            row.innerHTML = `
                <td style="padding: 1.2rem; font-weight: 800; color: ${rank <= 3 ? '#facc15' : 'white'};">${medal}</td>
                <td style="padding: 1.2rem; font-weight: 600;">${data.username || 'Anonymous'}</td>
                <td style="padding: 1.2rem; font-weight: 900; color: var(--primary);">${data.bestWpm || 0} <span style="font-size: 0.7rem; opacity: 0.5;">WPM</span></td>
                <td style="padding: 1.2rem; opacity: 0.7;">${data.avgAccuracy || 0}%</td>
            `;
            body.appendChild(row);
            rank++;
        });
    } catch (err) {
        console.error("Leaderboard Load Failed:", err);
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ef4444; padding: 3rem;">Error syncing rankings. Please refresh.</td></tr>`;
    }
};

// ----------------------------------------------------

function updateHeatmapUI(key, isMistake = false) {
    let k = key.toLowerCase();
    if (key === ' ') k = 'space'; 
    
    if (!state.heatmap[k]) {
        state.heatmap[k] = { count: 0, mistakes: 0 };
    }
    
    state.heatmap[k].count++;
    if (isMistake) state.heatmap[k].mistakes++;

    const keyDiv = document.getElementById(`keyboard-key-${k}`);
    if (keyDiv) {
        if (isMistake) {
            keyDiv.classList.add('mistyped');
            setTimeout(() => keyDiv.classList.remove('mistyped'), 300);
        } else {
            keyDiv.classList.add('pressed');
            setTimeout(() => keyDiv.classList.remove('pressed'), 150);
        }

        const total = state.heatmap[k].count;
        let heatClass = '';
        if (total > 40) heatClass = 'heat-5';
        else if (total > 25) heatClass = 'heat-4';
        else if (total > 12) heatClass = 'heat-3';
        else if (total > 5) heatClass = 'heat-2';
        else heatClass = 'heat-1';

        keyDiv.classList.remove('heat-1', 'heat-2', 'heat-3', 'heat-4', 'heat-5');
        keyDiv.classList.add(heatClass);
    }
}

// Paragraph Loading
function loadParagraph() {
    let text;
    if (state.customText) {
        text = state.customText;
    } else {
        // Generate fresh random text from word pool every time
        const baseText = generateText(state.currentDifficulty, 100);
        text = baseText;
        // Ensure enough length for extended sessions
        while (text.length < 3000) text += ' ' + generateText(state.currentDifficulty, 80);
    }

    elements.paragraphDisplay.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        elements.paragraphDisplay.appendChild(span);
    });

    const firstSpan = elements.paragraphDisplay.querySelector('span');
    if (firstSpan) firstSpan.classList.add('active');

    state.charIndex = 0;
    state.mistakes = 0;
    state.totalChars = 0;
    elements.paragraphDisplay.scrollTop = 0;

    // Initial highlight
    const initChars = elements.paragraphDisplay.querySelectorAll('span');
    const initText = elements.paragraphDisplay.textContent;
    let initialEnd = 0;
    while(initialEnd < initText.length && initText[initialEnd] !== ' ') initialEnd++;
    for(let i = 0; i < initialEnd; i++) initChars[i]?.classList.add('current-word');
}

// Real-time Logic
function initTyping(e) {
    if (!state.isRunning) return;

    const characters = elements.paragraphDisplay.querySelectorAll('span');
    const typedChar = e.data || elements.typingInput.value.slice(-1);

    if (state.charIndex < characters.length && (state.mode === 'words' || state.timeLeft > 0)) {
        const originalChar = characters[state.charIndex].textContent;
        if (e.inputType === 'deleteContentBackward') {
            if (state.charIndex > 0) {
                // Check if we are trying to backspace into a previous word
                const prevChar = characters[state.charIndex - 1].textContent;
                if (prevChar === ' ') {
                    return; // Lock reached: cannot go back to previous word
                }
                
                state.charIndex--;
                if (characters[state.charIndex].classList.contains('wrong')) {
                    state.mistakes--;
                }
                characters[state.charIndex].classList.remove('correct', 'wrong', 'active');
            }
        } else {
            const isMatch = typedChar === originalChar;

            // Recording for Replay 🎥
            const now = Date.now();
            state.replayBuffer.push({
                char: originalChar,
                isCorrect: isMatch,
                delay: now - state.lastKeystrokeTime,
                index: state.charIndex
            });
            state.lastKeystrokeTime = now;

            if (isMatch) {
                characters[state.charIndex].classList.add('correct');
                playSound('keypress');
            } else {
                if (state.practiceMode === 'accuracy') {
                    finishTest();
                    return;
                }
                state.mistakes++;
                // Log mistake key ⌨️
                state.mistakeLog[originalChar] = (state.mistakeLog[originalChar] || 0) + 1;
                characters[state.charIndex].classList.add('wrong');
                playSound('error');
            }

            // Heatmap tracking (only for letters)
            if (/[a-zA-Z]/.test(originalChar)) {
                updateHeatmapUI(originalChar, !isMatch);
            }

            state.charIndex++;
            state.totalChars++;

            // On space: clear input, count word, check limit in words mode
            if (typedChar === ' ') {
                elements.typingInput.value = '';
                state.wordsCompleted++;

                if (state.mode === 'words') {
                    elements.timerDisplay.textContent = `${state.wordsCompleted}/${state.wordLimit}`;
                    
                    // Update Progress Bar (Words Mode) 📝
                    const progress = (state.wordsCompleted / state.wordLimit) * 100;
                    const fill = document.getElementById('session-progress-fill');
                    if (fill) fill.style.width = Math.min(100, progress) + '%';

                    if (state.wordsCompleted >= state.wordLimit) {
                        finishTest();
                        return;
                    }
                }
            }
        }

        // Update active class and Current Word Highlight 🎯
        const displayContent = elements.paragraphDisplay.textContent;
        let wordStart = state.charIndex;
        while (wordStart > 0 && displayContent[wordStart - 1] !== ' ') wordStart--;
        let wordEnd = state.charIndex;
        while (wordEnd < displayContent.length && displayContent[wordEnd] !== ' ') wordEnd++;

        characters.forEach((s, idx) => {
            s.classList.remove('active', 'current-word');
            if (idx === state.charIndex) s.classList.add('active');
            if (idx >= wordStart && idx < wordEnd) s.classList.add('current-word');
        });

        updateLiveStats();
        handleAutoScroll();

        if (state.charIndex === characters.length) {
            finishTest();
        }
    }
}

function handleAutoScroll() {
    // 2-line display: line-height 3rem=48px, padding-top 0.75rem=12px
    const chars = elements.paragraphDisplay.querySelectorAll('span');
    if (state.charIndex < chars.length) {
        const curr = chars[state.charIndex];
        const lineHeight = 48; // 3rem line-height
        const padding = 12;   // 0.75rem padding top

        const topPos = curr.offsetTop;

        // When cursor is on line 3+ (topPos > line1 bottom), scroll to keep line 2 visible
        if (topPos > padding + lineHeight) {
            elements.paragraphDisplay.scrollTop = topPos - lineHeight - padding;
        } else if (topPos <= padding) {
            elements.paragraphDisplay.scrollTop = 0;
        }
    }
}

function updateLiveStats() {
    let elapsed;
    if (state.mode === 'words') {
        elapsed = state.elapsedSeconds;
    } else {
        elapsed = state.timeLimit - state.timeLeft;
    }
    if (elapsed <= 0) elapsed = 1;

    let wpm = Math.round(((state.charIndex - state.mistakes) / 5) / (elapsed / 60));
    let accuracy = state.charIndex > 0 ? Math.round(((state.charIndex - state.mistakes) / state.charIndex) * 100) : 100;

    elements.liveWpm.textContent = Math.max(0, wpm);
    elements.liveAccuracy.textContent = accuracy + "%";

    // Dopamine Boost Effects Trigger 🎨
    const container = elements.paragraphDisplay;
    if (container) {
        container.classList.remove('flow-state-1', 'flow-state-2', 'perfect-acc');
        
        // Only trigger perfect accuracy if they've typed at least a few chars
        if (accuracy === 100 && state.charIndex > 5) {
            container.classList.add('perfect-acc');
        }

        if (wpm >= 100) {
            container.classList.add('flow-state-2');
        } else if (wpm >= 60) {
            container.classList.add('flow-state-1');
        }
    }
}

// Timer Logic
function startTimer() {
    if (state.mode === 'words') {
        state.elapsedSeconds++;
        elements.timerDisplay.textContent = `${state.wordsCompleted}/${state.wordLimit}`;

        let netWpm = Math.round(((state.charIndex - state.mistakes) / 5) / (state.elapsedSeconds / 60)) || 0;
        let rawWpm = Math.round((state.charIndex / 5) / (state.elapsedSeconds / 60)) || 0;
        state.wpmHistory.push(Math.max(0, netWpm));
        state.rawWpmHistory.push(Math.max(0, rawWpm));

        // Update Progress Bar (Time Mode)
        const progress = (elapsed / state.timeLimit) * 100;
        const fill = document.getElementById('session-progress-fill');
        if (fill) fill.style.width = Math.min(100, progress) + '%';
    } else {
        if (state.timeLeft > 0) {
            state.timeLeft--;
            elements.timerDisplay.textContent = state.timeLeft;

            let elapsed = state.timeLimit - state.timeLeft;
            let netWpm = Math.round(((state.charIndex - state.mistakes) / 5) / (elapsed / 60)) || 0;
            let rawWpm = Math.round((state.charIndex / 5) / (elapsed / 60)) || 0;
            state.wpmHistory.push(Math.max(0, netWpm));
            state.rawWpmHistory.push(Math.max(0, rawWpm));

            // Update Progress Bar (Time Mode) ⏱️
            const progress = (elapsed / state.timeLimit) * 100;
            const fill = document.getElementById('session-progress-fill');
            if (fill) fill.style.width = Math.min(100, progress) + '%';
        } else {
            finishTest();
        }
    }
}

// Test Flow
function startTest() {
    if (state.isRunning) return;

    // "Unlock" audio for browsers on first user gesture
    if (state.soundEnabled) {
        Object.values(sounds).forEach(s => {
            s.play().then(() => {
                s.pause();
                s.currentTime = 0;
            }).catch(() => { });
        });
    }

    // Ensure a paragraph is loaded BEFORE the countdown starts 📝
    loadParagraph();

    // Hide controls panel with animation
    const cardHeader = document.getElementById('card-header');
    if (cardHeader) cardHeader.classList.add('controls-hidden');

    // Show Countdown first ⏱️
    const overlay = document.getElementById('countdown-overlay');
    const number = document.getElementById('countdown-number');
    if (!overlay || !number) {
        startSession();
        return;
    }

    const ringFill = document.getElementById('ring-fill');
    const countdownLabel = document.getElementById('countdown-label');
    const countdownSub = document.getElementById('countdown-sub');
    const CIRCUMFERENCE = 427; // 2 * π * 68

    function setRing(fraction) {
        if (ringFill) ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
    }

    function resetNumber() {
        number.className = 'countdown-number';
        void number.offsetWidth; // force reflow to restart animation
    }

    let count = 3;
    resetNumber();
    number.textContent = count;
    setRing(1);
    overlay.style.display = 'flex';
    playSound('keypress');

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            resetNumber();
            number.textContent = count;
            setRing(count / 3);
            playSound('keypress');
        } else {
            clearInterval(countdownInterval);
            // Show GO!
            resetNumber();
            number.classList.add('go');
            number.textContent = 'GO!';
            if (countdownLabel) countdownLabel.textContent = "LET'S GO";
            if (countdownSub) countdownSub.textContent = 'start typing now';
            setRing(0);
            playSound('complete');
            setTimeout(() => {
                overlay.style.display = 'none';
                // Reset overlay state for next time
                resetNumber();
                number.textContent = '3';
                if (countdownLabel) countdownLabel.textContent = 'GET READY';
                if (countdownSub) countdownSub.textContent = 'prepare yourself';
                setRing(1);
                startSession();
            }, 700);
        }
    }, 1000);
}

function startSession() {
    state.isRunning = true;
    state.charIndex = 0;
    state.mistakes = 0;
    state.totalChars = 0;
    state.wordsCompleted = 0;
    state.elapsedSeconds = 0;
    state.timeLeft = state.mode === 'words' ? 0 : state.timeLimit; // Fix: Restore timeLeft reset!
    state.wpmHistory = [];
    state.rawWpmHistory = [];
    state.replayBuffer = [];
    state.mistakeLog = {};
    state.lastKeystrokeTime = Date.now();

    elements.typingInput.value = '';
    elements.typingInput.disabled = false;
    elements.typingInput.focus();

    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Hide Last Session pill during test
    const pill = document.getElementById('last-session-pill');
    if (pill) pill.style.display = 'none';

    timerInterval = setInterval(startTimer, 1000);
}

function finishTest() {
    state.isRunning = false;
    clearInterval(timerInterval);
    elements.typingInput.disabled = true;

    // 1. Calculate final stats
    let elapsed;
    if (state.mode === 'words') {
        elapsed = state.elapsedSeconds;
    } else {
        elapsed = state.timeLimit - state.timeLeft;
    }
    if (elapsed <= 0) elapsed = 1;

    const wpm = Math.round(((state.charIndex - state.mistakes) / 5) / (elapsed / 60));
    const accuracy = state.charIndex > 0 ? Math.round(((state.charIndex - state.mistakes) / state.charIndex) * 100) : 100;
    const cpm = state.charIndex;

    // 2. Display final stats
    elements.finalWpm.textContent = Math.max(0, wpm);
    elements.finalAccuracy.textContent = accuracy + "%";
    elements.finalCpm.textContent = cpm;
    if (document.getElementById('final-mistakes')) {
        document.getElementById('final-mistakes').textContent = state.mistakes;
    }

    // 3. UI Toggle: Hide Typing, Show Results
    const mainContainer = document.getElementById('main-typing-container');
    if (mainContainer) mainContainer.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.style.animation = 'slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    // Play complete sound
    playSound('complete');
    
    // Initialize Chart
    initChart();

    // 4. Save Last Session and Show in UI 🏆
    localStorage.setItem('lastSessionWpm', wpm);
    updateLastSessionUI();
    
    // 5. Smart Feedback Bubble ✨
    const smartFeedback = document.getElementById('smart-feedback');
    const smartMsg = document.getElementById('smart-msg');
    const bestWpm = localStorage.getItem('bestWpm') || 0;
    
    if (smartFeedback && smartMsg) {
        smartMsg.textContent = getSmartFeedback(wpm, accuracy, bestWpm);
        smartFeedback.style.display = 'flex';
    }

    if (typeof saveTestResult === 'function') {
        saveTestResult(Math.max(0, wpm), accuracy, state.mistakes, state.mode);
    }
}

function resetTest() {
    clearInterval(timerInterval);
    state.isRunning = false;
    state.charIndex = 0;
    state.mistakes = 0;
    state.wordsCompleted = 0;
    state.elapsedSeconds = 0;
    state.wpmHistory = [];
    state.rawWpmHistory = [];
    state.replayBuffer = [];
    state.mistakeLog = {};
    state.timeLeft = state.mode === 'words' ? 0 : state.timeLimit;

    // Reset Elements
    elements.typingInput.value = '';
    elements.typingInput.disabled = true;
    elements.timerDisplay.textContent = state.mode === 'words' ? `0/${state.wordLimit}` : state.timeLimit;
    elements.liveWpm.textContent = '0';
    elements.liveAccuracy.textContent = '100%';
    
    // UI HUD Stability
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';

    // Perma-Fix: Ensure Heatmap and Typing Area are visible ⌨️
    initKeyboard();
    
    const sections = ['results-section', 'leaderboard-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const mainContainer = document.getElementById('main-typing-container');
    if (mainContainer) mainContainer.style.display = 'block';

    // Restore controls panel
    const cardHeader = document.getElementById('card-header');
    if (cardHeader) cardHeader.classList.remove('controls-hidden');

    loadParagraph();
}

// Charting
function initChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    if (chart) chart.destroy();

    const netGradient = ctx.createLinearGradient(0, 0, 0, 300);
    netGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    netGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const rawGradient = ctx.createLinearGradient(0, 0, 0, 300);
    rawGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    rawGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    const labels = state.wpmHistory.map((_, i) => `${i + 1}s`);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Net WPM',
                    data: state.wpmHistory,
                    borderColor: '#6366f1',
                    backgroundColor: netGradient,
                    borderWidth: 4,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1',
                    pointHoverBorderWidth: 4,
                    z: 10
                },
                {
                    label: 'Raw WPM',
                    data: state.rawWpmHistory,
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    backgroundColor: rawGradient,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    z: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: 'rgba(255,255,255,0.5)',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: 'rgba(255,255,255,0.5)',
                    titleFont: { size: 11, weight: '700' },
                    bodyColor: '#fff',
                    bodyFont: { size: 14, weight: '800' },
                    padding: 15,
                    displayColors: true,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { 
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 11 },
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(255,255,255,0.05)',
                        drawBorder: false
                    },
                    ticks: { 
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 11 },
                        padding: 10
                    }
                }
            }
        }
    });
}

function initHistoryChart(history) {
    const ctx = document.getElementById('user-history-chart');
    if (!ctx || !history || history.length === 0) return;

    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    // Destroy existing chart if it exists
    if (window.userTrendChart) window.userTrendChart.destroy();

    const stats = [...history].reverse();
    const labels = stats.map((_, i) => `T${i + 1}`);
    const data = stats.map(s => s.wpm);

    window.userTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Speed (WPM)',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 4,
                tension: 0.5,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#6366f1',
                    bodyColor: 'white',
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: { 
                    display: true, 
                    beginAtZero: true,
                    max: 150,
                    grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
                },
                x: { 
                    display: true,
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
                }
            }
        }
    });
}

function getSmartFeedback(wpm, accuracy, bestWpm) {
    if (wpm > bestWpm) return "Holy smokes! You just shattered your record! 🚀 Keep that momentum going.";
    if (accuracy < 90) return "You're fast, but your fingers are slipping. Slow down slightly for better precision. 🎯";
    if (wpm < (bestWpm * 0.7)) return "A bit of a slow session? Don't sweat it, focus on the rhythm and try again. 🌊";
    if (accuracy === 100) return "PERFECTION! Your accuracy is elite. Time to push for more speed. ⚡";
    return "Solid session! You're consistently showing pro-level control. Keep at it! 🔥";
}

function updateLastSessionUI() {
    const lastSessionPill = document.getElementById('last-session-pill');
    const lastVal = document.getElementById('last-wpm-val');
    const lastWpm = localStorage.getItem('lastSessionWpm') || '0';

    if (lastSessionPill && lastVal) {
        lastVal.textContent = lastWpm;
        lastSessionPill.style.display = 'flex';
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('soundEnabled', state.soundEnabled);
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (elements.customTextModal.style.display === 'flex') return;
        if (state.isRunning) {
            resetTest();
            startTest();
        } else {
            startTest();
        }
    }

    // Space to skip current word (only if in the middle of a word)
    if (e.key === ' ' && state.isRunning) {
        const characters = elements.paragraphDisplay.querySelectorAll('span');
        const text = elements.paragraphDisplay.textContent;
        
        // Only skip if the current character is NOT a space
        if (text[state.charIndex] !== ' ') {
            let nextSpaceIndex = text.indexOf(' ', state.charIndex);
            
            if (nextSpaceIndex !== -1) {
                e.preventDefault(); // Prevent double input
                
                // Mark skipped characters as mistakes
                for (let i = state.charIndex; i <= nextSpaceIndex; i++) {
                    if (!characters[i].classList.contains('correct')) {
                        characters[i].classList.add('wrong');
                        state.mistakes++;
                    }
                }
                
                state.charIndex = nextSpaceIndex + 1;
                state.totalChars = state.charIndex;
                state.wordsCompleted++;

                // In words mode, check if limit is reached
                if (state.mode === 'words') {
                    elements.timerDisplay.textContent = `${state.wordsCompleted}/${state.wordLimit}`;
                    if (state.wordsCompleted >= state.wordLimit) {
                        finishTest();
                        return;
                    }
                }

                // Update active and current word UI
                const newChars = elements.paragraphDisplay.querySelectorAll('span');
                const newText = elements.paragraphDisplay.textContent;
                let wordStart = state.charIndex;
                while (wordStart > 0 && newText[wordStart - 1] !== ' ') wordStart--;
                let wordEnd = state.charIndex;
                while (wordEnd < newText.length && newText[wordEnd] !== ' ') wordEnd++;

                newChars.forEach((s, idx) => {
                    s.classList.remove('active', 'current-word');
                    if (idx === state.charIndex) s.classList.add('active');
                    if (idx >= wordStart && idx < wordEnd) s.classList.add('current-word');
                });

                updateLiveStats();
                handleAutoScroll();
            }
        }
    }
});

// Event Listeners (consolidated in DOMContentLoaded below — do not duplicate here)

// Auth Button Logic (Login vs Profile) 👤
elements.authBtn = document.getElementById('auth-btn');
if (elements.authBtn) {
    elements.authBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser;
        if (user) {
            openProfileModal(user);
        } else {
            window.location.href = 'auth.html';
        }
    });
}

async function openProfileModal(user) {
    const modal = document.getElementById('profile-modal');
    const nameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const streakVal = document.getElementById('streak-val');
    const bestWpm = document.getElementById('prof-best-wpm');
    const totalTests = document.getElementById('prof-total-tests');
    
    modal.style.display = 'flex';
    nameEl.textContent = "Loading...";

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            nameEl.textContent = data.username || "User";
            emailEl.textContent = user.email;
            streakVal.textContent = data.currentStreak || 0;
            bestWpm.textContent = data.bestWpm || 0;
            totalTests.textContent = data.totalTests || 0;

            // --- Unlock Badges Logic (Standardized) ---
            const b7 = document.getElementById('badge-7');
            const b30 = document.getElementById('badge-30');
            const streak = data.currentStreak || 0;

            if (b7) {
                b7.classList.toggle('unlocked', streak >= 7);
            }
            if (b30) {
                b30.classList.toggle('unlocked', streak >= 30);
            }
        }
    } catch (err) {
        console.error("Profile Error:", err);
    }
}

// Close & Logout
document.getElementById('close-profile')?.addEventListener('click', () => {
    document.getElementById('profile-modal').style.display = 'none';
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.reload();
    });
});

elements.customTextBtn.addEventListener('click', () => {
    elements.customTextModal.style.display = 'flex';
});

elements.closeModal.addEventListener('click', () => {
    elements.customTextModal.style.display = 'none';
});

elements.saveCustomText.addEventListener('click', () => {
    const text = elements.customTextInput.value.trim();
    if (text) {
        state.customText = text;
        state.timeLeft = state.timeLimit;
        resetTest();
    } else {
        state.customText = null;
    }
    elements.customTextModal.style.display = 'none';
});

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.isRunning) return;
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentDifficulty = btn.dataset.difficulty;
        state.customText = null;
        loadParagraph();
    });
});

document.querySelectorAll('.timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.isRunning) return;
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const val = btn.dataset.time;
        if (val === 'custom') {
            pendingCustomMode = 'time';
            pendingCustomBtn = btn;
            elements.customValueLabel.textContent = 'Enter custom duration (seconds)';
            elements.customValueInput.placeholder = 'e.g. 120';
            elements.customValueInput.value = '';
            elements.customValueModal.style.display = 'flex';
            setTimeout(() => elements.customValueInput.focus(), 100);
        } else {
            state.timeLimit = parseInt(val);
            state.timeLeft = state.timeLimit;
            elements.timerDisplay.textContent = state.timeLeft;
        }
    });
});

// Mode toggle
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.isRunning) return;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;

        const timeGroup = document.getElementById('time-group');
        const wordsGroup = document.getElementById('words-group');

        if (state.mode === 'words') {
            timeGroup.style.display = 'none';
            wordsGroup.style.display = 'flex';
            document.getElementById('timer-label').textContent = 'Words';
            elements.timerDisplay.textContent = `0/${state.wordLimit}`;
        } else {
            timeGroup.style.display = 'flex';
            wordsGroup.style.display = 'none';
            document.getElementById('timer-label').textContent = 'Timer';
            elements.timerDisplay.textContent = state.timeLimit;
        }
    });
});

// Words count buttons
document.querySelectorAll('.words-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.isRunning) return;
        document.querySelectorAll('.words-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const val = btn.dataset.words;
        if (val === 'custom') {
            pendingCustomMode = 'words';
            pendingCustomBtn = btn;
            elements.customValueLabel.textContent = 'Enter custom word count';
            elements.customValueInput.placeholder = 'e.g. 150';
            elements.customValueInput.value = '';
            elements.customValueModal.style.display = 'flex';
            setTimeout(() => elements.customValueInput.focus(), 100);
        } else {
            state.wordLimit = parseInt(val);
            elements.timerDisplay.textContent = `0/${state.wordLimit}`;
        }
    });
});

// Custom value modal handlers
let pendingCustomMode = null;
let pendingCustomBtn = null;

elements.saveCustomValue.addEventListener('click', () => {
    const parsed = parseInt(elements.customValueInput.value);
    if (!parsed || parsed < 5) return;

    if (pendingCustomMode === 'time') {
        state.timeLimit = parsed;
        state.timeLeft = parsed;
        elements.timerDisplay.textContent = parsed;
        if (pendingCustomBtn) pendingCustomBtn.textContent = parsed + 's';
    } else if (pendingCustomMode === 'words') {
        state.wordLimit = parsed;
        elements.timerDisplay.textContent = `0/${parsed}`;
        if (pendingCustomBtn) pendingCustomBtn.textContent = parsed;
    }

    elements.customValueModal.style.display = 'none';
    pendingCustomMode = null;
    pendingCustomBtn = null;
});

elements.closeCustomValue.addEventListener('click', () => {
    elements.customValueModal.style.display = 'none';
    if (pendingCustomBtn) pendingCustomBtn.classList.remove('active');
    pendingCustomMode = null;
    pendingCustomBtn = null;
});

// Apply on Enter key inside the input
elements.customValueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') elements.saveCustomValue.click();
});

// Replay Engine Logic 🎥
function playbackSession() {
    const replayContainer = elements.replayDisplay;
    const buffer = state.replayBuffer;
    
    // 1. Prepare Content
    replayContainer.innerHTML = '';
    const originalText = buffer.map(b => b.char).join('');
    
    // Just inject the spans first
    originalText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        replayContainer.appendChild(span);
    });

    const chars = replayContainer.querySelectorAll('span');
    let i = 0;

    function nextStep() {
        if (i >= buffer.length) return;

        const event = buffer[i];
        const span = chars[event.index];

        if (span) {
            span.classList.add(event.isCorrect ? 'correct' : 'wrong');
            span.classList.add('active');
            
            // Remove active from previous
            if (i > 0) {
                const prev = chars[buffer[i-1].index];
                if (prev) prev.classList.remove('active');
            }

            // Scroll Logic
            const lineHeight = 38;
            const topPos = span.offsetTop;
            if (topPos > (lineHeight * 1.5)) {
                replayContainer.scrollTop = topPos - lineHeight;
            }
        }

        i++;
        if (i < buffer.length) {
            // Respect the original speed/delay (capped for better experience)
            const wait = Math.min(event.delay, 1500); 
            setTimeout(nextStep, wait);
        }
    }

    elements.replayModal.style.display = 'flex';
    setTimeout(nextStep, 500);
}

elements.watchReplayBtn.addEventListener('click', playbackSession);
elements.closeReplay.addEventListener('click', () => elements.replayModal.style.display = 'none');

// --- CONSOLIDATED INIT CONTINUES ---

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Explicitly sync sound icon
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';

    initKeyboard();
    loadParagraph();
    updateLastSessionUI();

    // Event Listeners Base
    if (elements.startBtn) elements.startBtn.onclick = startTest;
    if (elements.restartBtn) elements.restartBtn.onclick = resetTest;
    if (elements.typingInput) elements.typingInput.oninput = initTyping;
    if (elements.soundToggle) elements.soundToggle.onclick = toggleSound;
    
    // Navigation Hub Bindings
    const lbBtn = document.getElementById('nav-leaderboard');
    if (lbBtn) lbBtn.onclick = (e) => {
        e.preventDefault();
        window.showLeaderboard();
    };

    // Modals
    if (elements.watchReplayBtn) elements.watchReplayBtn.onclick = playbackSession;
    if (elements.closeReplay) elements.closeReplay.onclick = () => elements.replayModal.style.display = 'none';
    
    // Settings Toggles (Difficulty & Mode)
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentDifficulty = btn.getAttribute('data-diff');
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            resetTest();
        });
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
             const newMode = btn.getAttribute('data-mode');
             if (newMode === 'time' || newMode === 'words') {
                 state.mode = newMode;
                 document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                 btn.classList.add('active');
                 resetTest();
             }
        });
    });

    // Global Keyboard Shortcut: Enter to Reset/Start 🔄
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const isResultsVisible = (elements.resultsSection && elements.resultsSection.style.display === 'block');
            const lbSection = document.getElementById('leaderboard-section');
            const isLeaderboardVisible = lbSection?.style.display === 'block';

            if (isResultsVisible || isLeaderboardVisible) {
                e.preventDefault();
                resetTest();
            }
        }
    });

    // Final Sync
    initKeyboard();
    loadParagraph();
});

// Final fallback call to ensure keyboard exists on fresh refresh ⌨️
initKeyboard();
