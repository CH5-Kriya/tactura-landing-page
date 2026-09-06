import Link from "next/link";

export function GlowButton({ children, href = "#how-it-works", secondary = false }: { children: React.ReactNode; href?: string; secondary?: boolean }) {
  return <Link href={href} className={secondary ? "button button-secondary" : "button button-primary"}>{children}<span aria-hidden="true">↗</span></Link>;
}
