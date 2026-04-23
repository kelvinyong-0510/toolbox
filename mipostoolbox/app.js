/**
 * MIPOS ToolBox — app.js
 * Fetches tools from Cloudflare API, renders search/filter/cards
 */

// ─────────────────────────────────────────────
//  CATEGORY FILTER CONFIG
// ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All Tools',  icon: '🧰' },
  { id: 'android',   label: 'Android',    icon: '🤖' },
  { id: 'network',   label: 'Network',    icon: '🌐' },
  { id: 'utilities', label: 'Utilities',  icon: '🔧' },
  { id: 'web',       label: 'Web',        icon: '💻' },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let TOOLS          = [];
let activeCategory = 'all';
let searchQuery    = '';
let searchTimer    = null;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function getFilteredTools() {
  return TOOLS.filter((t) => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (t.name || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.features || []).some((f) => f.toLowerCase().includes(q)) ||
      (t.category_label || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function countByCategory(cat) {
  if (cat === 'all') return TOOLS.length;
  return TOOLS.filter((t) => t.category === cat).length;
}

// ─────────────────────────────────────────────
//  FALLBACK TOOLS (shown if API is unavailable)
// ─────────────────────────────────────────────
const FALLBACK_TOOLS = [
  {
    id: 1, name: 'Printer IP Config', version: 'v1.22',
    icon_emoji: '🖨️', icon_bg: 'linear-gradient(135deg,#1B2A4A,#2a3f6e)',
    category: 'android', category_label: 'Android · Network', is_new: true,
    description: 'Set static IP addresses on thermal printers via USB OTG — no PC required. Supports POSMAC, Zywell, Rongta. Plug-and-play, works fully offline.',
    features: ['USB OTG', 'Wi-Fi Mode', 'Multi-Brand', 'Offline'],
    download_label: '⬇ Download APK', download_url: '/downloads/mipos-printer-ip-config-v1.22.apk',
    versions: [
      { version: 'v1.22', label: 'Latest', downloadUrl: '/downloads/mipos-printer-ip-config-v1.22.apk' },
      { version: 'v1.21', label: 'Buggy — Avoid', downloadUrl: '/downloads/mipos-printer-ip-config-v1.21.apk' },
      { version: 'v1.19', label: 'Previous', downloadUrl: '/downloads/mipos-printer-ip-config-v1.19.apk' },
      { version: 'v1.18', label: 'Stable', downloadUrl: '/downloads/mipos-printer-ip-config-v1.18.apk' },
    ],
    docs_url: 'https://github.com/kelvinyong-0510/toolbox/blob/main/README.md', docs_label: 'Docs',
  },
  {
    id: 2, name: 'LED Board Size Finder', version: 'v1.7',
    icon_emoji: '📏', icon_bg: 'linear-gradient(135deg,#FF6A00,#EE0979)',
    category: 'utilities', category_label: 'Chrome Extension · Utilities', is_new: true,
    description: 'Quickly find LED poster and display sizes. Real-time synced directly via Cloudflare API. Copy sizes with one click.',
    features: ['Real-time Cloud Sync', 'Chrome Extension', 'Size Search'],
    download_label: '⬇ Download .zip', download_url: '/downloads/mipos-led-finder-v1.7.zip',
    versions: [], docs_url: '#', docs_label: 'Docs',
  },
  {
    id: 3, name: 'MIPOS Tutorial & Driver Plugin', version: 'v1.1',
    icon_emoji: '📚', icon_bg: 'linear-gradient(135deg,#43C6AC,#191654)',
    category: 'utilities', category_label: 'Chrome Extension · Support', is_new: true,
    description: 'Quickly search and find unlisted tutorial videos, drivers, and files by SKU. Real-time synced directly via Cloudflare API.',
    features: ['Centralized Knowledge', 'Chrome Extension', 'Real-time Cloud Sync'],
    download_label: '⬇ Download .zip', download_url: '/downloads/mipos-tutorial-plugin-v1.1.zip',
    versions: [], docs_url: '#', docs_label: 'Docs',
  },
];

// ─────────────────────────────────────────────
//  FETCH TOOLS FROM API
// ─────────────────────────────────────────────
async function loadTools() {
  try {
    const res = await fetch('/api/tools.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    TOOLS = Array.isArray(data) && data.length > 0 ? data : FALLBACK_TOOLS;
  } catch (e) {
    console.warn('API unavailable, using fallback tools:', e.message);
    TOOLS = FALLBACK_TOOLS;
  }
  renderCategoryChips();
  renderTools();
  updateHeroStats();
}

// ─────────────────────────────────────────────
//  RENDER FUNCTIONS
// ─────────────────────────────────────────────
function renderCategoryChips() {
  const container = document.getElementById('categoryChips');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat) => {
    const count = countByCategory(cat.id);
    if (count === 0 && cat.id !== 'all') return '';
    return `
      <button
        class="chip ${activeCategory === cat.id ? 'active' : ''}"
        data-cat="${escapeHTML(cat.id)}"
        id="chip-${escapeHTML(cat.id)}"
        aria-pressed="${activeCategory === cat.id}"
      >
        <span>${cat.icon} ${escapeHTML(cat.label)}</span>
        <span class="chip-count">${count}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategoryChips();
      renderTools();
    });
  });
}

function renderTools() {
  const grid  = document.getElementById('toolsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('toolCount');
  if (!grid) return;

  const filtered = getFilteredTools();

  if (count) {
    count.textContent = `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.add('visible');
    return;
  }
  if (empty) empty.classList.remove('visible');

  grid.innerHTML = filtered.map((tool, i) => renderCard(tool, i)).join('');
}

function renderCard(tool, index) {
  const newBadge = tool.is_new ? `<span class="badge-new">New</span>` : '';
  const features = (tool.features || [])
    .map((f) => `<span class="tag">${escapeHTML(f)}</span>`)
    .join('');

  let downloadSection = '';
  if (tool.versions && tool.versions.length > 0) {
    const options = tool.versions.map(u =>
      `<option value="${escapeHTML(u.downloadUrl)}">${escapeHTML(u.version)} (${escapeHTML(u.label)})</option>`
    ).join('');
    downloadSection = `
      <div class="download-group">
        <select class="version-select" onchange="document.getElementById('btn-download-${tool.id}').href = this.value" aria-label="Select version">
          ${options}
        </select>
        <a href="${escapeHTML(tool.versions[0].downloadUrl)}" class="btn-dl" id="btn-download-${tool.id}" target="_blank" rel="noopener noreferrer">
          ${escapeHTML(tool.download_label)}
        </a>
      </div>
    `;
  } else {
    downloadSection = `
      <a href="${escapeHTML(tool.download_url || '#')}" class="btn-dl" id="btn-download-${tool.id}" target="_blank" rel="noopener noreferrer" style="flex:1;justify-content:center;">
        ${escapeHTML(tool.download_label)}
      </a>
    `;
  }

  return `
    <article class="tool-card" id="tool-${tool.id}">
      <div class="card-top">
        <div class="tool-icon" style="background:${escapeHTML(tool.icon_bg)};" aria-hidden="true">
          ${escapeHTML(tool.icon_emoji)}
        </div>
        <div class="tool-meta">
          <div class="tool-name" title="${escapeHTML(tool.name)}">${escapeHTML(tool.name)}</div>
          <div class="tool-badges">
            <span class="badge-v">${escapeHTML(tool.version || '')}</span>
            <span class="badge-cat">${escapeHTML(tool.category_label || '')}</span>
            ${newBadge}
          </div>
        </div>
      </div>

      <div class="card-body">
        <p class="tool-desc">${escapeHTML(tool.description || '')}</p>
        <div class="tool-tags">${features}</div>
      </div>

      <div class="card-footer">
        ${downloadSection}
        <a href="${escapeHTML(tool.docs_url || '#')}" class="btn-docs" id="btn-docs-${tool.id}" target="_blank" rel="noopener noreferrer">
          📄 ${escapeHTML(tool.docs_label || 'Docs')}
        </a>
      </div>
    </article>
  `;
}

// ─────────────────────────────────────────────
//  NAVBAR SCROLL EFFECT
// ─────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => { navbar.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }
}

// ─────────────────────────────────────────────
//  SEARCH
// ─────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      renderTools();
    }, 200);
  });
}

// ─────────────────────────────────────────────
//  HERO STATS
// ─────────────────────────────────────────────
function updateHeroStats() {
  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = TOOLS.length;
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  loadTools();
});
