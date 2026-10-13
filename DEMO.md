# Browser demo

`/demo` is a local-only preview: JPEG/PNG up to 5 MiB and 40 megapixels, resized without cropping or general upscaling to a maximum working frame of 1000×1000. Transparent images are composited over white. No accounts, server conversion, project persistence, or export. The page requires a secure context (HTTPS or localhost), module workers, OffscreenCanvas, WebGL2, and WebGPU with shader-f16. An unsupported GPU gets an actionable error; there is no CPU fallback.

The worker owns image decode/orientation, preparation, model preprocessing and inference, floating-point depth resize/normalization, the Tactura relief WASM engine, mesh indices and normals. The main thread receives a resized PNG and transferred mesh buffers. A preview grid caps at 512 per edge to keep interaction light; the relief field still processes at up to 1000 per edge. Depth changes scale Z from 4–40 mm at a reference width of 200 mm (app defaults); the fixed 3 mm backing does not scale. Slider movement never reruns inference. Three.js uses demand rendering and DPR up to 1.5.

Every conversion has its own worker. Cancel, replacement photo, errors, completion and unmount terminate it; image URLs and Three.js buffers are disposed. The model is disposed after inference before the relief engine runs. Browser model caching is enabled. Clearing browser site data removes this cache. Photo bytes are not stored in it.

## Pinned assets and rebuilding

Assets are self-hosted in `public/demo-assets`; processing files load only after pressing Create my relief. About 75 MB total on first use (including the 49,642,442-byte model); localhost timings exclude real internet transfer. Keep these files in deployment output. This is a browser computation cost plus static download bandwidth, with no inference server.

- Depth Anything V2 Small FP16 ONNX, `onnx-community/depth-anything-v2-small`, revision `34f40a4`. Model SHA256: `2df6223f206b5164e21f664ace61dabeb9bb6a49b8b5a3e00510b4807d0f5b04`.
- Transformers.js 3.8.1 `dist/transformers.web.js`, renamed to `runtime/transformers.mjs`. Only its two bare `onnxruntime-common`/`onnxruntime-web` imports are changed to `./ort.mjs`, both resolving to the same Tensor implementation.
- ONNX Runtime Web `1.22.0-dev.20250409-89f8206ba4`, `dist/ort.webgpu.bundle.min.mjs` renamed to `runtime/ort.mjs`. The matching `ort-wasm-simd-threaded.jsep.mjs` and `.wasm` come from Transformers.js 3.8.1/dist. WASM threads are 1, so cross-origin isolation headers are not needed. WASM paths explicitly point to same-origin assets.
- `wasm/relief.mjs`/`relief.wasm` are copied unchanged from the validated Tactura `experiments/browser-depth/assets/wasm` build. `wasm/build.json` pins OpenCV and Emscripten versions. Rebuild in the app repository with `experiments/browser-depth/build-wasm.py`; pipeline bridge is `wasm/relief.cpp`, and numerical sources remain in ReliefKit. SHA256 of relief.wasm: `af3351184b06febd3196758fd9f5ce06fe0d3d48fdcb5cb8c791423a4fc197f3`.
- Apache 2.0 model/Transformers/OpenCV and MIT ONNX Runtime license files are included beside assets. Upstream docs: https://huggingface.co/docs/transformers.js/v3.8.1/en/guides/webgpu and https://github.com/DepthAnything/Depth-Anything-V2.

The model uses 518×392 stretched input matching the app benchmark, rather than default square/aspect-preserving preprocessing. The worker reuses the validated floating-point bicubic kernel (-0.75, align_corners=false) and full default relief pipeline. Rendering materials and the capped preview mesh are browser-specific. This does not establish visual parity for arbitrary uploads or every device.

## Validation

```
bun run build
bun test tests/relief-preview.test.js
node tests/demo-mesh.test.mjs
bun run start -- --hostname 127.0.0.1 --port 3100
```

With Playwright available, set `PLAYWRIGHT_MODULE` to its installed module (or leave unset if resolvable), and `TACTURA_SAMPLE_DIR` to the app repository's `experiments/browser-depth/assets`. Then:

```
node tests/demo-browser.cjs
```

`DEMO_URL` overrides localhost:3100. `DEMO_QA_OUTPUT` defaults to `/tmp/tactura-demo` for screenshots and JSON. The browser check covers the landing link and deferred loading; invalid/oversized files; corrupt input; real JPEG/PNG uploads; downscaling 2100×2100 to 1000×1000; finite geometry; changing the rendered depth without another worker; rotate/reset; repeat conversion; cancel/retry; mobile layout; a single depth slider; no POST/upload requests; a simulated unavailable WebGPU; and WebGL context loss.

Local Chrome 154 on Apple M5, production build, October 12 2026: initial hero conversion 3.13 s, cats 1.76 s, tiger 4.65 s, repeat cats 1.74 s. Main-thread 16 ms heartbeat maximum gaps during the first three flows were 64/29/26 ms (includes renderer startup; not frame-rate guarantees). Model and WASM were served over localhost. Runtime emitted provider-assignment warnings but no application errors. The only third-party requests observed were the website's existing Google Fonts. Mobile checks emulate a 390×844 viewport on the same desktop GPU; Safari, physical phones/tablets, slow internet and production deployment have not been tested.
