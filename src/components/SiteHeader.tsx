import Link from "next/link";
import { appStoreUrl } from "@/lib/app-store";
import { Logo } from "./Logo";
import { GlowButton } from "./GlowButton";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/">
        <Logo />
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#privacy">Privacy</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/demo">Try demo</Link>
      </nav>
      <GlowButton href={appStoreUrl}>Get Tactura on the App Store</GlowButton>
    </header>
  );
}
