// ── Game Engine (extracted from original index.html) ──
import { LEVELS, TOTAL_QUESTIONS } from './game-data.js';
import { createGameSession, recordAnswer, completeGameSession, updateScoreboard } from './game-state.js';

let currentLevel = 1;
let currentQ = 0;
let score = 0;
let totalQ = 0;
let unlockedLevels = [1];
let recognition = null;
let isListening = false;
let answered = false;
let questionAttempts = 0;

// Set by the game page after auth
let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

// ── Speech Recognition ──
function initSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('no-speech-warn').style.display = 'block';
    return false;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;

  recognition.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    const box = document.getElementById('transcript');
    box.textContent = (final || interim) || '';
    box.className = 'transcript-box has-text';
    if (final) {
      stopListening();
      checkAnswer(final.trim());
    }
  };

  recognition.onerror = (e) => {
    stopListening();
    if (e.error !== 'no-speech') {
      document.getElementById('transcript').textContent = 'Could not hear you. Try again!';
    }
  };

  recognition.onend = () => { if (isListening) stopListening(); };
  return true;
}

export function toggleMic() {
  if (answered) return;
  if (isListening) stopListening();
  else startListening();
}

function startListening() {
  if (!recognition && !initSpeech()) return;
  isListening = true;
  recognition.start();
  const btn = document.getElementById('mic-btn');
  btn.classList.add('listening');
  btn.textContent = '⏹️';
  document.getElementById('mic-label').textContent = 'Listening... (tap to stop)';
  document.getElementById('transcript').textContent = '';
  document.getElementById('transcript').className = 'transcript-box';
}

function stopListening() {
  isListening = false;
  try { recognition.stop(); } catch(e){}
  const btn = document.getElementById('mic-btn');
  btn.classList.remove('listening');
  btn.textContent = '🎤';
  document.getElementById('mic-label').textContent = 'Tap to speak';
}

// ── Answer Checking ──
function normalize(str) {
  return str.toLowerCase()
    .replace(/['‘’`]/g, "'")
    .replace(/[^a-z0-9\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkAnswer(spoken) {
  const qData = LEVELS[currentLevel].questions[currentQ];
  const spokenNorm = normalize(spoken);
  const answerNorm = normalize(qData.answer);

  let correct = spokenNorm.includes(answerNorm) || answerNorm.includes(spokenNorm);
  if (!correct) {
    for (const alt of qData.altAnswers) {
      const altN = normalize(alt);
      if (spokenNorm.includes(altN) || altN.includes(spokenNorm)) { correct = true; break; }
    }
  }
  if (currentLevel === 1) {
    correct = spokenNorm.split(' ').some(w => w === answerNorm);
  }

  questionAttempts++;
  answered = true;
  showFeedback(correct, spoken);

  if (correct) {
    score++;
    updateScore();
    // Record to Firebase
    if (currentUser) {
      recordAnswer(currentLevel, currentQ, spoken, qData.answer, true, questionAttempts).catch(console.error);
    }
  } else {
    if (currentUser) {
      recordAnswer(currentLevel, currentQ, spoken, qData.answer, false, questionAttempts).catch(console.error);
    }
  }
}

function showFeedback(correct, spoken) {
  const fb = document.getElementById('feedback');
  const tryBtn = document.getElementById('try-again-btn');
  const nextBtn = document.getElementById('next-btn');
  const isLast = currentQ >= LEVELS[currentLevel].questions.length - 1;

  fb.className = 'feedback ' + (correct ? 'correct' : 'wrong');
  fb.style.display = 'flex';
  fb.textContent = correct
    ? ['✅ Excellent! 🎉','✅ Awesome! ⭐','✅ Perfect! 🌟','✅ Great job! 🐠'][Math.floor(Math.random()*4)]
    : `❌ Try again! The answer is: "${LEVELS[currentLevel].questions[currentQ].answer}"`;

  document.getElementById('mic-btn').disabled = true;
  if (!correct) {
    tryBtn.style.display = 'inline-flex';
    nextBtn.style.display = 'none';
  } else {
    tryBtn.style.display = 'none';
    nextBtn.style.display = 'inline-flex';
    nextBtn.textContent = isLast && currentLevel < 3 ? '🚀 Next Level!' : isLast ? '🏆 Finish!' : 'Next ➡️';
  }
}

// ── Game Flow ──
export async function startGame() {
  currentLevel = 1; currentQ = 0; score = 0; totalQ = 0;
  unlockedLevels = [1];
  questionAttempts = 0;
  updateScore();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  document.getElementById('end-screen').style.display = 'none';
  initSpeech();

  // Create Firebase session
  if (currentUser) {
    await createGameSession(currentUser.uid, currentUser.displayName || currentUser.username).catch(console.error);
  }

  loadQuestion();
}

function loadQuestion() {
  answered = false;
  questionAttempts = 0;
  const lvl = LEVELS[currentLevel];
  const q = lvl.questions[currentQ];

  document.getElementById('level-label').textContent = lvl.label;
  document.getElementById('q-img').src = (currentUser ? '../assets/images/' : 'assets/images/') + q.img + '.png';
  document.getElementById('q-text').textContent = q.text || q.answer;
  document.getElementById('q-hint').textContent = lvl.hint;
  document.getElementById('transcript').textContent = 'Your words will appear here...';
  document.getElementById('transcript').className = 'transcript-box';
  document.getElementById('feedback').style.display = 'none';
  document.getElementById('try-again-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('mic-btn').disabled = false;
  document.getElementById('mic-btn').textContent = '🎤';
  document.getElementById('level-display').textContent = `📚 Level ${currentLevel}`;

  const dots = document.getElementById('progress-dots');
  dots.innerHTML = '';
  lvl.questions.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i < currentQ ? ' done' : i === currentQ ? ' current' : '');
    dots.appendChild(d);
  });
}

export function tryAgain() {
  answered = false;
  document.getElementById('feedback').style.display = 'none';
  document.getElementById('try-again-btn').style.display = 'none';
  document.getElementById('transcript').textContent = 'Your words will appear here...';
  document.getElementById('transcript').className = 'transcript-box';
  document.getElementById('mic-btn').disabled = false;
}

export async function nextQuestion() {
  totalQ++;
  const lvl = LEVELS[currentLevel];
  if (currentQ < lvl.questions.length - 1) {
    currentQ++;
    loadQuestion();
  } else {
    if (currentLevel < 3) {
      currentLevel++;
      currentQ = 0;
      unlockedLevels.push(currentLevel);
      updateTabs();
      loadQuestion();
    } else {
      await showEndScreen();
    }
  }
}

export function jumpLevel(lvl) {
  if (!unlockedLevels.includes(lvl)) return;
  currentLevel = lvl;
  currentQ = 0;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  updateTabs();
  loadQuestion();
}

function updateTabs() {
  document.querySelectorAll('.level-tab').forEach(tab => {
    const l = parseInt(tab.dataset.level);
    tab.className = 'level-tab';
    if (l === currentLevel) tab.classList.add('active');
    else if (!unlockedLevels.includes(l)) tab.classList.add('locked');
  });
}

function updateScore() {
  document.getElementById('score-display').textContent = `⭐ Score: ${score}`;
}

async function showEndScreen() {
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('end-screen').style.display = 'block';
  document.getElementById('final-score').textContent = `${score} / ${TOTAL_QUESTIONS}`;

  let stars = '', msg;
  const pct = score / TOTAL_QUESTIONS;
  if (pct >= 0.9)      { stars = '⭐⭐⭐'; msg = "Amazing! You're an Ocean Master! 🏆🌊"; }
  else if (pct >= 0.6) { stars = '⭐⭐'; msg = "Great work! Keep practicing! 🐠"; }
  else                 { stars = '⭐'; msg = "Good try! Let's practice more! 🦀"; }

  document.getElementById('star-row').textContent = stars;
  document.getElementById('final-msg').textContent = msg;

  // Persist to Firebase
  if (currentUser) {
    try {
      await completeGameSession(score);
      await updateScoreboard(currentUser.uid, currentUser.displayName || currentUser.username, currentUser.avatarEmoji, score);
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  }
}

export async function restartGame() {
  document.getElementById('end-screen').style.display = 'none';
  document.querySelectorAll('.level-tab').forEach(t => {
    const l = parseInt(t.dataset.level);
    t.className = 'level-tab' + (l === 1 ? ' active' : ' locked');
  });
  await startGame();
}
