# Thai Lagoon Island Adventure - Setup Guide

## Quick Start

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project** and follow the wizard
3. Once created, click the **Web** icon (`</>`) to register a web app
4. Copy the `firebaseConfig` object

### 2. Configure the App

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Enable Firebase Services

In the Firebase Console:

- **Authentication** > Sign-in method > Enable **Email/Password**
- **Firestore Database** > Create database > Start in **test mode** (we'll add rules later)

### 4. Create Your First Teacher Account

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **Add User**
3. Enter: `teacher@lagoon.local` / your chosen password
4. Copy the **User UID**
5. Go to **Firestore Database** > **Start collection** named `users`
6. **Add document** with Document ID = the UID you copied:
   ```
   uid: (the UID)
   username: "teacher"
   email: "teacher@lagoon.local"
   role: "teacher"
   displayName: "Teacher"
   avatarEmoji: "🌟"
   classGroup: ""
   isActive: true
   createdAt: (server timestamp)
   createdBy: null
   ```

### 5. Deploy Security Rules

Copy the contents of `firestore.rules` into:
Firebase Console > Firestore > Rules > paste > **Publish**

### 6. Deploy the App

**Option A: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # set public directory to "."
firebase deploy
```

**Option B: GitHub Pages**
1. Push this folder to a GitHub repository
2. Settings > Pages > Source: main branch
3. Your site is live at `https://yourusername.github.io/repo-name/`

**Option C: Local Testing**
```bash
# Any static file server works:
npx serve .
# or
python3 -m http.server 8000
```

### 7. Log In

- Open the app URL
- Log in as teacher with username `teacher` and your password
- Create student accounts from the Teacher Dashboard > Students page

## File Structure

```
Lagoon_Game/
├── index.html              # Auto-redirect based on auth
├── login.html              # Login page (student & teacher)
├── firestore.rules         # Firestore security rules
├── student/
│   ├── dashboard.html      # Student home
│   ├── game.html           # The game with voice recognition
│   ├── profile.html        # Performance history & charts
│   └── scoreboard.html     # Real-time rankings
├── teacher/
│   ├── dashboard.html      # Teacher overview
│   ├── students.html       # Student CRUD & bulk import
│   ├── analytics.html      # Charts & class analytics
│   └── reports.html        # Reports & export (Excel/PDF/Word)
├── css/
│   ├── shared.css          # Theme & shared components
│   ├── game.css            # Game-specific styles
│   ├── login.css           # Login page
│   ├── student.css         # Student pages
│   └── teacher.css         # Teacher pages
├── js/
│   ├── firebase-config.js  # Firebase initialization
│   ├── auth.js             # Authentication & account creation
│   ├── game-data.js        # Question/level data
│   ├── game-engine.js      # Game logic & speech recognition
│   ├── game-state.js       # Firestore persistence
│   ├── scoreboard.js       # Real-time scoreboard
│   ├── export-utils.js     # PDF/Excel/Word export
│   └── ui-utils.js         # Shared UI helpers
└── assets/images/          # Game images (bg.png, 1-11.png)
```

## Features

### Student Portal
- Username + password login
- Instructions page before game
- Voice-based English learning game (3 levels, 11 questions)
- Profile with score history & charts
- Real-time live scoreboard

### Teacher Portal
- Dashboard with overview stats & activity feed
- Student management (add, edit, deactivate, delete)
- Auto-generate usernames & passwords
- Bulk import students from Excel (.xlsx)
- Analytics with 4 chart types + individual drill-down
- Reports with score editing, manual entries, duplication
- Export to Excel (.xlsx), PDF, and Word (.docx)
