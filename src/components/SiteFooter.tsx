import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <div className="footer-links">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <span className="copyright">© 2026 Tactura. Made for makers.</span>
    </footer>
  );
}
