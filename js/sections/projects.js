/**
 * projects.js — Renders the Projects list with filter + slide-in detail modal.
 */

import { projects, projectFilters } from '../../texts/projects.js';
import { scatterText, runSectionEntrance } from './animator.js';

let initialised   = false;
let activeFilter  = 'all';
let modalOpen     = false;

export function initProjects() {
  if (initialised) return;
  initialised = true;

  const panel = document.querySelector('#sec-projects .panel-inner');
  panel.innerHTML = '';

  // Heading
  const h2 = document.createElement('h2');
  h2.setAttribute('data-scatter', '');
  h2.textContent = 'Projects';
  scatterText(h2);
  panel.appendChild(h2);

  // Filter bar
  const filters = document.createElement('div');
  filters.className = 'filters';
  projectFilters.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (id === activeFilter ? ' active' : '');
    btn.dataset.filter = id;
    btn.textContent = label;
    btn.addEventListener('click', () => applyFilter(id, filters, grid));
    filters.appendChild(btn);
  });
  panel.appendChild(filters);

  // Project grid
  const grid = document.createElement('div');
  grid.className = 'project-grid';
  grid.id = 'project-grid';
  panel.appendChild(grid);

  renderCards(projects, grid);

  // Detail modal (hidden by default)
  panel.appendChild(buildModal());
}

function applyFilter(id, filtersEl, grid) {
  if (id === activeFilter) return;
  activeFilter = id;

  filtersEl.querySelectorAll('.filter').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === id);
  });

  const filtered = id === 'all'
    ? projects
    : projects.filter(p => p.filters.includes(id));

  grid.style.opacity = '0';
  setTimeout(() => {
    grid.innerHTML = '';
    renderCards(filtered, grid);
    void grid.offsetWidth;
    grid.style.opacity = '1';
    runSectionEntrance(document.getElementById('sec-projects'));
  }, 180);
}

function renderCards(list, grid) {
  grid.style.transition = 'opacity 0.18s';
  list.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-date">${project.date}</span>
        ${project.org ? `<span class="card-org">${project.org}</span>` : ''}
      </div>
      <h3 class="card-title">${project.title}</h3>
      <div class="card-tags">
        ${project.tags.slice(0, 3).map(t => `<span class="proj-tag">${t}</span>`).join('')}
        ${project.tags.length > 3 ? `<span class="proj-tag muted">+${project.tags.length - 3}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => openModal(project));
    grid.appendChild(card);
  });
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function buildModal() {
  const overlay = document.createElement('div');
  overlay.id = 'proj-modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const modal = document.createElement('div');
  modal.id = 'proj-modal';
  modal.innerHTML = `
    <button id="modal-close" aria-label="Close">✕</button>
    <div id="modal-body"></div>
  `;
  modal.querySelector('#modal-close').addEventListener('click', closeModal);

  overlay.appendChild(modal);
  return overlay;
}

function openModal(project) {
  if (modalOpen) return;
  modalOpen = true;

  const overlay = document.getElementById('proj-modal-overlay');
  const body    = document.getElementById('modal-body');

  body.innerHTML = `
    <p class="modal-date">${project.date}${project.org ? ' · ' + project.org : ''}</p>
    <h3 class="modal-title">${project.title}</h3>

    <div class="modal-tags">
      ${project.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}
    </div>

    <ul class="modal-summary">
      ${project.summary.map(s => `<li>${s}</li>`).join('')}
    </ul>

    ${project.repo
      ? `<a class="modal-repo" href="${project.repo}" target="_blank" rel="noopener">View on GitHub →</a>`
      : `<span class="modal-repo muted">Repository not yet public</span>`
    }
  `;

  overlay.classList.add('open');
  document.getElementById('proj-modal').classList.add('open');
}

function closeModal() {
  modalOpen = false;
  document.getElementById('proj-modal-overlay').classList.remove('open');
  document.getElementById('proj-modal').classList.remove('open');
}

export function enterProjects() {
  initProjects();
  runSectionEntrance(document.getElementById('sec-projects'));
}
