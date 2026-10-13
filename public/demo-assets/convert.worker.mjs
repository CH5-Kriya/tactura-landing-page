import {pipeline, RawImage, env} from './runtime/transformers.mjs';
import createRelief from './wasm/relief.mjs';
import {bicubic, normalize} from './math.mjs';
import {previewMesh} from './mesh.mjs';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = new URL('./models/', import.meta.url).href;
env.backends.onnx.wasm.wasmPaths = new URL('./runtime/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;
let busy = false;
let ready;
const status = message => self.postMessage({type: 'status', message});

self.onmessage = async ({data: {file}}) => {
  if (busy) return;
  busy = true;
  let estimator, bitmap, module;
  const pointers = [], timings = {}, start = performance.now();
  try {
    if (!(file instanceof Blob) || file.size === 0 || file.size > 5 * 1024 * 1024)
      throw new Error('Choose a JPEG or PNG up to 5 MB.');
    const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const jpeg = signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
    const png = signature.join(',') === '137,80,78,71,13,10,26,10';
    if (!jpeg && !png) throw new Error('Choose a valid JPEG or PNG photo.');
    const adapter = await self.navigator.gpu?.requestAdapter();
    if (!adapter?.features.has('shader-f16'))
      throw new Error('This demo needs WebGPU with FP16 support. Try a recent Chrome or Edge on a supported device.');
    status('Preparing your photo…');
    try {bitmap = await createImageBitmap(file, {imageOrientation: 'from-image'});}
    catch {throw new Error('This photo could not be read. Try another JPEG or PNG.');}
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('Choose a photo under 40 megapixels.');
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const cols = Math.max(2, Math.round(bitmap.width * scale)), rows = Math.max(2, Math.round(bitmap.height * scale));
    if (bitmap.width < 2 || bitmap.height < 2) throw new Error('Choose a photo at least 2 pixels on each side.');
    const canvas = new OffscreenCanvas(cols, rows);
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    if (!ctx) throw new Error('Photo preparation is unavailable in this browser.');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cols, rows); ctx.drawImage(bitmap, 0, 0, cols, rows);
    bitmap.close(); bitmap = null;
    const rgba = ctx.getImageData(0, 0, cols, rows).data;
    const bytes = new Uint8ClampedArray(rows * cols * 3), rgb = new Float32Array(bytes.length);
    for (let i = 0; i < rows * cols; i++) for (let c = 0; c < 3; c++) {
      bytes[i * 3 + c] = rgba[i * 4 + c]; rgb[i * 3 + c] = bytes[i * 3 + c] / 255;
    }
    const preview = await canvas.convertToBlob({type: 'image/png'});
    self.postMessage({type: 'prepared', preview, rows, cols});
    timings.prepareMs = performance.now() - start;
    status('Loading depth model · first use downloads about 50 MB…');
    const load = performance.now();
    estimator = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small', {
      device: 'webgpu', dtype: 'fp16', revision: '34f40a4',
      progress_callback: event => {
        if (event.status === 'progress' && event.file?.endsWith('.onnx'))
          status(`Loading depth model · ${Math.round(event.progress)}%`);
      },
    });
    timings.modelLoadMs = performance.now() - load;
    estimator.processor.image_processor.size = {width: 518, height: 392};
    estimator.processor.image_processor.config.keep_aspect_ratio = false;
    status('Estimating depth…');
    const infer = performance.now();
    const inputs = await estimator.processor(new RawImage(bytes, cols, rows, 3));
    if (inputs.pixel_values.dims.join(',') !== '1,3,392,518') throw new Error('Unexpected model input shape.');
    const {predicted_depth} = await estimator.model(inputs);
    const [h, w] = predicted_depth.dims.slice(-2);
    const depth = normalize(bicubic(predicted_depth.data, h, w, rows, cols));
    timings.depthMs = performance.now() - infer;
    await estimator.dispose(); estimator = null;
    status('Sculpting your relief…');
    ready ??= createRelief().then(m => {
      if (m._relief_opencv_selftest() !== 0) throw new Error('Relief engine could not start.');
      return m;
    });
    module = await ready;
    const n = rows * cols;
    const allocate = size => {
      const p = module._malloc(size);
      if (!p) throw new Error('Not enough memory to process this photo.');
      pointers.push(p); return p;
    };
    const r = allocate(n * 12), d = allocate(n * 4), c = allocate(n * 4), z = allocate(n * 4), info = allocate(80);
    const sculpt = performance.now();
    module.HEAPF32.set(rgb, r / 4); module.HEAPF32.set(depth, d / 4);
    const code = module._tactura_relief(r, d, rows, cols, c, z, info);
    if (code !== 0) throw new Error(`Relief processing failed (${code}). Try another photo.`);
    const height = module.HEAPF32.slice(z / 4, z / 4 + n);
    if (!height.every(v => Number.isFinite(v) && v >= 0 && v <= 1)) throw new Error('Invalid relief output.');
    timings.reliefMs = performance.now() - sculpt;
    status('Preparing 2.5D preview…');
    const meshStart = performance.now(), mesh = previewMesh(height, rows, cols);
    timings.meshMs = performance.now() - meshStart;
    timings.totalMs = performance.now() - start;
    self.postMessage({type: 'result', ...mesh, rows, cols, timings},
      [mesh.positions.buffer, mesh.normals.buffer, mesh.indices.buffer]);
  } catch (error) {
    self.postMessage({type: 'error', message: error instanceof Error ? error.message : 'Conversion failed. Try another photo.'});
  } finally {
    bitmap?.close();
    for (const p of pointers) module._free(p);
    await estimator?.dispose();
    busy = false;
  }
};
