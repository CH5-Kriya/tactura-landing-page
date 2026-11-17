import type { CSSProperties } from "react";
import { BringToFront, Gamepad2, Layers, Stamp, Waves } from "lucide-react";
import MagicBento, { type MagicBentoItem } from "./magic-bento/MagicBento";
import "./use-cases.css";

const cases = [
  {
    title: "Relief",
    description: "Turn artwork into a raised design for 3D printing.",
    icon: Layers,
    image: "/tactura-printed-relief.webp",
    colSpan: 2,
    rowSpan: 2,
  },
  {
    title: "Stamp",
    description: "Make a raised stamp face from a logo or drawing.",
    icon: Stamp,
  },
  {
    title: "Linocut",
    description: "Preview raised and recessed areas before carving a print block.",
    icon: BringToFront,
  },
  {
    title: "Game assets",
    description: "Use a relief mesh as a starting point for props and ornaments.",
    icon: Gamepad2,
  },
  {
    title: "Texture",
    description: "Export a PNG height map to add surface detail to a material.",
    icon: Waves,
  },
];

const items: MagicBentoItem[] = cases.map(({ icon: Icon, title, description, ...layout }) => ({
  id: title,
  ...layout,
  content: (
    <>
      <Icon className="use-case-icon" size={26} strokeWidth={1.5} aria-hidden="true" />
      <div className="magic-bento__text">
        <h4 className="magic-bento__title">{title}</h4>
        <p className="magic-bento__description">{description}</p>
      </div>
    </>
  ),
}));

const colors = {
  "--mb-surface": "var(--panel)",
  "--mb-edge": "var(--line)",
  "--mb-ink": "var(--ink)",
  "--mb-muted": "var(--muted)",
  "--mb-shadow": "none",
  "--mb-highlight": "transparent",
  "--mb-glow-rgb": "var(--use-case-glow)",
} as CSSProperties;

export function UseCases() {
  return (
    <section id="use-cases" className="use-cases" aria-labelledby="use-cases-title">
      <h3 id="use-cases-title">Use cases</h3>
      <MagicBento
        items={items}
        columns={4}
        rowHeight={180}
        radius={12}
        style={colors}
        textAutoHide={false}
        intro={false}
        clickEffect={false}
      />
    </section>
  );
}
