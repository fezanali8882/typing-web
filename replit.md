# TypeFast — Typing Speed Test

A web-based typing speed test application with real-time analytics, gamification, and a global leaderboard.

## Project Structure

```
.
├── index.html       # Main typing test UI
├── auth.html        # Login / Sign-up page (next-level split-screen design)
├── analysis.html    # Detailed session analytics (from Firestore)
├── app.js           # Core typing engine & game logic
├── firebase.js      # Firebase auth & Firestore integration
├── style.css        # Global styles (glassmorphism dark theme)
└── replit.md        # Project documentation
```

## Key Features

- **Random text generation**: Each session picks random words from difficulty-specific pools (easy/intermediate/hard) — never the same text twice
- **2-line typing display**: Shows exactly 2 lines with smooth auto-scroll as user types
- **3-2-1 countdown**: Full-screen SVG ring countdown with GO! flash; controls panel slides away during test
- **Firebase auth**: Email/password + Google OAuth, with email verification on signup
- **Real-time analytics**: Live WPM, accuracy, keystroke heatmap
- **Global leaderboard**: Firestore-backed rankings
- **Analysis page**: Performance breakdown from latest Firestore session (WPM chart, grade, verdict, skill bars, weak keys)

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Theme**: Cyberpunk/Mastermind — pure black (#080810) bg, electric cyan (#00d4ff) primary, deep violet (#7c3aed) secondary, JetBrains Mono for typing area
- **Backend / Auth**: Firebase v9 (Authentication + Firestore)
- **Charts**: Chart.js (via CDN)
- **Fonts**: Google Fonts — Inter, Outfit & JetBrains Mono (via CDN)
- **No build step** — all dependencies loaded from CDN

## Running the App

The app is served as a static site using `serve` on port 5000.

**Workflow:** `Start application`  
**Command:** `npx serve -s . -l 5000`

## Deployment

Configured as a **static** deployment — files are served directly from the project root.
