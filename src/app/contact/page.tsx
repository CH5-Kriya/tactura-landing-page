import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Contact Us — Tactura" };

export default function ContactPage() {
  return <main><header className="legal-header"><Link href="/"><Logo /></Link><Link className="back-link" href="/">← Back to Tactura</Link></header><article className="contact-page"><div className="eyebrow"><span className="eyebrow-dot" /> WE WOULD LOVE TO HEAR FROM YOU</div><h1>Contact <em>us.</em></h1><p className="contact-lede">Questions about Tactura, feedback on the workflow, or an idea for what we should build next? Send us a note and we’ll get back to you.</p><div className="contact-options"><a className="contact-option" href="mailto:vitorizki37@gmail.com"><span className="contact-icon"><Mail size={20} /></span><span><small>EMAIL</small><strong>vitorizki37@gmail.com</strong><p>For support, privacy questions, and general enquiries.</p></span><span className="contact-arrow">↗</span></a><div className="contact-option"><span className="contact-icon"><MessageCircle size={20} /></span><span><small>RESPONSE TIME</small><strong>Within 30 days</strong><p>We aim to reply to privacy enquiries within 30 days.</p></span></div></div><div className="contact-note"><span>CONTACT DETAILS</span><strong>Yohanes Vito Rizki</strong><p>Publisher and data controller for Tactura.</p></div></article><SiteFooter /></main>;
}
