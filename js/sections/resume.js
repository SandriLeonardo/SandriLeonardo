import { scatterText, runSectionEntrance } from './animator.js';

let initialised = false;

const DOCS = [
  { id: 'cv',        label: 'CV',                     src: 'assets/cv.pdf' },
  { id: 'rec-nardi', label: 'Recommendation — Nardi', src: 'assets/recommendation_nardi.pdf' },
];

export function initResume() {
  if (initialised) return;
  initialised = true;

  const panel = document.querySelector('#sec-resume .panel-inner');
  panel.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.setAttribute('data-scatter', '');
  h2.textContent = 'Resume';
  scatterText(h2);
  panel.appendChild(h2);

  const tabBar = document.createElement('div');
  tabBar.className = 'resume-tabs';
  panel.appendChild(tabBar);

  const frameWrap = document.createElement('div');
  frameWrap.className = 'resume-frame-wrap';
  panel.appendChild(frameWrap);

  const frames = {};
  DOCS.forEach(({ id, src, label }) => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = label;
    iframe.className = 'cv-frame';
    iframe.style.display = 'none';
    frameWrap.appendChild(iframe);
    frames[id] = iframe;
  });

  DOCS.forEach(({ id, label }, i) => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (i === 0 ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(frames).forEach(f => { f.style.display = 'none'; });
      frames[id].style.display = 'block';
    });
    tabBar.appendChild(btn);
  });

  frames[DOCS[0].id].style.display = 'block';
}

export function enterResume() {
  initResume();
  runSectionEntrance(document.getElementById('sec-resume'));
}
