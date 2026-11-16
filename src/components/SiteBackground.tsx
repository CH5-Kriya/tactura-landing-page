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
    let motionUntil = 0;
    let observer: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    const root = document.documentElement;
    const currentTheme = (): "light" | "dark" => root.dataset.theme === "light" ? "light" : "dark";
    const sync = () => renderer.current?.setPlaying(
      performance.now() < motionUntil && !document.hidden,
    );
    const animate = () => {
      window.clearTimeout(stopMotion);
      motionUntil = performance.now() + 4000;
      sync();
      stopMotion = window.setTimeout(() => renderer.current?.setPlaying(false), 4000);
    };
    void import("@/lib/lumen/halftone-renderer").then(({ createHalftone }) => {
      if (cancelled) return;
      let theme = currentTheme();
      renderer.current = createHalftone(element, () => {
        if (!cancelled) setFailed(true);
      }, theme);
      themeObserver = new MutationObserver(() => {
        const nextTheme = currentTheme();
        if (nextTheme === theme) return;
        theme = nextTheme;
        renderer.current?.setTheme(theme);
        animate();
      });
      themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      observer = new ResizeObserver(() => renderer.current?.resize());
      observer.observe(element);
      document.addEventListener("visibilitychange", sync);
      animate();
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
      <div className="site-background-art">
        {motionAllowed && !failed && <canvas ref={canvas} />}
      </div>
    </div>
  );
}
