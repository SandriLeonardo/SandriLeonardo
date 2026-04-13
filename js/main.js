/**
 * main.js — Three.js pointcloud scene
 *
 * Loads a pre-baked pointcloud JSON ({ positions: [...], colors: [...] })
 * and renders it as a Three.js Points object with vertex colors.
 *
 * Public API (used by nav.js):
 *   scene.loadPointcloud(url)   → Promise — loads & transitions to a new pointcloud
 *   scene.resetToHome()         → transitions back to the home pointcloud
 */

import * as THREE from 'three';

// ── Constants ────────────────────────────────────────────────────────────────

const HOME_POINTCLOUD   = 'assets/pointcloud_home.bin';
const POINT_SIZE        = 0.008;    // world-space point size
const MOUSE_TILT_FACTOR = 0.25;     // how much mouse moves the scene (radians)
const COLLAPSE_DURATION = 320;      // ms for collapse phase
const EXPAND_DURATION   = 380;      // ms for expand phase

// Placeholder URLs for each section's pointcloud
// TODO: replace with real pre-baked pointcloud JSON files once section images are chosen
const SECTION_POINTCLOUDS = {
  projects: null,   // TODO: 'assets/pointcloud_projects.bin'
  skills:   null,   // TODO: 'assets/pointcloud_skills.bin'
  about:    null,   // TODO: 'assets/pointcloud_about.bin'
  resume:   null,   // TODO: 'assets/pointcloud_resume.bin'
  contact:  null,   // TODO: 'assets/pointcloud_contact.bin'
};

// ── Scene setup ──────────────────────────────────────────────────────────────

const canvas   = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);   // transparent — CSS background shows through

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
camera.position.set(0, 0, 2.8);

// ── Geometry / material ──────────────────────────────────────────────────────

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  size:         POINT_SIZE,
  vertexColors: true,
  sizeAttenuation: true,
  transparent: true,
  opacity: 1.0,
});
const points = new THREE.Points(geometry, material);
scene.add(points);

// ── Internal state ───────────────────────────────────────────────────────────

let currentPositions = new Float32Array(0);   // flat xyz array currently displayed
let targetPositions  = new Float32Array(0);   // flat xyz array we are animating toward
let homePositions    = new Float32Array(0);   // cached home pointcloud positions
let homeColors       = new Float32Array(0);   // cached home pointcloud colors

let transitionPhase  = 'idle';    // 'idle' | 'collapsing' | 'expanding'
let transitionStart  = 0;
let pendingPositions = null;      // positions waiting to expand after collapse
let pendingColors    = null;

let mouseX = 0, mouseY = 0;      // normalised -1..1
let targetRotX = 0, targetRotY = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

async function fetchPointcloud(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load pointcloud: ${url}`);
  const buf = await res.arrayBuffer();

  // Binary format: 4-byte uint32 N, then N*3 float32 positions, then N*3 float32 colors
  const n         = new DataView(buf).getUint32(0, true);   // little-endian
  const positions = new Float32Array(buf,  4,          n * 3);
  const colors    = new Float32Array(buf,  4 + n * 12, n * 3);
  return { positions, colors };
}

/** Apply new positions+colors to the geometry (no animation — instant swap) */
function applyToGeometry(pos, col) {
  geometry.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(col.slice(), 3));
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate    = true;
  currentPositions = pos.slice();
}

/** Return a flat Float32Array of all zeros the same length as pos */
function zeroPositions(pos) {
  return new Float32Array(pos.length);   // all 0 → center of scene
}

// ── Transition ───────────────────────────────────────────────────────────────

/**
 * Animate: current → collapse to 0 → swap data → expand to new positions.
 * If newPositions/newColors are null, expand back to home.
 */
function startTransition(newPositions, newColors) {
  pendingPositions = newPositions;
  pendingColors    = newColors;
  transitionPhase  = 'collapsing';
  transitionStart  = performance.now();
  targetPositions  = zeroPositions(currentPositions);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function tickTransition(now) {
  if (transitionPhase === 'idle') return;

  const posAttr = geometry.attributes.position;
  if (!posAttr) return;

  if (transitionPhase === 'collapsing') {
    const t = easeInOut(Math.min((now - transitionStart) / COLLAPSE_DURATION, 1));
    for (let i = 0; i < currentPositions.length; i++) {
      posAttr.array[i] = lerp(currentPositions[i], 0, t);
    }
    posAttr.needsUpdate = true;

    if (t >= 1) {
      // Swap data
      if (pendingPositions) {
        applyToGeometry(pendingPositions, pendingColors);
      } else {
        applyToGeometry(homePositions, homeColors);
      }
      transitionPhase = 'expanding';
      transitionStart = now;

      // Start expanding from center
      const posAttr2 = geometry.attributes.position;
      for (let i = 0; i < currentPositions.length; i++) {
        posAttr2.array[i] = 0;
      }
      posAttr2.needsUpdate = true;
    }
    return;
  }

  if (transitionPhase === 'expanding') {
    const t = easeInOut(Math.min((now - transitionStart) / EXPAND_DURATION, 1));
    const posAttr2 = geometry.attributes.position;
    for (let i = 0; i < currentPositions.length; i++) {
      posAttr2.array[i] = lerp(0, currentPositions[i], t);
    }
    posAttr2.needsUpdate = true;

    if (t >= 1) {
      transitionPhase = 'idle';
    }
  }
}

// ── Mouse interaction ─────────────────────────────────────────────────────────

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth)  * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// ── Animation loop ────────────────────────────────────────────────────────────

function animate(now) {
  requestAnimationFrame(animate);

  // Smooth mouse tilt
  targetRotY += (mouseX * MOUSE_TILT_FACTOR - targetRotY) * 0.06;
  targetRotX += (-mouseY * MOUSE_TILT_FACTOR * 0.6 - targetRotX) * 0.06;
  points.rotation.y = targetRotY;
  points.rotation.x = targetRotX;

  tickTransition(now);

  renderer.render(scene, camera);
}

// ── Initialise ────────────────────────────────────────────────────────────────

resize();
window.addEventListener('resize', resize);

fetchPointcloud(HOME_POINTCLOUD)
  .then(({ positions, colors }) => {
    homePositions = positions;
    homeColors    = colors;
    applyToGeometry(positions, colors);
    animate(0);
  })
  .catch((err) => {
    // TODO: show a visible error or fallback animation when pointcloud is missing
    console.warn('[pointcloud] Could not load home pointcloud:', err.message);
    console.warn('Run tools/precompute_pointcloud.py and place the output in assets/pointcloud_home.bin');
    animate(0);   // still start the loop so the page doesn't freeze
  });

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load a section pointcloud by section name.
 * If no pointcloud is configured for that section, keeps the current one.
 */
export async function loadSectionPointcloud(section) {
  const url = SECTION_POINTCLOUDS[section];
  if (!url) return;   // TODO: remove guard once section pointclouds are added

  try {
    const { positions, colors } = await fetchPointcloud(url);
    startTransition(positions, colors);
  } catch (e) {
    console.warn(`[pointcloud] Could not load pointcloud for "${section}":`, e.message);
  }
}

/** Transition back to the home pointcloud */
export function resetToHomePointcloud() {
  startTransition(null, null);   // null → expand to homePositions
}
