/**
 * MIPOS ToolBox — app.js
 * Tool registry, search/filter, card rendering
 */

// ─────────────────────────────────────────────
//  TOOLS DATA REGISTRY
//  Add new tools here — no HTML changes needed
// ─────────────────────────────────────────────
const TOOLS = [
  {
    id: 'printer-ip-config',
    name: 'Printer IP Config',
    version: 'v1.15 (Latest)',
    icon: '🖨️',
    iconBg: 'linear-gradient(135deg, #1B2A4A, #2a3f6e)',
    category: 'android',
    categoryLabel: 'Android · Network',
    isNew: true,
    description:
      'Set static IP addresses on thermal printers via USB OTG — no PC required. Supports Xprinter, HPRT, Rongta, Epson & more. Plug-and-play, works fully offline.',
    features: ['USB OTG', 'Wi-Fi Mode', 'Multi-Brand', 'Offline'],
    platform: 'android',
    downloadLabel: '⬇ Download APK',
    downloadUrl: '/downloads/MIPOS-PrinterIPConfig-latest.apk',
    docsUrl:
      'https://github.com/kelvinyong-0510/toolbox/blob/main/README.md',
    docsLabel: 'Docs',
  },
  // ── TEMPLATE — duplicate & fill to add more tools ──
  // {
  //   id: 'tool-id',
  //   name: 'Tool Name',
  //   version: 'v1.0',
  //   icon: '🔧',
  //   iconBg: 'linear-gradient(135deg, #1B2A4A, #2a3f6e)',
  //   category: 'utilities',   // android | network | utilities | web
  //   categoryLabel: 'Utilities',
  //   isNew: false,
  //   description: 'Short description.',
  //   features: ['Feature 1', 'Feature 2'],
  //   downloadLabel: '→ Launch Tool',
  //   downloadUrl: 'https://your-tool-url.com',
  //   docsUrl: '#',
  //   docsLabel: 'Docs',
  // },
];

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
let activeCategory = 'all';
let searchQuery    = '';
let searchTimer    = null;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function getFilteredTools() {
  return TOOLS.filter((t) => {
    const matchCat =
      activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.features.some((f) => f.toLowerCase().includes(q)) ||
      t.categoryLabel.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function countByCategory(cat) {
  if (cat === 'all') return TOOLS.length;
  return TOOLS.filter((t) => t.category === cat).length;
}

// ─────────────────────────────────────────────
//  RENDER FUNCTIONS
// ─────────────────────────────────────────────
function renderCategoryChips() {
  const container = document.getElementById('categoryChips');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat) => {
    const count = countByCategory(cat.id);
    if (count === 0 && cat.id !== 'all') return ''; // hide empty cats
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

  // Attach click handlers
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

  // Update count label
  if (count) {
    count.textContent = `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.add('visible');
    return;
  }
  if (empty) empty.classList.remove('visible');

  grid.innerHTML = filtered
    .map((tool, i) => renderCard(tool, i))
    .join('');
}

function renderCard(tool, index) {
  const newBadge = tool.isNew
    ? `<span class="badge-new">New</span>`
    : '';

  const features = tool.features
    .map((f) => `<span class="tag">${escapeHTML(f)}</span>`)
    .join('');

  return `
    <article class="tool-card" id="tool-${escapeHTML(tool.id)}">
      <div class="card-top">
        <div class="tool-icon" style="background:${tool.iconBg};" aria-hidden="true">
          ${tool.icon}
        </div>
        <div class="tool-meta">
          <div class="tool-name" title="${escapeHTML(tool.name)}">${escapeHTML(tool.name)}</div>
          <div class="tool-badges">
            <span class="badge-v">${escapeHTML(tool.version)}</span>
            <span class="badge-cat">${escapeHTML(tool.categoryLabel)}</span>
            ${newBadge}
          </div>
        </div>
      </div>

      <div class="card-body">
        <p class="tool-desc">${escapeHTML(tool.description)}</p>
        <div class="tool-tags">${features}</div>
      </div>

      <div class="card-footer">
        <a
          href="${escapeHTML(tool.downloadUrl)}"
          class="btn-dl"
          id="btn-download-${escapeHTML(tool.id)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download or launch ${escapeHTML(tool.name)}"
        >
          ${escapeHTML(tool.downloadLabel)}
        </a>
        <a
          href="${escapeHTML(tool.docsUrl)}"
          class="btn-docs"
          id="btn-docs-${escapeHTML(tool.id)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View docs for ${escapeHTML(tool.name)}"
        >
          📄 ${escapeHTML(tool.docsLabel)}
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
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run immediately

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('open')
      );
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
//  HERO STATS (dynamic counts)
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
  updateHeroStats();
  renderCategoryChips();
  renderTools();
});
