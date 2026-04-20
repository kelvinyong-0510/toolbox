# MIPOS ShopTech — Design System (DESIGN.md)

> **Universal design reference for all MIPOS ShopTech projects.**
> Drop this file in any project root and tell your AI coding assistant:
> _"Use DESIGN.md as the design system for all UI work."_

---

## Brand Identity

**MIPOS ShopTech** is Malaysia's Premier POS Partner — a B2B technology brand targeting F&B and retail business owners. The design language is:

- **Bold and trustworthy** — navy conveys professionalism and stability
- **Energetic and action-oriented** — orange drives urgency and CTA clicks
- **Clean and accessible** — white surfaces keep information readable
- **Malaysian-market aware** — warm tones, clear hierarchy, mobile-first

---

## Core Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--navy` | `#1B2A4A` | Primary brand, body text, headings |
| `--navy-light` | `#2a3f6e` | Hover states, gradient mid |
| `--navy-dark` | `#0f1a30` | Hero backgrounds, dark surfaces |
| `--orange` | `#FF6600` | Primary CTA, accents, highlights |
| `--orange-hover` | `#e55a00` | CTA hover state |
| `--orange-glow` | `rgba(255,102,0,0.20)` | Button shadows, focus rings |
| `--orange-light` | `rgba(255,102,0,0.10)` | Badge backgrounds, tinted fills |
| `--orange-border` | `rgba(255,102,0,0.25)` | Badge borders, active borders |
| `--peach` | `#FFF5EB` | Section backgrounds, card fills |
| `--peach-deep` | `#FFF0E0` | Hover rows, dividers on peach |
| `--white` | `#FFFFFF` | Card surfaces, main backgrounds |
| `--grey-bg` | `#F9FAFB` | Page background, input fills |
| `--grey-border` | `#E5E7EB` | Dividers, input borders |
| `--grey` | `#6B7280` | Secondary text, placeholders |
| `--grey-light` | `#9CA3AF` | Disabled text, captions |

### Semantic / Status Colours

| State | Background | Foreground |
|---|---|---|
| Success / Confirmed | `rgba(16,185,129,0.10)` | `#059669` |
| Warning / Pending | `rgba(245,158,11,0.10)` | `#D97706` |
| Danger / Cancelled | `rgba(239,68,68,0.10)` | `#DC2626` |
| Info / Neutral | `rgba(255,102,0,0.10)` | `#FF6600` |

---

## Typography

**Font Family:** `'Inter'` — always import from Google Fonts.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

```css
--font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Role | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| Display / Hero H1 | `clamp(28px, 5vw, 48px)` | `900` | `-2px` | Hero headlines |
| Section H2 | `40px` | `800` | `-1px` | Section titles |
| Card H3 | `20px` | `700` | `-0.3px` | Card headings |
| Body Large | `17px` | `400` | `0` | Lead paragraphs |
| Body | `14–15px` | `400` | `0` | General content |
| Label | `13px` | `600` | `0` | Form labels, nav items |
| Caption / Badge | `11–12px` | `600–700` | `0.06em` | Tags, small labels |
| Table Header | `11px` | `700` | `0.08em` | Table `<th>` |

### Typography Rules
- Always use `letter-spacing: -1px` to `-2px` on large headings (800–900 weight)
- Line height `1.15` for headings, `1.6–1.7` for body text
- Never use default serif or monospace for UI text
- Highlight one keyword in headings with `color: var(--orange)` for brand impact

---

## Spacing System

```css
--sp-1: 4px;    --sp-2: 8px;    --sp-3: 12px;   --sp-4: 16px;
--sp-5: 20px;   --sp-6: 24px;   --sp-8: 32px;   --sp-10: 40px;
--sp-12: 48px;  --sp-16: 64px;  --sp-20: 80px;
```

---

## Border Radius

```css
--radius-sm: 8px;   /* inputs, small buttons, tags */
--radius:    12px;  /* cards, modals, sections */
--radius-lg: 20px;  /* large cards, panels */
--radius-xl: 24px;  /* pill buttons, nav CTAs */
```

**Rule:** Pill-shaped CTAs always use `--radius-xl`. Form inputs use `--radius-sm`. Cards use `--radius` or `--radius-lg`.

---

## Shadow System

```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06);    /* subtle card lift */
--shadow:    0 4px 16px rgba(0,0,0,0.08);   /* default card */
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);  /* modals, floating elements */
--shadow-xl: 0 16px 48px rgba(0,0,0,0.16); /* hero elements, overlapping cards */
```

**Orange glow for CTAs:**
```css
box-shadow: 0 4px 16px rgba(255,102,0,0.20);   /* resting */
box-shadow: 0 8px 24px rgba(255,102,0,0.25);   /* hover */
```

---

## Transitions

```css
--trans: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

Apply to: `background`, `box-shadow`, `transform`, `border-color`, `color`, `opacity`.

**Micro-animations:**
- Cards hover: `transform: translateY(-4px)` + deeper shadow
- Buttons hover: `transform: translateY(-2px)` + glow shadow
- Active/focus inputs: `box-shadow: 0 0 0 3px var(--orange-glow)`

---

## CSS Custom Properties — Full Root Block

Paste this into every new project's root CSS file:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  /* ── Brand Palette ── */
  --navy:          #1B2A4A;
  --navy-light:    #2a3f6e;
  --navy-dark:     #0f1a30;
  --orange:        #FF6600;
  --orange-hover:  #e55a00;
  --orange-glow:   rgba(255,102,0,0.20);
  --orange-light:  rgba(255,102,0,0.10);
  --orange-border: rgba(255,102,0,0.25);
  --peach:         #FFF5EB;
  --peach-deep:    #FFF0E0;

  /* ── Neutrals ── */
  --white:         #FFFFFF;
  --grey-bg:       #F9FAFB;
  --grey-border:   #E5E7EB;
  --grey:          #6B7280;
  --grey-light:    #9CA3AF;

  /* ── Status ── */
  --success:     #059669;
  --success-bg:  rgba(16,185,129,0.10);
  --warning:     #D97706;
  --warning-bg:  rgba(245,158,11,0.10);
  --danger:      #DC2626;
  --danger-bg:   rgba(239,68,68,0.10);

  /* ── Typography ── */
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* ── Radii ── */
  --radius-sm: 8px;
  --radius:    12px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  /* ── Shadows ── */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow:    0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.16);

  /* ── Transition ── */
  --trans: 0.3s cubic-bezier(0.4,0,0.2,1);

  /* ── Spacing ── */
  --sp-1:4px;  --sp-2:8px;   --sp-3:12px;  --sp-4:16px;
  --sp-5:20px; --sp-6:24px;  --sp-8:32px;  --sp-10:40px;
  --sp-12:48px;--sp-16:64px; --sp-20:80px;
}
```

---

## Component Patterns

### 1. Hero / Header

The MIPOS hero always uses a **navy gradient background** with optional orange glow orbs.

```css
/* Hero background */
background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 60%, var(--navy-light) 100%);

/* Decorative radial glow orb (top-right) */
.hero::before {
  content: '';
  position: absolute;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,102,0,0.18) 0%, transparent 70%);
  top: -150px; right: -80px;
  pointer-events: none;
}

/* Hero heading pattern */
h1 { font-size: clamp(32px,5vw,52px); font-weight: 900; color: #fff; letter-spacing: -2px; }
h1 span { color: var(--orange); } /* highlight word */

/* Hero sub */
.hero-sub { color: rgba(255,255,255,0.65); font-size: 17px; }

/* Hero badge pill */
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,102,0,0.12); border: 1px solid rgba(255,102,0,0.3);
  color: var(--orange); padding: 7px 18px; border-radius: 30px;
  font-size: 13px; font-weight: 600;
}
```

---

### 2. Navigation Bar

```css
.navbar {
  background: transparent; /* becomes navy on scroll */
  transition: var(--trans);
}
.navbar.scrolled {
  background: rgba(27,42,74,0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

/* Logo: navy with orange accent word */
.nav-logo { font-size: 20px; font-weight: 800; color: #fff; }
.nav-logo span { color: var(--orange); }

/* Links */
.nav-links a { color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 500; }
.nav-links a:hover { color: #fff; }

/* Orange underline on hover */
.nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
  height: 2px; background: var(--orange); width: 0; transition: var(--trans);
}
.nav-links a:hover::after { width: 100%; }

/* CTA button */
.nav-cta {
  background: var(--orange); color: #fff;
  padding: 10px 24px; border-radius: var(--radius-xl);
  font-weight: 600;
}
.nav-cta:hover { background: var(--orange-hover); box-shadow: 0 4px 16px var(--orange-glow); }
```

---

### 3. Buttons

```css
/* Primary — orange CTA (most important action on page) */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--orange); color: #fff;
  padding: 14px 32px; border-radius: var(--radius-xl);
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
  transition: var(--trans);
  box-shadow: 0 4px 16px var(--orange-glow);
}
.btn-primary:hover {
  background: var(--orange-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--orange-glow);
}

/* Secondary — outlined, white (on dark backgrounds) */
.btn-secondary {
  background: transparent; color: #fff;
  padding: 14px 32px; border-radius: var(--radius-xl);
  border: 2px solid rgba(255,255,255,0.3); font-size: 15px; font-weight: 600;
  cursor: pointer; transition: var(--trans);
}
.btn-secondary:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

/* Ghost — on white/light surfaces */
.btn-ghost {
  background: transparent; color: var(--navy);
  padding: 10px 20px; border-radius: var(--radius-xl);
  border: 1.5px solid var(--grey-border); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: var(--trans);
}
.btn-ghost:hover { border-color: var(--orange); color: var(--orange); }
```

---

### 4. Cards

```css
/* Standard card */
.card {
  background: var(--white); border-radius: var(--radius-lg);
  padding: 28px 24px; box-shadow: var(--shadow);
  border: 1px solid var(--grey-border);
  transition: var(--trans);
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

/* Orange top-border accent card */
.card-accent {
  position: relative; overflow: hidden;
}
.card-accent::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 3px; background: linear-gradient(90deg, var(--orange), #ff8533);
  opacity: 0; transition: var(--trans);
}
.card-accent:hover::before { opacity: 1; }

/* Stat card */
.stat-card {
  background: var(--white); border-radius: var(--radius);
  padding: 20px 22px; border: 1px solid var(--grey-border);
  box-shadow: var(--shadow-sm);
}
.stat-card .stat-num { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
.stat-card .stat-label { font-size: 11px; font-weight: 600; color: var(--grey); text-transform: uppercase; letter-spacing: 0.07em; }
```

---

### 5. Badges / Pills / Tags

```css
/* Section badge (above headings) */
.section-badge {
  display: inline-block; background: var(--orange-light);
  color: var(--orange); padding: 6px 18px; border-radius: 30px;
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
}

/* Service / category tag */
.tag {
  display: inline-block; font-size: 11px; font-weight: 600;
  color: var(--navy); background: var(--grey-bg);
  border: 1px solid var(--grey-border);
  padding: 3px 10px; border-radius: 20px;
}

/* Status badge with dot indicator */
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
}
.badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.confirmed::before { background: var(--success); }
.badge.pending   { background: var(--warning-bg);  color: var(--warning); }
.badge.pending::before   { background: var(--warning); }
.badge.cancelled { background: var(--danger-bg);   color: var(--danger); }
.badge.cancelled::before { background: var(--danger); }
```

---

### 6. Form Inputs

```css
/* Base input */
input, select, textarea {
  width: 100%;
  background: var(--grey-bg); border: 1.5px solid var(--grey-border);
  border-radius: var(--radius-sm); color: var(--navy);
  font-family: var(--font); font-size: 14px;
  padding: 11px 14px; outline: none;
  transition: border-color var(--trans), box-shadow var(--trans);
}
input:focus, select:focus, textarea:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 3px var(--orange-glow);
  background: var(--white);
}

/* Error state */
input.invalid {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 3px var(--danger-bg) !important;
}

/* Label */
label { font-size: 13px; font-weight: 600; color: var(--navy); }
label .req   { color: var(--orange); margin-left: 2px; }
label .opt   { color: var(--grey-light); font-size: 11px; font-weight: 400; }

/* Custom select wrapper (hides native arrow) */
.select-wrapper { position: relative; }
.select-wrapper::after {
  content: ''; position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%);
  border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 5px solid var(--grey); pointer-events: none;
}
.select-wrapper select { padding-right: 36px; appearance: none; -webkit-appearance: none; }
```

---

### 7. Tables (Admin / Data Density)

```css
/* Table container */
.data-table-wrap {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1px solid var(--grey-border); box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* Table header — navy bar */
table thead { background: var(--navy); }
table th {
  padding: 13px 18px; text-align: left;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.08em;
}

/* Table body */
table td {
  padding: 14px 18px; border-bottom: 1px solid var(--grey-border);
  font-size: 13px; color: var(--navy);
}
table tbody tr:hover td { background: var(--peach); }
table tr:last-child td  { border-bottom: none; }

/* Time / accent pill in tables */
.time-pill {
  display: inline-flex; align-items: center;
  font-size: 12px; font-weight: 700; color: var(--orange);
  background: var(--orange-light); border: 1px solid var(--orange-border);
  padding: 4px 10px; border-radius: 20px;
}
```

---

### 8. Sidebar (Admin / Dashboard)

```css
.sidebar {
  background: linear-gradient(180deg, var(--navy-dark) 0%, #152038 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
}

/* Logo block */
.sidebar-logo-icon {
  width: 36px; height: 36px; background: var(--orange);
  border-radius: var(--radius-sm); font-weight: 900; color: #fff;
  box-shadow: 0 4px 12px var(--orange-glow);
}

/* Nav items */
.nav-item {
  color: rgba(255,255,255,0.65); border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500;
}
.nav-item:hover  { background: rgba(255,255,255,0.07); color: #fff; }
.nav-item.active {
  background: var(--orange-light);
  border: 1px solid var(--orange-border);
  color: var(--orange);
}

/* Section labels */
.sidebar-section-label {
  font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3);
  text-transform: uppercase; letter-spacing: 0.1em;
}
```

---

### 9. Modals / Overlays

```css
/* Backdrop */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,26,48,0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500;
}

/* Modal card */
.modal {
  background: var(--white); border-radius: var(--radius-lg);
  padding: 36px 40px; width: min(440px, 90vw);
  box-shadow: var(--shadow-lg); border: 1px solid var(--grey-border);
}
.modal-title { font-size: 18px; font-weight: 800; color: var(--navy); letter-spacing: -0.4px; }
.modal-sub   { font-size: 13px; color: var(--grey); line-height: 1.6; }
```

---

### 10. Section Alternation Pattern

MIPOS pages alternate section backgrounds to create visual rhythm:

| Section | Background | Heading colour |
|---|---|---|
| Odd / default | `var(--white)` | `var(--navy)` |
| Even / highlight | `var(--peach)` | `var(--navy)` |
| Dark / CTA | Navy gradient | `#FFFFFF` |

---

## Logo Usage Rules

```
MIPOS ShopTech
```

- **"MIPOS"** — white (`#FFFFFF`) text, weight `800`
- **"ShopTech"** — orange (`#FF6600`) text, weight `800`
- Always on navy background; never on white backgrounds without adjustment
- Logo icon: square with rounded corners (`border-radius: 8px`), solid orange fill, white letter "M", weight `900`

---

## Voice & Tone (Copy Guidelines)

| Context | Tone | Example |
|---|---|---|
| Hero headline | Bold, confident | _"Powering Malaysia's F&B Future."_ |
| Section header | Clear, benefit-led | _"Everything You Need, In One System."_ |
| CTA button | Action verb + arrow | _"Explore Packages →"_, _"Confirm Appointment →"_ |
| Error message | Friendly, direct | _"We're closed on weekends. Please pick a weekday."_ |
| Success message | Warm, reassuring | _"Appointment confirmed! We look forward to seeing you."_ |
| Badge / tag | Uppercase or title case | _"★ POPULAR"_, _"Consultation"_ |

---

## Animation Tokens

```css
/* Float — for hero decoration orbs */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%       { transform: translateY(-24px) rotate(4deg); }
}

/* Fade in up — staggered section reveals */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade in right — image / visual reveals */
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(36px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Toast slide in */
@keyframes slideInToast {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 1024px) { /* sidebar collapses or becomes overlay */ }

/* Landscape mobile */
@media (max-width: 768px)  { /* 2-col grids become 1-col */ }

/* Portrait mobile */
@media (max-width: 480px)  { /* full-width cards, stacked CTAs */ }
```

---

## Project Examples Built with This Design System

| Project | URL | Design Elements Used |
|---|---|---|
| MIPOS ShopTech website | `feedme-pos.mipos.me` | Hero, sections, package configurator, nav |
| Appointment Booking System | `localhost:3000` | Form card, hero, footer |
| Admin Dashboard | `localhost:3000/admin` | Sidebar, data table, stat cards, modals |

---

## How to Use with AI Coding Agents

Place this file as `DESIGN.md` in your project root, then prompt:

```
Use DESIGN.md as the design system for all UI work.
Match the exact colour tokens, typography scale, component patterns,
and voice guidelines defined in DESIGN.md.
Do not invent new colours or design patterns — stay strictly within the system.
```

---

*MIPOS ShopTech Design System · Version 1.0 · April 2026*
*Maintained by MIPOS ShopTech Sdn Bhd*
