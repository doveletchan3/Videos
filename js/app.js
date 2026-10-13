/**
 * Video Streaming App - Shared Application Logic & Utilities
 * Compatible with Static GitHub Pages & Local Python Server
 */

const APP_CONFIG = {
  DATA_URL: './data/videos.json',
  HISTORY_KEY: 'ikan_watch_history_v1',
  DEFAULT_FALLBACK_POSTER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23eceff1'/%3E%3Ctext x='50%25' y='50%25' fill='%2390a4ae' font-family='sans-serif' font-size='20' text-anchor='middle' dy='.3em'%3E暫無封面%3C/text%3E%3C/svg%3E"
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
  const ts = Date.now();
  const tryUrls = [
    APP_CONFIG.DATA_URL + '?t=' + ts,
    'http://localhost:8080/api/videos?t=' + ts,
    'http://127.0.0.1:8080/api/videos?t=' + ts
  ];

  for (const url of tryUrls) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
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
      category: video.category || '劇集',
      sourceIndex: sourceIndex || 0,
      sourceRealIndex: video.sources && video.sources[sourceIndex] ? video.sources[sourceIndex].source_index : null,
      sourceId: video.sources && video.sources[sourceIndex] ? video.sources[sourceIndex].source_id : null,
      sourceName: video.sources && video.sources[sourceIndex] ? (
        video.sources[sourceIndex].lang ? `${video.sources[sourceIndex].name} (${video.sources[sourceIndex].lang})` : video.sources[sourceIndex].name
      ) : '線路1',
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

const BRAND_LOGO_HTML = `<img src="img/logo.png" alt="Logo" class="site-logo-img">`;

// Shared Header Initializer for all pages
function initCommonHeader(activeNav = 'home') {
  const brandEl = document.querySelector('.brand-logo');
  if (brandEl) {
    brandEl.innerHTML = BRAND_LOGO_HTML;
    brandEl.style.cursor = 'pointer';
    brandEl.title = '點擊刷新頁面與影片庫';
    brandEl.setAttribute('role', 'button');
    brandEl.setAttribute('tabindex', '0');

    const triggerRefresh = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const logoImg = brandEl.querySelector('img');
      if (logoImg) logoImg.classList.add('spinning');
      // Force cache-busting page reload
      window.location.href = 'index.html?t=' + Date.now();
    };

    brandEl.onclick = triggerRefresh;
    brandEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        triggerRefresh(e);
      }
    });
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

  // Enable Android TV Remote D-Pad Navigation
  initTvRemoteNavigation();
}

/**
 * Android TV / TV Box 2D Spatial Navigation Engine
 * Uses visual 2D geometric vector alignment to determine next element on D-Pad press
 */
const TvSpatialNav = {
  SELECTOR: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"], .video-card, .tag-pill, .episode-btn, .speed-badge, .player-wrapper',

  getFocusableElements() {
    return Array.from(document.querySelectorAll(this.SELECTOR)).filter(el => {
      if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
    });
  },

  findNextElement(direction, currentEl) {
    const focusables = this.getFocusableElements();
    if (!focusables.length) return null;
    if (!currentEl || !document.body.contains(currentEl) || currentEl === document.body) {
      return focusables[0];
    }

    const curRect = currentEl.getBoundingClientRect();
    const curCenterX = curRect.left + curRect.width / 2;
    const curCenterY = curRect.top + curRect.height / 2;

    let bestElement = null;
    let minScore = Infinity;

    for (const el of focusables) {
      if (el === currentEl) continue;
      const r = el.getBoundingClientRect();
      const elCenterX = r.left + r.width / 2;
      const elCenterY = r.top + r.height / 2;

      let isValidDirection = false;
      let primaryDiff = 0;
      let secondaryDiff = 0;

      switch (direction) {
        case 'right':
          if (r.left >= curRect.left + 5 || (elCenterX > curCenterX && r.left >= curRect.left)) {
            isValidDirection = true;
            primaryDiff = Math.max(0, r.left - curRect.right);
            secondaryDiff = Math.abs(elCenterY - curCenterY);
          }
          break;
        case 'left':
          if (r.right <= curRect.right - 5 || (elCenterX < curCenterX && r.right <= curRect.right)) {
            isValidDirection = true;
            primaryDiff = Math.max(0, curRect.left - r.right);
            secondaryDiff = Math.abs(elCenterY - curCenterY);
          }
          break;
        case 'down':
          if (r.top >= curRect.top + 5 || (elCenterY > curCenterY && r.top >= curRect.top)) {
            isValidDirection = true;
            primaryDiff = Math.max(0, r.top - curRect.bottom);
            secondaryDiff = Math.abs(elCenterX - curCenterX);
          }
          break;
        case 'up':
          if (r.bottom <= curRect.bottom - 5 || (elCenterY < curCenterY && r.bottom <= curRect.bottom)) {
            isValidDirection = true;
            primaryDiff = Math.max(0, curRect.top - r.bottom);
            secondaryDiff = Math.abs(elCenterX - curCenterX);
          }
          break;
      }

      if (isValidDirection) {
        // Prioritize alignment along main travel axis, penalize lateral deviation
        const score = primaryDiff + (secondaryDiff * 2.2);
        if (score < minScore) {
          minScore = score;
          bestElement = el;
        }
      }
    }

    return bestElement;
  },

  focusElement(el) {
    if (!el) return;
    document.querySelectorAll('.tv-focused').forEach(node => node.classList.remove('tv-focused'));
    el.focus();
    el.classList.add('tv-focused');
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  },

  navigate(direction) {
    const currentEl = document.activeElement;
    const nextEl = this.findNextElement(direction, currentEl);
    if (nextEl) {
      this.focusElement(nextEl);
      return true;
    }
    return false;
  }
};

// Android TV / TV Box Environment Detector
function isTvEnvironment() {
  if (window.__isUsingTvRemote === true) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  if (ua.includes('android') && !ua.includes('mobile')) return true;
  if (/tv|box|aftt|aftm|bravia|smarttv|googletv|appletv|crkey|tizen|web0s/i.test(ua)) return true;
  return false;
}
window.isTvEnvironment = isTvEnvironment;

// Android TV / TV Box Remote Control D-pad support
function initTvRemoteNavigation() {
  document.addEventListener('focusout', (e) => {
    if (e.target && e.target.classList) {
      e.target.classList.remove('tv-focused');
    }
  });

  window.addEventListener('keydown', (e) => {
    const code = e.keyCode || e.which;
    const key = e.key;

    // Check key types across different Android TV boxes
    const isUp = key === 'ArrowUp' || code === 38 || code === 19;
    const isDown = key === 'ArrowDown' || code === 40 || code === 20;
    const isLeft = key === 'ArrowLeft' || code === 37 || code === 21;
    const isRight = key === 'ArrowRight' || code === 39 || code === 22;
    const isEnter = key === 'Enter' || code === 13 || code === 23 || code === 66;
    const isBack = key === 'Escape' || key === 'Back' || key === 'GoBack' || code === 27 || code === 4;

    // Media keys
    const isMediaPlayPause = key === 'MediaPlayPause' || code === 179 || code === 85 || code === 126 || code === 127;
    const isMediaFastForward = key === 'MediaFastForward' || code === 228 || code === 90;
    const isMediaRewind = key === 'MediaRewind' || code === 227 || code === 89;

    if (isUp || isDown || isLeft || isRight || isEnter || isBack || isMediaPlayPause || isMediaFastForward || isMediaRewind) {
      window.__isUsingTvRemote = true;
    }

    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    // Handle typing in search input
    if (isInput) {
      if (isDown) {
        activeEl.blur();
        TvSpatialNav.navigate('down');
        e.preventDefault();
        return;
      }
      if (isEnter) {
        return; // submit form
      }
      if (isBack) {
        activeEl.blur();
        e.preventDefault();
        return;
      }
      return;
    }

    // Special Video Player Hook in play.html
    if (typeof window.handleTvPlayerKey === 'function') {
      const handled = window.handleTvPlayerKey({
        isUp, isDown, isLeft, isRight, isEnter, isBack,
        isMediaPlayPause, isMediaFastForward, isMediaRewind,
        e
      });
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    // Standard D-pad Navigation
    if (isRight) {
      if (TvSpatialNav.navigate('right')) e.preventDefault();
    } else if (isLeft) {
      if (TvSpatialNav.navigate('left')) e.preventDefault();
    } else if (isDown) {
      if (TvSpatialNav.navigate('down')) e.preventDefault();
    } else if (isUp) {
      if (TvSpatialNav.navigate('up')) e.preventDefault();
    } else if (isEnter) {
      if (activeEl && typeof activeEl.click === 'function') {
        activeEl.click();
        e.preventDefault();
      }
    } else if (isBack) {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        e.preventDefault();
        return;
      }
      const path = window.location.pathname;
      if (!path.endsWith('index.html') && path !== '/' && !path.endsWith('/')) {
        window.location.href = 'index.html';
        e.preventDefault();
      }
    }
  });
}

