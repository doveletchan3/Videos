/**
 * Video Streaming App - Shared Application Logic & Utilities
 * Compatible with Static GitHub Pages & Local Python Server
 */

const APP_CONFIG = {
  DATA_URL: './data/videos.json',
  HISTORY_KEY: 'ikan_watch_history_v1',
  DEFAULT_FALLBACK_POSTER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23eceff1'/%3E%3Ctext x='50%25' y='50%25' fill='%2390a4ae' font-family='sans-serif' font-size='20' text-anchor='middle' dy='.3em'%3E暂无封面%3C/text%3E%3C/svg%3E"
};

// Robot Logo SVG markup matching the icon in iKanbot header
const ROBOT_LOGO_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Antenna -->
  <line x1="50" y1="20" x2="50" y2="10" stroke="#444" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="8" r="4" fill="#444"/>
  <line x1="42" y1="18" x2="32" y2="12" stroke="#444" stroke-width="4" stroke-linecap="round"/>
  <circle cx="30" cy="11" r="3" fill="#444"/>
  <line x1="58" y1="18" x2="68" y2="12" stroke="#444" stroke-width="4" stroke-linecap="round"/>
  <circle cx="70" cy="11" r="3" fill="#444"/>
  <!-- Head Box -->
  <rect x="15" y="22" width="70" height="52" rx="12" ry="12" fill="#fff" stroke="#444" stroke-width="5"/>
  <!-- Ears -->
  <rect x="7" y="38" width="8" height="20" rx="3" fill="#444"/>
  <rect x="85" y="38" width="8" height="20" rx="3" fill="#444"/>
  <!-- Eyes -->
  <circle cx="36" cy="46" r="10" stroke="#444" stroke-width="4" fill="#fff"/>
  <circle cx="36" cy="46" r="4" fill="#444"/>
  <circle cx="64" cy="46" r="10" stroke="#444" stroke-width="4" fill="#fff"/>
  <circle cx="64" cy="46" r="4" fill="#444"/>
  <!-- Mouth / Line -->
  <line x1="38" y1="63" x2="62" y2="63" stroke="#444" stroke-width="4" stroke-linecap="round"/>
</svg>
`;

// Fetch video library from static json or local server
async function loadVideos() {
  const tryUrls = [
    APP_CONFIG.DATA_URL + '?t=' + Date.now(),
    'http://localhost:8080/api/videos',
    'http://127.0.0.1:8080/api/videos'
  ];

  for (const url of tryUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      // try next url
    }
  }
  return [];
}

// Watch History Utilities using localStorage
const WatchHistory = {
  getAll() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
  save(video, sourceIndex, epIndex, epName, currentTime = 0, duration = 0) {
    if (!video || !video.id) return;
    const list = this.getAll();
    const item = {
      id: String(video.id),
      title: video.title,
      poster: video.poster,
      category: video.category || '剧集',
      sourceIndex: sourceIndex || 0,
      sourceName: video.sources && video.sources[sourceIndex] ? video.sources[sourceIndex].name : '线路1',
      epIndex: epIndex || 0,
      epName: epName || '第1集',
      currentTime: Math.floor(currentTime),
      duration: Math.floor(duration),
      updatedAt: new Date().toISOString()
    };
    // remove existing item for this video
    const filtered = list.filter(x => String(x.id) !== String(video.id));
    filtered.unshift(item);
    // keep max 50 items
    if (filtered.length > 50) filtered.length = 50;
    try {
      localStorage.setItem(APP_CONFIG.HISTORY_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  },
  get(videoId) {
    const list = this.getAll();
    return list.find(x => String(x.id) === String(videoId)) || null;
  },
  remove(videoId) {
    const list = this.getAll().filter(x => String(x.id) !== String(videoId));
    localStorage.setItem(APP_CONFIG.HISTORY_KEY, JSON.stringify(list));
  },
  clear() {
    localStorage.removeItem(APP_CONFIG.HISTORY_KEY);
  }
};

// URL Query Param Helper
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Time Formatter
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Shared Header Initializer for all pages
function initCommonHeader(activeNav = 'home') {
  const brandEl = document.querySelector('.brand-logo');
  if (brandEl && !brandEl.innerHTML.trim()) {
    brandEl.innerHTML = ROBOT_LOGO_SVG;
    brandEl.onclick = () => window.location.href = 'index.html';
  }

  // Bind search form
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        if (typeof window.performSearch === 'function') {
          window.performSearch(q);
        }
      } else {
        window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
  }
}
