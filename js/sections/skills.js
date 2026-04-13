/**
 * skills.js — Renders the Skills section with category filter + animated health bars.
 */

import { skillCategories } from '../../texts/skills.js';
import { scatterText, runSectionEntrance } from './animator.js';

let initialised  = false;
let activeFilter = 'tools';

export function initSkills() {
  if (initialised) return;
  initialised = true;

  const panel = document.querySelector('#sec-skills .panel-inner');
  panel.innerHTML = '';

  // Heading
  const h2 = document.createElement('h2');
  h2.setAttribute('data-scatter', '');
  h2.textContent = 'Skills';
  scatterText(h2);
  panel.appendChild(h2);

  // Category filter tabs
  const tabs = document.createElement('div');
  tabs.className = 'skill-tabs';
  skillCategories.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (id === activeFilter ? ' active' : '');
    btn.dataset.cat = id;
    btn.textContent = label;
    btn.addEventListener('click', () => switchCategory(id, panel));
    tabs.appendChild(btn);
  });
  panel.appendChild(tabs);

  // Content area
  const content = document.createElement('div');
  content.id = 'skill-content';
  panel.appendChild(content);

  renderCategory(activeFilter, content);
}

function switchCategory(id, panel) {
  if (id === activeFilter) return;
  activeFilter = id;

  panel.querySelectorAll('.skill-tabs .filter').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.cat === id);
  });

  const content = document.getElementById('skill-content');

  // Fade out, swap, fade in
  content.style.opacity = '0';
  content.style.transform = 'translateY(8px)';
  setTimeout(() => {
    renderCategory(id, content);
    // Reset animations so they replay
    content.querySelectorAll('.skill-row').forEach(r => r.classList.remove('row-enter'));
    content.querySelectorAll('.bar-fill').forEach(f => f.classList.remove('bar-sweep'));
    void content.offsetWidth;   // force reflow
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
    runSectionEntrance(document.getElementById('sec-skills'));
  }, 200);
}

function renderCategory(id, container) {
  container.innerHTML = '';
  const cat = skillCategories.find(c => c.id === id);
  if (!cat) return;

  container.style.transition = 'opacity 0.2s, transform 0.2s';

  if (cat.tags) {
    // Soft skills — tag cloud, no bars
    const cloud = document.createElement('div');
    cloud.className = 'tag-cloud';
    cat.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'skill-tag';
      span.textContent = tag;
      cloud.appendChild(span);
    });
    container.appendChild(cloud);
    return;
  }

  // Health bar rows
  cat.skills.forEach(({ name, level }) => {
    const row = document.createElement('div');
    row.className = 'skill-row';

    const label = document.createElement('span');
    label.className = 'skill-name';
    label.textContent = name;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.dataset.pct = level;
    // width set by animateBar; start at 0
    fill.style.width = '0%';

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    container.appendChild(row);
  });
}

export function enterSkills() {
  initSkills();
  runSectionEntrance(document.getElementById('sec-skills'));
}
