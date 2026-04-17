// ── Real-Time Scoreboard ──
import { db, collection, query, orderBy, limit, onSnapshot } from './firebase-config.js';

let unsubscribe = null;

export function startScoreboardListener(callback, maxEntries = 50) {
  const q = query(
    collection(db, 'scoreboard'),
    orderBy('bestScore', 'desc'),
    limit(maxEntries)
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    const rankings = [];
    let rank = 1;
    snapshot.forEach((doc) => {
      rankings.push({ rank: rank++, id: doc.id, ...doc.data() });
    });
    callback(rankings);
  }, (error) => {
    console.error('Scoreboard listener error:', error);
  });

  return unsubscribe;
}

export function stopScoreboardListener() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export function renderScoreboardTable(rankings, currentUserId, container) {
  if (rankings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#78909c;">
        <div style="font-size:3rem; margin-bottom:12px;">🌊</div>
        <p>No scores yet! Be the first to play!</p>
      </div>`;
    return;
  }

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  let html = `<table class="data-table">
    <thead>
      <tr>
        <th style="width:60px">Rank</th>
        <th>Player</th>
        <th style="text-align:center">Best Score</th>
        <th style="text-align:center">Stars</th>
        <th style="text-align:center">Games</th>
        <th style="text-align:center">Avg</th>
      </tr>
    </thead>
    <tbody>`;

  for (const entry of rankings) {
    const isMe = entry.studentId === currentUserId;
    const rowClass = isMe ? 'style="background:#e3f2fd; font-weight:700;"' : '';
    html += `
      <tr ${rowClass}>
        <td style="text-align:center; font-size:1.2rem;">${getMedal(entry.rank)}</td>
        <td>
          <span style="font-size:1.3rem; margin-right:6px;">${entry.avatarEmoji || '🐠'}</span>
          ${entry.studentName}${isMe ? ' <span style="color:var(--ocean-bright); font-size:.8rem;">(You)</span>' : ''}
        </td>
        <td style="text-align:center; font-weight:700;">${entry.bestScore}/11</td>
        <td style="text-align:center;">${'⭐'.repeat(entry.bestStars || 1)}</td>
        <td style="text-align:center;">${entry.totalGamesPlayed || 0}</td>
        <td style="text-align:center;">${entry.averageScore || 0}</td>
      </tr>`;
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

export function renderMiniScoreboard(rankings, currentUserId, container, maxShow = 5) {
  const top = rankings.slice(0, maxShow);
  if (top.length === 0) {
    container.innerHTML = '<p style="color:#78909c; font-size:.9rem;">No scores yet</p>';
    return;
  }

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  let html = '';
  for (const entry of top) {
    const isMe = entry.studentId === currentUserId;
    html += `
      <div style="display:flex; align-items:center; gap:10px; padding:6px 0; ${isMe ? 'font-weight:700; color:var(--ocean-deep);' : 'color:#546e7a;'}">
        <span style="width:30px; text-align:center;">${getMedal(entry.rank)}</span>
        <span>${entry.avatarEmoji || '🐠'}</span>
        <span style="flex:1;">${entry.studentName}</span>
        <span style="font-weight:700;">${entry.bestScore}/11</span>
      </div>`;
  }
  container.innerHTML = html;
}
