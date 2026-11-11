import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Contact Us — Tactura" };

export default function ContactPage() {
  return (
    <main>
      <header className="legal-header">
        <Link href="/">
          <Logo />
        </Link>
        <Link className="back-link" href="/">
          Back to Tactura
        </Link>
      </header>
      <article className="contact-page">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> Tactura support
        </div>
        <h1>
          Contact <em>us.</em>
        </h1>
        <p className="contact-lede">
          Email us for help with Tactura, privacy questions, or feedback.
        </p>
        <div className="contact-options">
          <a className="contact-option" href="mailto:contact@tactura.app">
            <span className="contact-icon">
              <Mail size={20} />
            </span>
            <span>
              <small>EMAIL</small>
              <strong>contact@tactura.app</strong>
              <p>Send an email to the Tactura team.</p>
            </span>
          </a>
          <div className="contact-option">
            <span className="contact-icon">
              <MessageCircle size={20} />
            </span>
            <span>
              <small>RESPONSE TIME</small>
              <strong>Within 30 days</strong>
              <p>We aim to answer privacy questions within 30 days.</p>
            </span>
          </div>
        </div>
        <div className="contact-note">
          <span>CONTACT DETAILS</span>
          <strong>Kriya Team</strong>
          <p>Publisher and data controller for Tactura.</p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
