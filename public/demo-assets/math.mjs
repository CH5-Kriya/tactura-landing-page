// Same align_corners=false bicubic kernel as ReliefNumerics/sfs.cpp.
export function bicubic(src, h, w, oh, ow) {
  const weights = t => {
    const a = -0.75, u = 1 - t;
    const outer = x => ((a * (x + 1) - 5 * a) * (x + 1) + 8 * a) * (x + 1) - 4 * a;
    const inner = x => ((a + 2) * x - (a + 3)) * x * x + 1;
    return [outer(t), inner(t), inner(u), outer(u)];
  };
  const xs = Array.from({length: ow}, (_, x) => {
    const p = (x + 0.5) * w / ow - 0.5, b = Math.floor(p);
    return {i: [b - 1, b, b + 1, b + 2].map(i => Math.max(0, Math.min(w - 1, i))), a: weights(p - b)};
  });
  const out = new Float32Array(oh * ow);
  for (let y = 0; y < oh; y++) {
    const p = (y + 0.5) * h / oh - 0.5, b = Math.floor(p), a = weights(p - b);
    for (let x = 0; x < ow; x++) {
      let v = 0;
      for (let j = 0; j < 4; j++) {
        let row = 0;
        for (let k = 0; k < 4; k++) row += xs[x].a[k] * src[Math.max(0, Math.min(h - 1, b - 1 + j)) * w + xs[x].i[k]];
        v += a[j] * row;
      }
      out[y * ow + x] = v;
    }
  }
  return out;
}

export function normalize(src) {
  let lo = Infinity, hi = -Infinity;
  for (const v of src) {
    if (!Number.isFinite(v)) throw new Error('Nonfinite model output');
    lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  return Float32Array.from(src, v => hi - lo < 1e-12 ? 0 : Math.max(0, Math.min(1, (v - lo) / (hi - lo))));
}
