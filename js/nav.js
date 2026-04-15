/**
 * nav.js — Crown dots ↔ menu bar navigation
 *
 * Home state:   5 dots arranged in a circle around the canvas center.
 *               Hovering a dot highlights it and dims the others.
 *               Clicking a dot opens the corresponding section.
 *
 * Section state: dots fly up and become items in the top menu bar.
 *                A home button (already in the menu bar HTML) collapses back.
 *                Sub-filters appear for sections that need them (e.g. Projects).
 */

import { loadSectionPointcloud, resetToHomePointcloud } from './main.js';
import { enterAbout }    from './sections/about.js';
import { enterSkills }   from './sections/skills.js';
import { enterProjects } from './sections/projects.js';
import { enterContact }  from './sections/contact.js';

const SECTION_ENTER = {
  about:    enterAbout,
  skills:   enterSkills,
  projects: enterProjects,
  contact:  enterContact,
  // resume: no JS init needed — PDF iframe is static HTML
};

// ── Config ────────────────────────────────────────────────────────────────────

const SECTIONS = ['projects', 'skills', 'about', 'resume', 'contact'];

// Responsive crown radius: capped at 330px on desktop,
// scales down on smaller screens to keep dots visible.
function getCrownRadius() {
  return Math.min(330, Math.min(window.innerWidth, window.innerHeight) * 0.38);
}

// Sub-filter definitions per section
// Projects sub-filters are handled inside js/sections/projects.js — no duplication here
const SUB_FILTERS = {};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const crown      = document.getElementById('crown');
const menuBar    = document.getElementById('menu-bar');
const menuItems  = document.getElementById('menu-items');
const btnHome    = document.getElementById('btn-home');
const content    = document.getElementById('content');
const dots       = Array.from(document.querySelectorAll('.crown-dot'));

// ── Position crown dots in a circle ──────────────────────────────────────────

function placeCrownDots() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const count = dots.length;

  // Start at top (-90°) and distribute evenly, but spread only in the bottom
  // arc so dots don't overlap the menu bar area.
  // We spread 240° centred on the bottom (so from -30° to -150° going the long way).
  const startAngle = Math.PI / 2 + Math.PI / 6;   // 120° (bottom-left)
  const sweep      = (2 * Math.PI * 2) / 3;        // 240°

  const r = getCrownRadius();
  dots.forEach((dot, i) => {
    const angle = startAngle + (i / (count - 1)) * sweep;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
  });
}

placeCrownDots();
window.addEventListener('resize', placeCrownDots);

// ── Hover: highlight / dim ────────────────────────────────────────────────────

dots.forEach((dot) => {
  dot.addEventListener('mouseenter', () => {
    if (dot.classList.contains('in-menu')) return;
    dots.forEach(d => d.classList.toggle('dimmed', d !== dot));
    dot.classList.add('highlighted');
  });

  dot.addEventListener('mouseleave', () => {
    if (dot.classList.contains('in-menu')) return;
    dots.forEach(d => {
      d.classList.remove('dimmed');
      d.classList.remove('highlighted');
    });
  });
});

// ── State ─────────────────────────────────────────────────────────────────────

let currentSection = null;

// ── Open a section ────────────────────────────────────────────────────────────

function openSection(section) {
  if (currentSection === section) return;
  currentSection = section;

  // 1. Mark dots as "in-menu" so CSS transitions them to pill shape
  dots.forEach((dot) => {
    dot.classList.remove('highlighted', 'dimmed');
    dot.classList.add('in-menu');
    dot.classList.toggle('active-section', dot.dataset.section === section);
  });

  // 2. Move dots into the menu bar items container
  menuItems.innerHTML = '';
  dots.forEach((dot) => {
    // Reset absolute positioning so they flow in the flex bar
    dot.style.left = '';
    dot.style.top  = '';
    dot.style.transform = '';
    menuItems.appendChild(dot);
  });

  // 3. Show sub-filters if applicable
  renderSubFilters(section);

  // 4. Reveal menu bar
  menuBar.classList.add('visible');
  menuBar.removeAttribute('aria-hidden');

  // 5. Show section content
  showPanel(section);

  // 6. Call section-specific init/enter (lazy — only runs on first open)
  SECTION_ENTER[section]?.();

  // 7. Swap pointcloud
  loadSectionPointcloud(section);

  document.body.classList.add('section-open');
  content.classList.add('visible');
  content.removeAttribute('aria-hidden');
}

// ── Close / go home ───────────────────────────────────────────────────────────

function goHome() {
  if (!currentSection) return;
  currentSection = null;

  // 1. Remove dots from menu bar back into crown
  dots.forEach((dot) => {
    dot.classList.remove('in-menu', 'active-section', 'highlighted', 'dimmed');
    crown.appendChild(dot);
  });

  // 2. Re-position dots in circle (with a tiny delay so the DOM reflow
  //    happens before CSS transitions kick in)
  requestAnimationFrame(() => {
    placeCrownDots();
  });

  // 3. Hide menu bar
  menuBar.classList.remove('visible');
  menuBar.setAttribute('aria-hidden', 'true');

  // 4. Clear sub-filters
  const sf = document.getElementById('sub-filters');
  if (sf) sf.remove();

  // 5. Hide section content
  hideAllPanels();
  document.body.classList.remove('section-open');
  content.classList.remove('visible');
  content.setAttribute('aria-hidden', 'true');

  // 6. Revert pointcloud to home
  resetToHomePointcloud();
}

// ── Click handlers ────────────────────────────────────────────────────────────

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const section = dot.dataset.section;
    if (dot.classList.contains('in-menu')) {
      // Already in menu: switch section without closing
      switchSection(section);
    } else {
      openSection(section);
    }
  });
});

btnHome.addEventListener('click', goHome);

// ── Switch section (menu bar dot click) ──────────────────────────────────────

function switchSection(section) {
  if (currentSection === section) return;
  currentSection = section;

  dots.forEach((dot) => {
    dot.classList.toggle('active-section', dot.dataset.section === section);
  });

  renderSubFilters(section);
  showPanel(section);
  SECTION_ENTER[section]?.();
  loadSectionPointcloud(section);
}

// ── Panel show/hide ───────────────────────────────────────────────────────────

function hideAllPanels() {
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.remove('shown');
    // Wait for transition then hide from layout
    p.addEventListener('transitionend', () => {
      if (!p.classList.contains('shown')) p.classList.remove('active');
    }, { once: true });
  });
}

function showPanel(section) {
  hideAllPanels();
  const panel = document.getElementById(`sec-${section}`);
  if (!panel) return;
  panel.classList.add('active');
  // Force reflow so transition fires
  void panel.offsetWidth;
  panel.classList.add('shown');
}

// ── Sub-filters ───────────────────────────────────────────────────────────────

function renderSubFilters(section) {
  // Remove existing sub-filters
  const existing = document.getElementById('sub-filters');
  if (existing) existing.remove();

  const filters = SUB_FILTERS[section];
  if (!filters) return;

  const bar = document.createElement('div');
  bar.id = 'sub-filters';

  filters.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (i === 0 ? ' active' : '');
    btn.textContent = label;
    btn.dataset.filter = label.toLowerCase().replace(/\s+/g, '-');
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    bar.appendChild(btn);
  });

  menuBar.appendChild(bar);
}
