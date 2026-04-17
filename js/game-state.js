// ── Game State Persistence (Firebase Bridge) ──
import {
  db, doc, setDoc, getDoc, addDoc, updateDoc, collection,
  serverTimestamp, Timestamp, query, where, orderBy, limit, getDocs
} from './firebase-config.js';

let currentSessionId = null;
let currentSessionRef = null;

export async function createGameSession(studentId, studentName) {
  const sessionData = {
    studentId,
    studentName,
    startedAt: serverTimestamp(),
    completedAt: null,
    totalScore: 0,
    maxPossible: 11,
    starRating: 0,
    levelScores: {
      1: { correct: 0, total: 5, attempts: 0 },
      2: { correct: 0, total: 3, attempts: 0 },
      3: { correct: 0, total: 3, attempts: 0 }
    },
    questionDetails: [],
    isComplete: false
  };

  const docRef = await addDoc(collection(db, 'gameSessions'), sessionData);
  currentSessionId = docRef.id;
  currentSessionRef = docRef;
  return currentSessionId;
}

export async function recordAnswer(level, questionIndex, spokenAnswer, expectedAnswer, isCorrect, attempts) {
  if (!currentSessionId) return;

  const sessionRef = doc(db, 'gameSessions', currentSessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const detail = {
    level,
    questionIndex,
    answer: spokenAnswer,
    expectedAnswer,
    isCorrect,
    attempts,
    timestamp: Timestamp.now()
  };

  data.questionDetails.push(detail);

  if (isCorrect) {
    data.totalScore += 1;
    data.levelScores[level].correct += 1;
  }
  data.levelScores[level].attempts += attempts;

  await updateDoc(sessionRef, {
    totalScore: data.totalScore,
    levelScores: data.levelScores,
    questionDetails: data.questionDetails
  });
}

export async function completeGameSession(totalScore) {
  if (!currentSessionId) return;

  const pct = totalScore / 11;
  let starRating = 1;
  if (pct >= 0.9) starRating = 3;
  else if (pct >= 0.6) starRating = 2;

  await updateDoc(doc(db, 'gameSessions', currentSessionId), {
    completedAt: serverTimestamp(),
    totalScore,
    starRating,
    isComplete: true
  });

  const sessionId = currentSessionId;
  currentSessionId = null;
  currentSessionRef = null;
  return sessionId;
}

export async function updateScoreboard(studentId, studentName, avatarEmoji, totalScore) {
  const scoreboardRef = doc(db, 'scoreboard', studentId);
  const existing = await getDoc(scoreboardRef);

  let data;
  if (existing.exists()) {
    const prev = existing.data();
    data = {
      studentId,
      studentName,
      avatarEmoji: avatarEmoji || '🐠',
      bestScore: Math.max(prev.bestScore || 0, totalScore),
      bestStars: Math.max(prev.bestStars || 0, totalScore >= 10 ? 3 : totalScore >= 7 ? 2 : 1),
      totalGamesPlayed: (prev.totalGamesPlayed || 0) + 1,
      lastPlayedAt: serverTimestamp(),
      averageScore: Math.round(((prev.averageScore || 0) * (prev.totalGamesPlayed || 0) + totalScore) / ((prev.totalGamesPlayed || 0) + 1) * 10) / 10
    };
  } else {
    data = {
      studentId,
      studentName,
      avatarEmoji: avatarEmoji || '🐠',
      bestScore: totalScore,
      bestStars: totalScore >= 10 ? 3 : totalScore >= 7 ? 2 : 1,
      totalGamesPlayed: 1,
      lastPlayedAt: serverTimestamp(),
      averageScore: totalScore
    };
  }

  await setDoc(scoreboardRef, data);
}

export async function getStudentSessions(studentId, maxResults = 20) {
  const q = query(
    collection(db, 'gameSessions'),
    where('studentId', '==', studentId),
    where('isComplete', '==', true),
    orderBy('completedAt', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getStudentScoreboardEntry(studentId) {
  const snap = await getDoc(doc(db, 'scoreboard', studentId));
  return snap.exists() ? snap.data() : null;
}
