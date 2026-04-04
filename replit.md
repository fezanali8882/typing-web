# TypeFast — Typing Speed Test

A web-based typing speed test application with real-time analytics, gamification, and a global leaderboard.

## Project Structure

```
.
├── index.html       # Main typing test UI
├── auth.html        # Login / Sign-up page
├── practice.html    # Dedicated practice drills
├── analysis.html    # Detailed session analytics
├── handler.html     # OAuth / redirect handler
├── app.js           # Core typing engine & game logic
├── firebase.js      # Firebase auth & Firestore integration
├── style.css        # Global styles (glassmorphism dark theme)
└── README.md        # Project README
```

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend / Auth**: Firebase v9 (Authentication + Firestore)
- **Charts**: Chart.js (via CDN)
- **Fonts**: Google Fonts — Inter & Outfit (via CDN)
- **No build step** — all dependencies loaded from CDN

## Running the App

The app is served as a static site using `serve` on port 5000.

**Workflow:** `Start application`  
**Command:** `npx serve -s . -l 5000`

## Deployment

Configured as a **static** deployment — files are served directly from the project root.
