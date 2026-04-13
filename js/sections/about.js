/**
 * about.js — Renders the About section from texts/about.js data.
 */

import { aboutData } from '../../texts/about.js';
import { scatterText, runSectionEntrance } from './animator.js';

let initialised = false;

export function initAbout() {
  if (initialised) return;
  initialised = true;

  const panel = document.querySelector('#sec-about .panel-inner');
  panel.innerHTML = '';

  // Heading
  const h2 = document.createElement('h2');
  h2.setAttribute('data-scatter', '');
  h2.textContent = 'About';
  scatterText(h2);
  panel.appendChild(h2);

  // Tagline
  const tagline = document.createElement('p');
  tagline.className = 'about-tagline';
  tagline.setAttribute('data-scatter', '');
  tagline.textContent = aboutData.tagline;
  scatterText(tagline);
  panel.appendChild(tagline);

  // Bio paragraphs
  const bioEl = document.createElement('div');
  bioEl.className = 'about-bio';
  aboutData.bio.forEach((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    bioEl.appendChild(p);
  });
  panel.appendChild(bioEl);

  // Facts row
  const factsEl = document.createElement('div');
  factsEl.className = 'about-facts';
  aboutData.facts.forEach(({ label, value }) => {
    const item = document.createElement('div');
    item.className = 'fact-item';
    item.innerHTML = `<span class="fact-label">${label}</span><span class="fact-value">${value}</span>`;
    factsEl.appendChild(item);
  });
  panel.appendChild(factsEl);
}

export function enterAbout() {
  initAbout();
  runSectionEntrance(document.getElementById('sec-about'));
}
