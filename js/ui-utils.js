// ── UI Utilities ──

export function spawnDecorations() {
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 10 + Math.random() * 30;
    b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${6+Math.random()*10}s;animation-delay:${Math.random()*8}s;`;
    document.body.appendChild(b);
  }
  const fishEmojis = ['🐠','🐡','🐟','🦈','🐬','🐙'];
  for (let i = 0; i < 5; i++) {
    const f = document.createElement('div');
    f.className = 'deco-fish';
    f.textContent = fishEmojis[Math.floor(Math.random()*fishEmojis.length)];
    const top = 10 + Math.random() * 80;
    const dur = 18 + Math.random() * 20;
    const delay = Math.random() * 15;
    f.style.cssText = `top:${top}%;animation-duration:${dur}s;animation-delay:-${delay}s;`;
    document.body.appendChild(f);
  }
}

export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

export function showLoading(msg = 'Loading...') {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div><div class="loading-text"></div>`;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('.loading-text').textContent = msg;
  overlay.classList.add('active');
}

export function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) overlay.classList.remove('active');
}

export function renderProfileBadge(user, basePath = '.') {
  const badge = document.createElement('div');
  badge.className = 'profile-badge';
  badge.innerHTML = `
    <div class="profile-avatar">${user.avatarEmoji || '🐠'}</div>
    <span class="profile-name">${user.displayName || user.username}</span>
    <div class="profile-dropdown" id="profile-dropdown">
      ${user.role === 'student' ? `
        <a href="${basePath}/student/dashboard.html">🏠 Dashboard</a>
        <a href="${basePath}/student/profile.html">📊 My Profile</a>
        <a href="${basePath}/student/scoreboard.html">🏆 Scoreboard</a>
      ` : `
        <a href="${basePath}/teacher/dashboard.html">🏠 Dashboard</a>
        <a href="${basePath}/teacher/students.html">👥 Students</a>
        <a href="${basePath}/teacher/analytics.html">📊 Analytics</a>
      `}
      <a href="#" onclick="window._logout(); return false;">🚪 Logout</a>
    </div>
  `;
  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('profile-dropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    const dd = document.getElementById('profile-dropdown');
    if (dd) dd.classList.remove('open');
  });
  document.body.appendChild(badge);
}

export function generatePassword(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function generateUsername(prefix, index) {
  return `${prefix}_${String(index).padStart(3, '0')}`;
}
