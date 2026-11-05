import { afterEach, expect, test } from "bun:test";
import { createHalftone } from "../src/lib/lumen/halftone-renderer";

let restore = () => {};
afterEach(() => restore());

function setup(available = true, compiles = true) {
  const oldRequest = globalThis.requestAnimationFrame;
  const oldCancel = globalThis.cancelAnimationFrame;
  const frames = new Map();
  let nextFrame = 0, draws = 0, freed = 0, lost = 0;
  const floats = new Map();
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, TRIANGLES: 8,
    createShader: () => ({}), shaderSource() {}, compileShader() {},
    getShaderParameter: () => compiles, getShaderInfoLog: () => "compile failed",
    createProgram: () => ({}), attachShader() {}, linkProgram() {},
    getProgramParameter: () => true, useProgram() {},
    createBuffer: () => ({}), bindBuffer() {}, bufferData() {},
    enableVertexAttribArray() {}, vertexAttribPointer() {},
    getUniformLocation: (_, name) => name,
    uniform1f: (name, value) => floats.set(name, value),
    uniform2f() {}, uniform3fv() {}, viewport() {}, isContextLost: () => false,
    drawArrays: () => draws++,
    deleteShader: () => freed++, deleteProgram: () => freed++, deleteBuffer: () => freed++,
    getExtension: () => ({loseContext: () => lost++}),
  };
  const canvas = Object.assign(new EventTarget(), {
    width: 300, height: 150,
    getContext: () => available ? gl : null,
    getBoundingClientRect: () => ({width: 2560, height: 1440}),
  });
  globalThis.requestAnimationFrame = cb => { const id = ++nextFrame; frames.set(id, cb); return id; };
  globalThis.cancelAnimationFrame = id => { frames.delete(id); };
  restore = () => {
    globalThis.requestAnimationFrame = oldRequest;
    globalThis.cancelAnimationFrame = oldCancel;
  };
  return {
    canvas: canvas,
    frames, floats, draws: () => draws, freed: () => freed, lost: () => lost,
    advance(ms) {
      const entry = frames.entries().next().value;
      if (entry) { frames.delete(entry[0]); entry[1](performance.now() + ms); }
    },
  };
}

test("preset uniforms, GPU resolution cap, pause/resume and disposal", () => {
  const h = setup();
  const renderer = createHalftone(h.canvas, () => { throw new Error("Unexpected context loss"); });
  expect(h.floats.get("u_travel")).toBe(0.15);
  expect(h.floats.get("u_seed")).toBe(9015);
  expect([h.canvas.width, h.canvas.height]).toEqual([1280, 720]);
  expect(h.frames.size).toBe(0);
  renderer.setPlaying(true);
  h.advance(1);
  expect(h.draws()).toBe(1);
  h.advance(50);
  expect(h.draws()).toBeGreaterThan(1);
  renderer.setPlaying(false);
  const pausedPhase = h.floats.get("u_phase");
  const pausedDraws = h.draws();
  h.advance(5000);
  expect(h.frames.size).toBe(0);
  expect(h.draws()).toBe(pausedDraws);
  renderer.setPlaying(true);
  h.advance(5000);
  expect(h.floats.get("u_phase") - pausedPhase).toBeLessThan(0.02);
  renderer.dispose();
  renderer.dispose();
  expect(h.frames.size).toBe(0);
  expect(h.freed()).toBe(4);
  expect(h.lost()).toBe(1);
});

test("context loss stops the loop and reports fallback", () => {
  const h = setup();
  let failures = 0;
  const renderer = createHalftone(h.canvas, () => failures++);
  renderer.setPlaying(true);
  h.canvas.dispatchEvent(new Event("webglcontextlost", {cancelable: true}));
  expect(h.frames.size).toBe(0);
  expect(failures).toBe(1);
  renderer.dispose();
});

test("unsupported WebGL and compilation failure release partial allocations", () => {
  const unsupported = setup(false);
  expect(() => createHalftone(unsupported.canvas, () => {})).toThrow("WebGL2 is unavailable");
  restore();
  const broken = setup(true, false);
  expect(() => createHalftone(broken.canvas, () => {})).toThrow("compile failed");
  expect(broken.freed()).toBe(2);
  expect(broken.lost()).toBe(1);
  expect(broken.frames.size).toBe(0);
});
