# Host Lagoon Game on Your Own GitHub

A step-by-step tutorial for deploying your own copy of Thai Lagoon Island Adventure to GitHub Pages under a different GitHub account.

---

## What you'll end up with

A live site at `https://<your-github-username>.github.io/lagoon-game/` running on your own Firebase backend.

## Prerequisites

- A GitHub account
- A Google account (for Firebase)
- Git installed locally (`git --version` to check)
- Optional but recommended: the [GitHub CLI](https://cli.github.com) (`gh`)

---

## Step 1 — Get the code onto your machine

### Option A: Fork on GitHub (easiest)

1. Go to https://github.com/yungie-kaenchan/lagoon-game
2. Click **Fork** (top right) → select your account
3. Clone your fork:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/lagoon-game.git
   cd lagoon-game
   ```

### Option B: Fresh copy (clean history, no link to upstream)

```bash
git clone https://github.com/yungie-kaenchan/lagoon-game.git
cd lagoon-game
rm -rf .git
git init -b main
```
Then create an empty repo on GitHub named `lagoon-game` and push:
```bash
git remote add origin https://github.com/<YOUR-USERNAME>/lagoon-game.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## Step 2 — Create your own Firebase project

1. Go to https://console.firebase.google.com → **Add project**
2. Name it (e.g. `my-lagoon-game`), accept defaults, **Create**
3. On the overview page click the **Web icon** (`</>`) to register a web app
4. Give it a nickname, skip Hosting, **Register app**
5. Copy the `firebaseConfig` object it shows you — you'll need it in Step 3

### Enable required services

In the left sidebar of the Firebase Console:

- **Build → Authentication → Get started → Email/Password → Enable → Save**
- **Build → Firestore Database → Create database → Start in production mode → pick a region → Enable**
- **Build → Firestore Database → Rules tab** → paste the entire contents of [firestore.rules](firestore.rules) → **Publish**

---

## Step 3 — Wire the app to your Firebase project

Open [js/firebase-config.js](js/firebase-config.js) and replace the `firebaseConfig` object (lines 9–16) with the one you copied in Step 2:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> **Note:** Web API keys are safe to commit — security lives in Firestore rules + auth domain restrictions, not in the key.

Commit and push:
```bash
git add js/firebase-config.js
git commit -m "Point to my Firebase project"
git push
```

---

## Step 4 — Create the first teacher account

The app has no self-signup, so you bootstrap the first teacher manually in the Firebase Console.

1. **Authentication → Users → Add user**
   - Email: `teacher@lagoon.local`
   - Password: your choice
   - **Add user**, then **copy the UID**

2. **Firestore Database → Start collection** named `users`

3. **Add document** with **Document ID = the UID** you copied. Add these fields:

| Field         | Type      | Value                          |
|---------------|-----------|--------------------------------|
| `uid`         | string    | (the UID)                      |
| `username`    | string    | `teacher`                      |
| `email`       | string    | `teacher@lagoon.local`         |
| `role`        | string    | `teacher`                      |
| `displayName` | string    | `Teacher`                      |
| `avatarEmoji` | string    | `🌟`                           |
| `classGroup`  | string    | (leave blank)                  |
| `isActive`    | boolean   | `true`                         |
| `createdAt`   | timestamp | (click "use server timestamp") |
| `createdBy`   | null      | null                           |

4. **Save**

---

## Step 5 — Turn on GitHub Pages

### Option A: Via the GitHub website

1. Go to your repo → **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / folder: `/ (root)` → **Save**
4. Wait 1–2 minutes. Your URL appears at the top of the Pages screen.

### Option B: Via GitHub CLI

```bash
gh api --method POST /repos/<YOUR-USERNAME>/lagoon-game/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

---

## Step 6 — Authorize your Pages domain in Firebase

**This is the step everyone forgets. Without it, login will fail on the live site.**

1. Firebase Console → **Authentication → Settings → Authorized domains**
2. **Add domain**: `<YOUR-USERNAME>.github.io`
3. **Add**

---

## Step 7 — Log in and try it

1. Open `https://<YOUR-USERNAME>.github.io/lagoon-game/`
2. Click **Teacher** tab → username `teacher` → your password
3. Go to **Students** page → create student accounts from there

That's it — you're live.

---

## Troubleshooting

| Symptom                                           | Fix                                                                                  |
|---------------------------------------------------|--------------------------------------------------------------------------------------|
| "Firebase not configured" banner on login         | You haven't replaced the config in [js/firebase-config.js](js/firebase-config.js)   |
| Login fails with `auth/unauthorized-domain`       | You skipped Step 6 — add your Pages domain to Firebase Authorized domains           |
| 404 on GitHub Pages URL                           | Wait 2 min after first enable; check Settings → Pages shows a green checkmark       |
| "Missing or insufficient permissions" in console  | You skipped publishing [firestore.rules](firestore.rules) — redo Step 2              |
| Teacher tab doesn't switch when clicked           | You're opening via `file://` — must serve over HTTP (GitHub Pages does this)        |
| Voice game asks for mic every time                | Normal on `http://localhost`; on `https://` GitHub Pages the browser remembers it   |

---

## Updating your deployment

Every push to `main` auto-deploys. To ship changes:

```bash
git add .
git commit -m "Your change"
git push
```

Wait ~60 seconds, hard-refresh (Cmd+Shift+R) to bypass cache.
