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
  loading: () => <p className="relief-status" role="status">Opening your relief…</p>,
});
class PreviewBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p className="relief-status" role="alert">3D preview could not start. Try a supported browser or another photo.</p>
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
    setFile(next); setStatus("Your photo is ready to convert."); setDepth(.72);
  }
  function convert() {
    if (!file || busy) return;
    setError(null); setBusy(true); setStatus("Starting local conversion…");
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
      active.onerror = () => fail("The conversion worker could not start. Check your connection and try again in a supported browser.");
      active.postMessage({ file });
    } catch { fail("Local conversion is unavailable in this browser."); }
  }
  return <div className="photo-demo">
    <div className="demo-toolbar">
      <div>
        <label htmlFor="demo-photo" className="demo-file-label">Upload your photo</label>
        <input id="demo-photo" type="file" accept="image/jpeg,image/png" aria-describedby="demo-file-help"
          onChange={event => { choose(event.target.files?.[0]); }} />
        <p id="demo-file-help">JPEG or PNG · up to 5 MB. Images fit within 1000 × 1000 px.</p>
        {file && <p className="demo-filename">{file.name}</p>}
      </div>
      <button type="button" className="button button-primary" disabled={!file || busy} onClick={convert}>Create my relief <span aria-hidden="true">↗</span></button>
      {busy && <button type="button" className="button button-secondary" onClick={() => { stop(); setStatus("Conversion cancelled. Your photo stays selected."); }}>Cancel</button>}
    </div>
    <div className="demo-status" role="status" aria-live="polite" aria-atomic="true">{status}</div>
    {error && <p className="demo-error" role="alert">{error}</p>}
    <div className="demo-panels" aria-busy={busy}>
      <figure>
        <div className="demo-source">
          <span className="relief-label">01 / YOUR PHOTO</span>
          {source ? <Image src={source} alt="Your photo prepared for relief conversion" fill unoptimized sizes="(max-width: 760px) 100vw, 550px" />
            : <p className="demo-placeholder">Your photo starts here.</p>}
        </div>
        <figcaption>Only processed in your browser. Your photo is never sent to a server.</figcaption>
      </figure>
      <figure>
        <div className="relief-viewer demo-viewer">
          <span className="relief-label">02 / YOUR 2.5D RELIEF</span>
          {mesh ? <PreviewBoundary key={source}><DemoCanvas mesh={mesh} depth={depth} /></PreviewBoundary>
            : <p className="demo-placeholder">{busy ? "Finding a new dimension…" : "A little depth changes everything."}</p>}
        </div>
        <figcaption>Drag to rotate. Scroll or pinch to zoom.</figcaption>
      </figure>
    </div>
    <div className="demo-depth">
      <label htmlFor="demo-depth">Depth <output htmlFor="demo-depth">{Math.round(depth * 100)}%</output></label>
      <input id="demo-depth" type="range" min="0" max="100" step="1" value={Math.round(depth * 100)} disabled={!mesh}
        onChange={event => setDepth(Number(event.target.value) / 100)} aria-describedby="demo-depth-help" />
      <p id="demo-depth-help">Slide to bring the surface forward.</p>
    </div>
    <p className="demo-note">Preview only. For full refinement and export, use Tactura on iPad.</p>
  </div>;
}
