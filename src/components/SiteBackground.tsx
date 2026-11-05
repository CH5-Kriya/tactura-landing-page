"use client";

import { useEffect, useRef, useState } from "react";
import type { createHalftone } from "@/lib/lumen/halftone-renderer";

export function SiteBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createHalftone> | null>(null);
  const pausedRef = useRef(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    renderer.current?.setPlaying(!paused && !document.hidden);
  }, [paused]);

  useEffect(() => {
    const element = canvas.current;
    if (!motionAllowed || failed || !element) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const sync = () => renderer.current?.setPlaying(!pausedRef.current && !document.hidden);
    void import("@/lib/lumen/halftone-renderer").then(({ createHalftone }) => {
      if (cancelled) return;
      renderer.current = createHalftone(element, () => {
        if (!cancelled) setFailed(true);
      });
      observer = new ResizeObserver(() => renderer.current?.resize());
      observer.observe(element);
      document.addEventListener("visibilitychange", sync);
      sync();
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", sync);
      observer?.disconnect();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [motionAllowed, failed]);

  return <>
    <div className="site-background" aria-hidden="true">
      {motionAllowed && !failed && <canvas ref={canvas} />}
    </div>
    {motionAllowed && !failed && <button type="button" className="background-toggle"
      onClick={() => setPaused(value => !value)} aria-pressed={paused}>
      {paused ? "Play background" : "Pause background"}
    </button>}
  </>;
}
