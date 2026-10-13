import Image from "next/image";

export function Logo() {
  return (
    <div className="brand">
      <Image
        className="brand-mark"
        src="/tactura-icon.png"
        alt=""
        width={22}
        height={22}
        priority
      />
      <span>Tactura</span>
    </div>
  );
}
