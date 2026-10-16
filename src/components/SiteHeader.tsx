import Link from "next/link";
import { Logo } from "./Logo";
import { GlowButton } from "./GlowButton";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/">
        <Logo />
      </Link>
      <nav>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#privacy">Privacy</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/demo">Try demo</Link>
      </nav>
      <GlowButton href="https://testflight.apple.com/join/ZC24AgVg">Get Tactura</GlowButton>
    </header>
  );
}
