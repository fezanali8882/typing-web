

// ⚠️ REPLACE THESE WITH YOUR FIREBASE PROJECT CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCpuJjo_aImIjm2s8qR-tL6XSvTiBi-c1U",
    authDomain: "typefast-app-1e883.firebaseapp.com",
    projectId: "typefast-app-1e883",
    storageBucket: "typefast-app-1e883.firebasestorage.app",
    messagingSenderId: "832907790361",
    appId: "1:832907790361:web:98746fed336f88c6534288",
    measurementId: "G-J78KJ9JQ3M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ─────────────────────────────────────────────
//  AUTH STATE — tracks current user globally
// ─────────────────────────────────────────────
let currentUser = null;

auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    updateAuthUI(user);
});

// ─────────────────────────────────────────────
//  UI STATE UPDATE
// ─────────────────────────────────────────────
function updateAuthUI(user) {
    const btn = document.getElementById('auth-btn');
    const label = document.getElementById('auth-text');
    const icon = btn?.querySelector('.pill-icon');
    if (!btn || !label) return;

    if (user) {
        const name = user.displayName || user.email.split('@')[0];
        if (icon) icon.textContent = name.charAt(0).toUpperCase();
        label.textContent = 'Account';
        btn.classList.add('logged-in');
        btn.title = `Signed in as ${name}`;
    } else {
        if (icon) icon.textContent = '👤';
        label.textContent = 'Sign In';
        btn.classList.remove('logged-in');
        btn.title = 'Login / Profile';
    }
}

// ─────────────────────────────────────────────
//  AUTH MODAL OPEN/CLOSE
// ─────────────────────────────────────────────
function openAuthModal() {
    if (currentUser) {
        // User is logged in → show profile panel instead
        showProfilePanel();
    } else {
        // Not logged in → go to full auth page
        window.location.href = 'auth.html';
    }
}

function closeAuthModal() {
    // Modal exists on auth.html page logic, handled there locally
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
    clearAuthErrors();
}

// ─────────────────────────────────────────────
//  TAB SWITCHING
// ─────────────────────────────────────────────
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
    clearAuthErrors();
}

// ─────────────────────────────────────────────
//  ERROR HANDLING
// ─────────────────────────────────────────────
function showAuthError(message) {
    let el = document.getElementById('auth-error-msg');
    if (!el) {
        el = document.createElement('p');
        el.id = 'auth-error-msg';
        el.className = 'auth-error';
        document.querySelector('.auth-footer').prepend(el);
    }
    el.textContent = message;
}

function clearAuthErrors() {
    const el = document.getElementById('auth-error-msg');
    if (el) el.remove();
}

// ─────────────────────────────────────────────
//  SIGNUP
// ─────────────────────────────────────────────
async function handleSignup(e) {
    e.preventDefault();
    clearAuthErrors();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (username.length < 2) {
        showAuthError('Username must be at least 2 characters.');
        return;
    }

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        // Create user
        const { user } = await auth.createUserWithEmailAndPassword(email, password);

        // Set display name
        await user.updateProfile({ displayName: username });

        // Save user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            username,
            email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            totalTests: 0,
            bestWpm: 0,
            avgAccuracy: 0
        });

        closeAuthModal();
        // showToast(`Welcome, ${username}! 🎉`);

    } catch (err) {
        showAuthError(getFriendlyError(err.code));
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
}

// ─────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    clearAuthErrors();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();

    } catch (err) {
        showAuthError(getFriendlyError(err.code));
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
    }
}

// ─────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────
async function handleLogout() {
    await auth.signOut();
    const panel = document.getElementById('profile-panel');
    if (panel) panel.remove();
}

// ─────────────────────────────────────────────
//  PROFILE PANEL (shown when logged in)
// ─────────────────────────────────────────────
async function showProfilePanel() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    if (!currentUser) return;
    const name = currentUser.displayName || currentUser.email.split('@')[0];
    
    // Elements
    const elUsername = document.getElementById('profile-username');
    const elAvatar = document.getElementById('prof-avatar');
    const elRank = document.getElementById('prof-rank');
    const elLevel = document.getElementById('prof-level');
    const elLevelTag = document.getElementById('prof-level-tag');
    const elXpDisplay = document.getElementById('prof-xp-display');
    const elXpFill = document.getElementById('prof-xp-fill');
    const elBestWpm = document.getElementById('prof-best-wpm');
    const elImprovement = document.getElementById('prof-improvement-tag');
    const elCurStreak = document.getElementById('streak-val');
    const elMaxStreak = document.getElementById('prof-max-streak');
    const elAvgAcc = document.getElementById('prof-avg-acc');
    const elTotalTests = document.getElementById('prof-total-tests');
    const elAvgWpm = document.getElementById('prof-avg-wpm');

    // Fetch user stats from Firestore
    let stats = { 
        totalTests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0, 
        totalXp: 0, level: 1, rank: 'Beginner', 
        currentStreak: 0, maxStreak: 0, lastTestWpm: 0 
    };
    
    let historyData = [];

    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        const doc = await userRef.get();
        if (doc.exists) stats = { ...stats, ...doc.data() };

        // Fetch Last 10 Tests History for Charting 📈
        const historySnap = await userRef.collection('history')
            .orderBy('timestamp', 'desc').limit(10).get();
        historyData = historySnap.docs.map(d => d.data());
    } catch (e) { console.error("Profile Fetch Error:", e); }

    // Populate Info
    if (elUsername) elUsername.textContent = name;
    if (elAvatar) elAvatar.textContent = name.charAt(0).toUpperCase();
    if (elRank) elRank.textContent = stats.rank;
    if (elLevel) elLevel.textContent = stats.level;
    if (elLevelTag) elLevelTag.textContent = `LEVEL ${stats.level} ⚡`;
    
    // XP Progress
    const xpIntoLevel = stats.totalXp % (stats.level * 100);
    const xpNeeded = stats.level * 100;
    const xpPercent = (xpIntoLevel / xpNeeded) * 100;
    if (elXpDisplay) elXpDisplay.textContent = `${xpIntoLevel} / ${xpNeeded} XP`;
    if (elXpFill) elXpFill.style.width = `${xpPercent}%`;

    // History Chart 📈
    if (typeof initHistoryChart === 'function') {
        initHistoryChart(historyData);
    }

    // Stats Cards
    if (elBestWpm) elBestWpm.textContent = stats.bestWpm;
    if (elCurStreak) elCurStreak.textContent = stats.currentStreak;
    if (elMaxStreak) elMaxStreak.textContent = stats.maxStreak;
    if (elAvgAcc) elAvgAcc.textContent = `${stats.avgAccuracy}%`;
    if (elTotalTests) elTotalTests.textContent = stats.totalTests;
    if (elAvgWpm) elAvgWpm.textContent = stats.avgWpm;

    // Improvement Tag (Last Test vs Best)
    if (elImprovement) {
        const diff = (stats.lastTestWpm || 0) - (stats.bestWpm || 0);
        if (diff >= 0) elImprovement.textContent = "You're at your peak! 🔥";
        else elImprovement.textContent = `${Math.abs(diff)} WPM to match PB`;
    }

    // Achievements Unlocked Check 🏆
    unlockAchievement('ach-50', stats.bestWpm >= 50);
    unlockAchievement('ach-70', stats.bestWpm >= 70);
    unlockAchievement('ach-90', stats.bestWpm >= 90);
    unlockAchievement('ach-streak', stats.maxStreak >= 7);
    unlockAchievement('ach-perfect', stats.avgAccuracy >= 98); // Almost perfect 

    // Footer actions already set in index.html (Back / Logout)
}

function unlockAchievement(id, condition) {
    const el = document.getElementById(id);
    if (!el) return;
    if (condition) {
        el.classList.add('unlocked');
        el.classList.remove('locked');
    } else {
        el.classList.add('locked');
        el.classList.remove('unlocked');
    }
}

// ─────────────────────────────────────────────
//  SAVE TEST RESULT TO FIRESTORE (ULTRA PRO UPDATED)
// ─────────────────────────────────────────────
async function saveTestResult(wpm, accuracy, mistakes, mode) {
    if (!currentUser) return; // Only save if logged in

    const uid = currentUser.uid;
    const userRef = db.collection('users').doc(uid);

    try {
        const doc = await userRef.get();
        const data = doc.exists ? doc.data() : {};
        
        // --- Core Stats ---
        const totalTests = (data.totalTests || 0) + 1;
        const bestWpm = Math.max(data.bestWpm || 0, wpm);
        const avgWpm = Math.round(((data.avgWpm || 0) * (data.totalTests || 0) + wpm) / totalTests);
        const avgAccuracy = Math.round(((data.avgAccuracy || 0) * (data.totalTests || 0) + accuracy) / totalTests);

        // --- XP & Level System 🎮 ---
        // Formula: (WPM * Accuracy_Multiplier) + Bonus for perfect accuracy
        const xpGained = Math.round((wpm * (accuracy / 100)) + (accuracy === 100 ? 50 : 0));
        const totalXp = (data.totalXp || 0) + xpGained;
        const level = Math.floor(Math.sqrt(totalXp / 100)) + 1; // Simple level algorithm

        // --- Streak Logic 🔥 ---
        const today = new Date().toISOString().split('T')[0]; 
        let lastDate = data.lastTypedDate || '';
        let currentStreak = data.currentStreak || 0;

        if (lastDate === '') {
            currentStreak = 1;
        } else if (lastDate === today) {
            // Already typed today
        } else {
            const last = new Date(lastDate);
            const now = new Date(today);
            const diffDays = Math.ceil(Math.abs(now - last) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) currentStreak++;
            else currentStreak = 1;
        }
        const maxStreak = Math.max(data.maxStreak || 0, currentStreak);

        // --- Rank System 🏆 ---
        let rank = "Beginner";
        if (bestWpm >= 100) rank = "Master 👑";
        else if (bestWpm >= 80) rank = "Elite 🚀";
        else if (bestWpm >= 60) rank = "Pro ⚡";
        else if (bestWpm >= 40) rank = "Intermediate 💎";

        const updates = {
            bestWpm,
            avgWpm,
            totalTests,
            avgAccuracy,
            totalXp,
            level,
            rank,
            lastTypedDate: today,
            currentStreak,
            maxStreak,
            lastTestWpm: wpm,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(updates, { merge: true });

        // Also save to history
        await userRef.collection('history').add({
            wpm, accuracy, mistakes, mode, xpGained,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`XP Gained: ${xpGained} | Rank: ${rank}`);
    } catch (err) {
        console.error("Pro Save Error:", err);
    }
}

// ─────────────────────────────────────────────
//  FRIENDLY ERROR MESSAGES
// ─────────────────────────────────────────────
function getFriendlyError(code) {
    const map = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/operation-not-allowed': 'Email/Password auth is not enabled in Firebase Console.',
    };
    return map[code] || ('Error: ' + code);
}

// ─────────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Nav bar auth button logic (works on all pages)
    document.getElementById('auth-btn')?.addEventListener('click', openAuthModal);
    
    // The following are typically for a modal version on the same page.
    // If we're on auth.html, let that page handle its own form logic.
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (!isAuthPage) {
        document.getElementById('close-auth-modal')?.addEventListener('click', closeAuthModal);
        document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));
        document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));
        document.getElementById('login-form')?.addEventListener('submit', handleLogin);
        document.getElementById('signup-form')?.addEventListener('submit', handleSignup);
        
        // Close modal on backdrop click
        document.getElementById('auth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') closeAuthModal();
        });
    }
});
