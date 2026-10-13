import Image from "next/image";

export function ProjectScreenshot() {
  return (
    <div
      className="project-shot"
      role="img"
      aria-label="Tactura project showing a 3D relief ready to export"
    >
      <Image
        src="/tactura-project.png"
        alt="Tactura project showing a floral 3D relief and STL export panel"
        fill
        priority
        sizes="(max-width: 760px) 100vw, 55vw"
      />
    </div>
  );
}
