"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState } from "react";

const ReliefCanvas = dynamic(() => import("./ReliefCanvas"), {
  ssr: false,
  loading: () => (
    <p className="relief-status" role="status">
      Loading the 3D preview…
    </p>
  ),
});

function PreviewFallback({ message }: { message: string }) {
  return (
    <div className="relief-fallback">
      <Image
        src="/tactura-printed-relief.webp"
        alt="A person holding the 3D printed Tactura vase relief"
        fill
        sizes="(max-width: 760px) 100vw, 1160px"
      />
      <p className="relief-status" role="status">
        {message}
      </p>
    </div>
  );
}

class PreviewBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <PreviewFallback message="The 3D preview did not load. The photo shows the printed relief." />
    ) : (
      this.props.children
    );
  }
}

export function ReliefPreview({ src }: { src: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setVisible(true);
    });
    if (panel.current) observer.observe(panel.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <section
      className="relief-showcase page-grid"
      aria-labelledby="relief-title"
    >
      <div className="relief-heading">
        <div>
          <div className="section-kicker">Example made with Tactura</div>
          <h2 id="relief-title">
            From artwork to<br />a 3D print
          </h2>
        </div>
        <p>
          Drag the preview to rotate it. Scroll or pinch to zoom.
        </p>
      </div>
      <div className="relief-stages">
        <figure>
          <div className="relief-source">
            <Image
              src="/tactura-source-vase.webp"
              alt="Original 2D artwork of red and yellow flowers in a blue vase"
              fill
              sizes="(max-width: 1000px) 100vw, 390px"
            />
            <span className="relief-label">01 / Original artwork</span>
          </div>
          <figcaption className="relief-caption">
            <span>Source</span>
            <span>Image</span>
          </figcaption>
        </figure>
        <figure>
          <div
            className="relief-viewer"
            ref={panel}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setFocused(false);
            }}
          >
            <span className="relief-label">02 / 3D preview</span>
            <PreviewBoundary key={src}>
              {visible ? (
                <ReliefCanvas
                  src={src}
                  autoRotate={inView && !hovered && !focused && !reducedMotion}
                />
              ) : (
                <p className="relief-status">Scroll to load the 3D preview.</p>
              )}
            </PreviewBoundary>
          </div>
          <figcaption className="relief-caption">
            <span>Vase relief</span>
            <span>STL file</span>
          </figcaption>
        </figure>
        <figure>
          <div className="relief-print">
            <Image
              src="/tactura-printed-relief.webp"
              alt="Hands holding the physical 3D print of the Tactura vase relief"
              fill
              sizes="(max-width: 1000px) 100vw, 390px"
            />
            <span className="relief-label">03 / 3D print</span>
          </div>
          <figcaption className="relief-caption">
            <span>Printed relief</span>
            <span>Photo</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
