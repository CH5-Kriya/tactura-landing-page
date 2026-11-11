"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState } from "react";

export type DemoMesh = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  aspect: number;
  rows: number;
  cols: number;
  timings: { totalMs: number };
};
const DemoCanvas = dynamic(() => import("./DemoCanvas"), {
  ssr: false,
  loading: () => <p className="relief-status" role="status">Loading the 3D preview…</p>,
});
class PreviewBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p className="relief-status" role="alert">The 3D preview did not open. Try another browser.</p>
      : this.props.children;
  }
}

export default function PhotoDemo() {
  const worker = useRef<Worker | null>(null);
  const sourceURL = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [mesh, setMesh] = useState<DemoMesh | null>(null);
  const [depth, setDepth] = useState(.72);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Choose a photo to get started.");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => {
    worker.current?.terminate();
    if (sourceURL.current) URL.revokeObjectURL(sourceURL.current);
  }, []);
  function stop() {
    worker.current?.terminate(); worker.current = null;
    setBusy(false);
  }
  function clearSource() {
    if (sourceURL.current) URL.revokeObjectURL(sourceURL.current);
    sourceURL.current = null; setSource(null);
  }
  function choose(next: File | undefined) {
    if (!next) return;
    stop(); clearSource(); setMesh(null); setError(null); setFile(null);
    if (!["image/jpeg", "image/png"].includes(next.type) || next.size === 0 || next.size > 5 * 1024 * 1024) {
      setError("Choose a JPEG or PNG up to 5 MB."); setStatus("Choose another photo."); return;
    }
    setFile(next); setStatus("Select Create relief to continue."); setDepth(.72);
  }
  function convert() {
    if (!file || busy) return;
    setError(null); setBusy(true); setStatus("Starting the demo…");
    let active: Worker;
    const fail = (message: string) => {
      stop(); setError(message); setStatus("Conversion stopped. You can try again.");
    };
    try {
      active = new Worker("/demo-assets/convert.worker.mjs", { type: "module" });
      worker.current = active;
      active.onmessage = ({ data }) => {
        if (worker.current !== active) return;
        if (data.type === "status") setStatus(data.message);
        else if (data.type === "prepared") {
          clearSource(); sourceURL.current = URL.createObjectURL(data.preview); setSource(sourceURL.current);
        } else if (data.type === "result") {
          setMesh(data); setStatus(`Ready · ${data.cols} × ${data.rows} px · ${(data.timings.totalMs / 1000).toFixed(1)} s`);
          stop();
        } else if (data.type === "error") fail(data.message);
      };
      active.onerror = () => fail("The demo did not start. Check your internet connection and try again.");
      active.postMessage({ file });
    } catch { fail("This browser cannot run the demo. Try another browser."); }
  }
  return <div className="photo-demo">
    <div className="demo-toolbar">
      <div>
        <label htmlFor="demo-photo" className="demo-file-label">Choose a photo</label>
        <input id="demo-photo" type="file" accept="image/jpeg,image/png" aria-describedby="demo-file-help"
          onChange={event => { choose(event.target.files?.[0]); }} />
        <p id="demo-file-help">Choose a JPEG or PNG up to 5 MB. The demo fits the image within 1000 × 1000 pixels.</p>
        {file && <p className="demo-filename">{file.name}</p>}
      </div>
      <button type="button" className="button button-primary" disabled={!file || busy} onClick={convert}>Create relief</button>
      {busy && <button type="button" className="button button-secondary" onClick={() => { stop(); setStatus("You stopped the demo. You can use the same photo again."); }}>Cancel</button>}
    </div>
    <div className="demo-status" role="status" aria-live="polite" aria-atomic="true">{status}</div>
    {error && <p className="demo-error" role="alert">{error}</p>}
    <div className="demo-panels" aria-busy={busy}>
      <figure>
        <div className="demo-source">
          <span className="relief-label">01 / YOUR PHOTO</span>
          {source ? <Image src={source} alt="Your photo prepared for relief conversion" fill unoptimized sizes="(max-width: 760px) 100vw, 550px" />
            : <p className="demo-placeholder">Choose a photo to see it here.</p>}
        </div>
        <figcaption>The demo uses your photo in this browser. It does not send it to a server.</figcaption>
      </figure>
      <figure>
        <div className="relief-viewer demo-viewer">
          <span className="relief-label">02 / YOUR 2.5D RELIEF</span>
          {mesh ? <PreviewBoundary key={source}><DemoCanvas mesh={mesh} depth={depth} /></PreviewBoundary>
            : <p className="demo-placeholder">{busy ? "Creating your relief…" : "Create a relief to see it here."}</p>}
        </div>
        <figcaption>Drag to rotate. Scroll or pinch to zoom.</figcaption>
      </figure>
    </div>
    <div className="demo-depth">
      <label htmlFor="demo-depth">Depth <output htmlFor="demo-depth">{Math.round(depth * 100)}%</output></label>
      <input id="demo-depth" type="range" min="0" max="100" step="1" value={Math.round(depth * 100)} disabled={!mesh}
        onChange={event => setDepth(Number(event.target.value) / 100)} aria-describedby="demo-depth-help" />
      <p id="demo-depth-help">Move the slider to change the height of the relief.</p>
    </div>
    <p className="demo-note">The demo only shows a preview. Use the iPhone or iPad app to export your relief.</p>
  </div>;
}
