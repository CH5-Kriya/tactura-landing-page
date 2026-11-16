"use client";

import { useEffect, useRef, useState } from "react";
import type { createHalftone } from "@/lib/lumen/halftone-renderer";

export function SiteBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createHalftone> | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!motionAllowed || failed || !element) return;
    let cancelled = false;
    let stopMotion: number | undefined;
    let motionFinished = false;
    let observer: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    const root = document.documentElement;
    const currentTheme = () => root.dataset.theme === "light" ? "light" : "dark";
    const sync = () => renderer.current?.setPlaying(!motionFinished && !document.hidden);
    void import("@/lib/lumen/halftone-renderer").then(({ createHalftone }) => {
      if (cancelled) return;
      renderer.current = createHalftone(element, () => {
        if (!cancelled) setFailed(true);
      }, currentTheme());
      themeObserver = new MutationObserver(() => renderer.current?.setTheme(currentTheme()));
      themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      observer = new ResizeObserver(() => renderer.current?.resize());
      observer.observe(element);
      document.addEventListener("visibilitychange", sync);
      sync();
      stopMotion = window.setTimeout(() => {
        motionFinished = true;
        sync();
      }, 4000);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      window.clearTimeout(stopMotion);
      document.removeEventListener("visibilitychange", sync);
      observer?.disconnect();
      themeObserver?.disconnect();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [motionAllowed, failed]);

  return (
    <div className="site-background" aria-hidden="true">
      {motionAllowed && !failed && <canvas ref={canvas} />}
    </div>
  );
}
