"use client";

import { useEffect, useRef, useState } from "react";

export function SiteBackground() {
  const video = useRef<HTMLVideoElement>(null);
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
    const element = video.current;
    if (!element) return;
    const sync = () => {
      if (paused || document.hidden) element.pause();
      else void element.play().catch(() => {
        if (!document.hidden) setPaused(true);
      });
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      element.pause();
    };
  }, [motionAllowed, paused, failed]);

  return <>
    <div className="site-background" aria-hidden="true">
      {motionAllowed && !failed && <video ref={video} muted loop playsInline preload="metadata"
        poster="/tactura-background.webp" onError={() => setFailed(true)}>
        <source src="/tactura-background.webm" type="video/webm" />
        <source src="/tactura-background.mp4" type="video/mp4" />
      </video>}
    </div>
    {motionAllowed && !failed && <button type="button" className="background-toggle"
      onClick={() => setPaused(value => !value)} aria-pressed={paused}>
      {paused ? "Play background" : "Pause background"}
    </button>}
  </>;
}
