"use client";

import { useEffect, useState } from "react";
import { galleryEvents } from "@/lib/gallery";
import dynamic from "next/dynamic";
import "./gallery.css";

const AccordionGallery = dynamic(() => import("./accordion-gallery/AccordionGallery"));

export function Gallery() {
  const [vertical, setVertical] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 640px)");
    const sync = () => setVertical(narrow.matches);
    sync();
    narrow.addEventListener("change", sync);
    return () => narrow.removeEventListener("change", sync);
  }, []);

  return (
    <section id="gallery" className="gallery section" aria-labelledby="gallery-title">
      <div className="section-heading gallery-heading">
        <h2 id="gallery-title">Gallery</h2>
        <p>Events and collaborations with the Tactura community.</p>
      </div>
      {galleryEvents.map((event) => (
        <section className="gallery-event" key={event.id} aria-labelledby={`gallery-${event.id}`}>
          <h3 id={`gallery-${event.id}`}>{event.title}</h3>
          <AccordionGallery
            items={event.photos.map(({ image, title, alt }) => ({
              image,
              label: title,
              alt,
            }))}
            defaultIndex={0}
            height={480}
            radius={12}
            accentColor="var(--action-fill)"
            overlayColor="#0c0d0d"
            textColor="#f4f4f1"
            grayscale={false}
            tilt={0}
            parallax={0}
            duration={0.35}
            orientation={vertical ? "vertical" : "horizontal"}
          />
        </section>
      ))}
    </section>
  );
}
