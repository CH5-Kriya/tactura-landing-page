import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <nav className="footer-links" aria-label="Footer">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <nav className="footer-links" aria-label="Social media">
        <a href="https://web.facebook.com/profile.php?id=61596438989329">Facebook</a>
        <a href="https://www.instagram.com/tactura.app/">Instagram</a>
        <a href="https://www.tiktok.com/@tactura.app">TikTok</a>
      </nav>
      <span className="copyright">© 2026 Tactura</span>
    </footer>
  );
}
