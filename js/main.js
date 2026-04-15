/**
 * main.js — Three.js pointcloud scene (CPU-friendly)
 *
 * - PointsMaterial with soft circular canvas texture (no custom shader)
 * - Blue palette applied once at load time in JS (not per frame)
 * - Gentle idle breathe animation
 * - Collapse → swap → expand transition
 *
 * Public API (used by nav.js):
 *   loadSectionPointcloud(section) → Promise
 *   resetToHomePointcloud()
 */

import * as THREE from 'three';

// ── Constants ─────────────────────────────────────────────────────────────────

const HOME_POINTCLOUD   = 'assets/arm_pointcloud.bin';
const POINT_SIZE        = 0.06;     // world-space units (scene is -1..1)
const COLLAPSE_DURATION = 300;       // ms
const EXPAND_DURATION   = 380;       // ms
const BREATHE_SPEED     = 0.00008;   // radians/ms — very slow Y-axis rotation (no moiré)
const Z_SCALE           = 0.4;       // must match --z-scale in precompute script

const SECTION_POINTCLOUDS = {
  projects: 'assets/arm_pointcloud.bin',
  skills:   'assets/python_pointcloud.bin',
  about:    'assets/about_pointcloud.bin',
  resume:   'assets/resume_pointcloud.bin',
  contact:  'assets/contact_pointcloud.bin',
};

// ── Circular soft-edge point texture (canvas, no file needed) ─────────────────

function makeCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx  = canvas.getContext('2d');
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.0, 'rgba(255,255,255,1.0)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// ── Blue palette remap (runs once at load, not per frame) ─────────────────────

/**
 * Convert raw RGB + depth-encoded Z positions into a blue palette.
 * Far objects → light blue, close + dark → deep navy.
 * 70% depth influence, 30% original luminance.
 */
function remapToBlue(colors, positions) {
  const n   = colors.length / 3;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = colors[i * 3], g = colors[i * 3 + 1], b = colors[i * 3 + 2];
    const luma      = 0.299 * r + 0.587 * g + 0.114 * b;
    const depth     = positions[i * 3 + 2] / Z_SCALE;   // 0=far, 1=close
    const farFactor = 1.0 - depth;
    const intensity = Math.min(1, Math.max(0, 0.7 * farFactor + 0.3 * luma));

    // deep navy (0.05, 0.15, 0.48) → pale sky (0.62, 0.84, 1.00)
    out[i * 3]     = 0.05 + 0.57 * intensity;
    out[i * 3 + 1] = 0.15 + 0.69 * intensity;
    out[i * 3 + 2] = 0.48 + 0.52 * intensity;
  }
  return out;
}

// ── Scene setup ───────────────────────────────────────────────────────────────

const canvas   = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
renderer.setPixelRatio(1);   // force 1× pixel ratio — halves fill on HiDPI displays
renderer.setClearColor(0x000000, 0);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
camera.position.set(0, 0, 2.8);

// ── Geometry / material ───────────────────────────────────────────────────────

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  size:            POINT_SIZE,
  vertexColors:    true,
  sizeAttenuation: true,
  transparent:     true,
  alphaMap:        makeCircleTexture(),
  depthWrite:      false,
});
const pointMesh = new THREE.Points(geometry, material);
scene.add(pointMesh);

// ── Internal state ────────────────────────────────────────────────────────────

let currentPositions = new Float32Array(0);
let homePositions    = new Float32Array(0);
let homeColors       = new Float32Array(0);   // already blue-remapped

let transitionPhase  = 'idle';
let transitionStart  = 0;
let pendingPositions = null;
let pendingColors    = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

async function fetchPointcloud(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  const buf = await res.arrayBuffer();
  const n   = new DataView(buf).getUint32(0, true);
  return {
    positions: new Float32Array(buf, 4,          n * 3),
    colors:    new Float32Array(buf, 4 + n * 12, n * 3),
  };
}

function applyToGeometry(pos, col) {
  geometry.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(col.slice(), 3));
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate    = true;
  currentPositions = pos.slice();
}

// ── Transition ────────────────────────────────────────────────────────────────

export function startTransition(newPositions, newColors) {
  pendingPositions = newPositions;
  pendingColors    = newColors;
  transitionPhase  = 'collapsing';
  transitionStart  = performance.now();
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function tickTransition(now) {
  if (transitionPhase === 'idle') return;
  const pa = geometry.attributes.position;
  if (!pa) return;

  if (transitionPhase === 'collapsing') {
    const t = easeInOut(Math.min((now - transitionStart) / COLLAPSE_DURATION, 1));
    for (let i = 0; i < currentPositions.length; i++) pa.array[i] = currentPositions[i] * (1 - t);
    pa.needsUpdate = true;

    if (t >= 1) {
      applyToGeometry(pendingPositions ?? homePositions, pendingColors ?? homeColors);
      geometry.attributes.position.array.fill(0);
      geometry.attributes.position.needsUpdate = true;
      transitionPhase = 'expanding';
      transitionStart = now;
    }
    return;
  }

  if (transitionPhase === 'expanding') {
    const t = easeInOut(Math.min((now - transitionStart) / EXPAND_DURATION, 1));
    for (let i = 0; i < currentPositions.length; i++) pa.array[i] = currentPositions[i] * t;
    pa.needsUpdate = true;
    if (t >= 1) transitionPhase = 'idle';
  }
}

// ── Animation loop ────────────────────────────────────────────────────────────

function animate(now) {
  requestAnimationFrame(animate);
  pointMesh.rotation.y = Math.sin(now * BREATHE_SPEED) * 0.18;  // slow gentle rotation, no moiré
  tickTransition(now);
  renderer.render(scene, camera);
}

// ── Init ──────────────────────────────────────────────────────────────────────

resize();
window.addEventListener('resize', resize);

fetchPointcloud(HOME_POINTCLOUD)
  .then(({ positions, colors }) => {
    const blueColors  = remapToBlue(colors, positions);
    homePositions = positions;
    homeColors    = blueColors;
    applyToGeometry(positions, blueColors);
    animate(0);
  })
  .catch((err) => {
    // TODO: show a visible fallback when pointcloud file is missing
    console.warn('[pointcloud]', err.message);
    console.warn('Regenerate with: python tools/precompute_pointcloud.py --output assets/home_pointcloud.bin');
    animate(0);
  });

// ── Public API ────────────────────────────────────────────────────────────────

export async function loadSectionPointcloud(section) {
  const url = SECTION_POINTCLOUDS[section];
  if (!url) return;
  try {
    const { positions, colors } = await fetchPointcloud(url);
    startTransition(positions, remapToBlue(colors, positions));
  } catch (e) {
    console.warn(`[pointcloud] Could not load "${section}":`, e.message);
  }
}

export function resetToHomePointcloud() {
  startTransition(null, null);
}
