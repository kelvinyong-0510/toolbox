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
//  FETCH TOOLS FROM API
// ─────────────────────────────────────────────
async function loadTools() {
  try {
    const res = await fetch('/api/tools.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    TOOLS = await res.json();
  } catch (e) {
    console.error('Failed to load tools:', e);
    TOOLS = [];
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
