import preset from "../../../public/tactura-background-preset.json";
import { fragmentSource, vertexSource } from "./halftone-shaders";

export function createHalftone(canvas: HTMLCanvasElement, onFailure: () => void) {
  const gl = canvas.getContext("webgl2", {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL2 is unavailable");

  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let frame = 0, playing = false, disposed = false;
  let elapsed = 0, lastTick = 0, lastDraw = 0;
  const interval = 1000 / preset.renderer.maxFps;

  function dispose() {
    if (disposed) return;
    disposed = true;
    playing = false;
    cancelAnimationFrame(frame);
    canvas.removeEventListener("webglcontextlost", lost);
    if (buffer) gl!.deleteBuffer(buffer);
    if (program) gl!.deleteProgram(program);
    for (const shader of shaders) gl!.deleteShader(shader);
    gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }
  function lost(event: Event) {
    event.preventDefault();
    setPlaying(false);
    onFailure();
  }
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Shader allocation failed");
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(shader) || "Shader compilation failed");
    return shader;
  }
  try {
    program = gl.createProgram();
    if (!program) throw new Error("Program allocation failed");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) || "Shader linking failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Vertex allocation failed");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const [key, value] of Object.entries({...preset.parameters, seed: preset.seed, travel: preset.travel}))
      gl.uniform1f(gl.getUniformLocation(program, `u_${key}`), value);
    for (const [i, hex] of Object.values(preset.colors).entries()) {
      const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);
      gl.uniform3fv(gl.getUniformLocation(program, ["u_c1", "u_c2", "u_c3", "u_c4", "u_bg"][i]), rgb);
    }
    canvas.addEventListener("webglcontextlost", lost);
  } catch (error) { dispose(); throw error; }

  const phase = gl.getUniformLocation(program, "u_phase");
  const resolution = gl.getUniformLocation(program, "u_res");
  function draw() {
    gl!.uniform1f(phase, (elapsed / (preset.loopSeconds * 1000)) % 1);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  function resize() {
    if (disposed || gl!.isContextLost()) return;
    const {width, height} = canvas.getBoundingClientRect();
    // Decorative background: cap GPU work independently of screen DPR.
    const scale = Math.min(1, preset.renderer.maxEdge / Math.max(width, height, 1));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(resolution, canvas.width, canvas.height);
    draw();
  }
  function tick(now: number) {
    if (!playing || disposed) return;
    if (now - lastDraw >= interval) {
      elapsed += Math.min(now - lastTick, 100);
      lastTick = now;
      lastDraw = now - ((now - lastDraw) % interval);
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function setPlaying(value: boolean) {
    if (disposed || value === playing) return;
    playing = value;
    cancelAnimationFrame(frame);
    if (playing) {
      lastTick = lastDraw = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  resize();
  return { setPlaying, resize, dispose };
}
