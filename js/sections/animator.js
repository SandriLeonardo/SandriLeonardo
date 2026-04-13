/**
 * animator.js — Shared scatter→assemble animation engine
 *
 * Completely independent of Three.js and the background scene.
 * Works purely with CSS custom properties + keyframe animations.
 *
 * Usage:
 *   scatterText(el)         — wraps each character in a <span> with random start
 *   assembleAll(container)  — triggers all scatter-chars in container to assemble
 *   animateBar(fillEl, pct) — sweeps a health bar to target percentage
 */

const CHAR_SPREAD_X = 140;   // px max horizontal scatter
const CHAR_SPREAD_Y =  80;   // px max vertical scatter
const CHAR_SPREAD_R =  40;   // deg max rotation scatter

/**
 * Wrap every character in el in a <span class="scatter-char"> with
 * random CSS vars for the starting scattered position.
 * Must be called before assembleAll().
 */
export function scatterText(el) {
  const text = el.textContent;
  el.textContent = '';

  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'scatter-char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    const tx = (Math.random() - 0.5) * CHAR_SPREAD_X * 2;
    const ty = (Math.random() - 0.5) * CHAR_SPREAD_Y * 2;
    const tr = (Math.random() - 0.5) * CHAR_SPREAD_R * 2;
    span.style.setProperty('--tx', `${tx}px`);
    span.style.setProperty('--ty', `${ty}px`);
    span.style.setProperty('--tr', `${tr}deg`);
    el.appendChild(span);
  });
}

/**
 * Trigger assemble animation on all .scatter-char elements inside container.
 * Each character gets a staggered delay based on its index.
 * @param {Element} container
 * @param {number}  baseDelay  ms before first char starts (default 0)
 * @param {number}  step       ms between each char (default 35)
 */
export function assembleAll(container, baseDelay = 0, step = 35) {
  const chars = container.querySelectorAll('.scatter-char');
  chars.forEach((span, i) => {
    span.style.animationDelay = `${baseDelay + i * step}ms`;
    span.classList.add('assemble');
  });
}

/**
 * Animate a skill-row into view (slide in from the left).
 * @param {Element} rowEl     the .skill-row element
 * @param {number}  delay     ms animation delay
 */
export function animateRow(rowEl, delay = 0) {
  rowEl.style.animationDelay = `${delay}ms`;
  rowEl.classList.add('row-enter');
}

/**
 * Sweep a health bar fill element to a target percentage.
 * @param {Element} fillEl   the .bar-fill element
 * @param {number}  pct      target percentage 0-100
 * @param {number}  delay    ms before sweep starts
 */
export function animateBar(fillEl, pct, delay = 0) {
  fillEl.style.setProperty('--target-w', `${pct}%`);
  fillEl.style.animationDelay = `${delay}ms`;
  fillEl.classList.add('bar-sweep');
}

/**
 * Run the full enter sequence for a section:
 *   1. Assemble scatter-text headings
 *   2. Stagger skill rows in
 *   3. Sweep bars after rows appear
 *
 * Call this once when the section panel becomes visible.
 */
export function runSectionEntrance(panel) {
  // Headings
  panel.querySelectorAll('[data-scatter]').forEach((el, i) => {
    assembleAll(el, i * 120, 30);
  });

  // Rows + bars
  panel.querySelectorAll('.skill-row').forEach((row, i) => {
    const delay = 200 + i * 80;
    animateRow(row, delay);
    const fill = row.querySelector('.bar-fill');
    if (fill) {
      const pct = parseFloat(fill.dataset.pct ?? 0);
      animateBar(fill, pct, delay + 300);
    }
  });

  // Project cards
  panel.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.animationDelay = `${150 + i * 90}ms`;
    card.classList.add('card-enter');
  });
}
