import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function LegalHeader() {
  return (
    <header className="legal-header">
      <Link href="/"><Logo /></Link>
      <div className="header-actions">
        <ThemeToggle />
        <Link className="back-link" href="/">Back to Tactura</Link>
      </div>
    </header>
  );
}
