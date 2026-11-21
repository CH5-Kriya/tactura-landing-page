"use client";

import { useEffect, useState, type ReactNode } from "react";
import TiltedCard from "./tilted-card/TiltedCard";
import "./step-card.css";

export function StepCard({ children, caption }: { children: ReactNode; caption: string }) {
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setMotionEnabled(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  return (
    <TiltedCard
      className="step-tilt"
      containerHeight="auto"
      imageHeight="auto"
      imageWidth="100%"
      rotateAmplitude={motionEnabled ? 12 : 0}
      scaleOnHover={motionEnabled ? 1.05 : 1}
      glare={motionEnabled ? 0.5 : 0}
      glareColor="#ffffff"
      perspective={800}
      smoothness={0.6}
      axis="both"
      shadow={0.5}
      parallax={1}
      radius={15}
      captionText={caption}
      showTooltip={motionEnabled}
      flipOnClick
      gyroscope={false}
      intro
    >
      {children}
    </TiltedCard>
  );
}
