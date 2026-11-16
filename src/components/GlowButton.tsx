import Link from "next/link";

export function GlowButton({
  children,
  href = "#how-it-works",
  secondary = false,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button ${secondary ? "button-secondary" : "button-primary"} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
