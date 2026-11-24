"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { createHalftone } from "@/lib/lumen/halftone-renderer";

export function SiteBackground({ contained = false }: { contained?: boolean }) {
  const pathname = usePathname();
  const visible = contained || pathname !== "/";
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
    if (!visible || !motionAllowed || failed || !element) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    const root = document.documentElement;
    const currentTheme = () => root.dataset.theme === "light" ? "light" : "dark";
    const sync = () => renderer.current?.setPlaying(!document.hidden);
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
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", sync);
      observer?.disconnect();
      themeObserver?.disconnect();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [motionAllowed, failed, visible]);

  if (!visible) return null;

  return (
    <div className="site-background" data-contained={contained || undefined} aria-hidden="true">
      <div className="site-background-art">
        {motionAllowed && !failed && <canvas ref={canvas} />}
      </div>
    </div>
  );
}
