import { getImageProps } from "next/image";

export function ProjectScreenshot() {
  const alt = "Tactura showing a raised design and depth controls";

  const { props: ipad } = getImageProps({
    src: "/tactura-hero-ipad.png",
    width: 2732,
    height: 2048,
    sizes: "(max-width: 884px) calc(100vw - 64px), 820px",
    alt,
  });

  const { props: iphone } = getImageProps({
    src: "/tactura-hero-iphone.png",
    width: 1179,
    height: 2556,
    sizes: "(max-width: 405px) 74vw, 300px",
    alt,
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <picture className="project-shot">
      <source
        media="(min-width: 761px)"
        srcSet={ipad.srcSet}
        sizes={ipad.sizes}
        width={ipad.width}
        height={ipad.height}
      />
      <img {...iphone} />
    </picture>
  );
}
