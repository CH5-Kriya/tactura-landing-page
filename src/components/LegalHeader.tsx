import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeSelect } from "./ThemeSelect";

export function LegalHeader() {
  return (
    <header className="legal-header">
      <Link href="/"><Logo /></Link>
      <div className="header-actions">
        <ThemeSelect />
        <Link className="back-link" href="/">Back to Tactura</Link>
      </div>
    </header>
  );
}
