import {bicubic} from './math.mjs';

export function previewMesh(height, rows, cols) {
  if (rows < 2 || cols < 2 || rows > 1000 || cols > 1000 || height.length !== rows * cols)
    throw new Error('Invalid preview dimensions');
  // shortcut: preview grid caps at 512 per edge; use the app for export-quality geometry.
  const ratio = Math.min(1, 512 / Math.max(rows, cols));
  const h = Math.max(2, Math.round(rows * ratio)), w = Math.max(2, Math.round(cols * ratio));
  const z = bicubic(height, rows, cols, h, w);
  const n = h * w, perimeter = [];
  for (let x = 0; x < w; x++) perimeter.push(x);
  for (let y = 1; y < h; y++) perimeter.push(y * w + w - 1);
  for (let x = w - 2; x >= 0; x--) perimeter.push((h - 1) * w + x);
  for (let y = h - 2; y > 0; y--) perimeter.push(y * w);
  const positions = new Float32Array((n + perimeter.length * 4) * 3);
  const normals = new Float32Array(positions.length);
  const indices = new Uint32Array((h - 1) * (w - 1) * 6 + perimeter.length * 6);
  const aspect = rows / cols;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    z[i] = Math.max(0, Math.min(1, z[i]));
    positions.set([2 * x / (w - 1) - 1, aspect * (1 - 2 * y / (h - 1)), z[i]], i * 3);
  }
  let k = 0;
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
    const a = y * w + x, b = a + 1, c = a + w, d = c + 1;
    indices.set([a, c, b, b, c, d], k); k += 6;
  }
  for (let j = 0; j < perimeter.length; j++) {
    const a = perimeter[j], b = perimeter[(j + 1) % perimeter.length], v = n + j * 4;
    positions.set(positions.subarray(a * 3, a * 3 + 3), v * 3);
    positions.set(positions.subarray(b * 3, b * 3 + 3), (v + 1) * 3);
    positions.set([positions[b * 3], positions[b * 3 + 1], 0], (v + 2) * 3);
    positions.set([positions[a * 3], positions[a * 3 + 1], 0], (v + 3) * 3);
    indices.set([v, v + 1, v + 2, v, v + 2, v + 3], k); k += 6;
  }
  // Accumulate triangle normals here so the main thread only attaches GPU buffers.
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const p of [a, b, c]) {normals[p] += nx; normals[p + 1] += ny; normals[p + 2] += nz;}
  }
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= length; normals[i + 1] /= length; normals[i + 2] /= length;
  }
  return {positions, normals, indices, aspect};
}
