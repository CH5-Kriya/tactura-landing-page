import Link from "next/link";
import { appStoreUrl } from "@/lib/app-store";
import { Logo } from "./Logo";
import { ThemeSelect } from "./ThemeSelect";

function MainNavigation({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="Main navigation">
      <Link href="/#how-it-works">How it works</Link>
      <Link href="/#privacy">Privacy</Link>
      <Link href="/#faq">FAQ</Link>
      <Link href="/demo">Try demo</Link>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/">
        <Logo />
      </Link>
      <MainNavigation className="desktop-nav" />
      <div className="header-actions">
        <ThemeSelect />
        <Link href={appStoreUrl} className="button button-primary store-button" aria-label="Get Tactura on the App Store">
          Get Tactura<span className="store-label-detail">&nbsp;on the App Store</span>
        </Link>
      </div>
      <MainNavigation className="mobile-nav" />
    </header>
  );
}
