import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import PhotoDemo from "@/components/PhotoDemo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Try Tactura — Your photo in 2.5D",
  description: "Try a private browser preview: bring your own photo, explore a 2.5D relief, and adjust its depth. No account or export.",
};

export default function Demo() {
  return <main>
    <header className="legal-header"><Link href="/"><Logo /></Link><Link className="back-link" href="/">← Back to Tactura</Link></header>
    <section className="demo-page">
      <div className="section-kicker">A LITTLE TACTURA, IN YOUR BROWSER</div>
      <h1>Your photo.<br /><em>A new dimension.</em></h1>
      <p className="demo-lede">Bring an image, explore its relief, and find the depth that feels right.</p>
      <p className="demo-requirements">Requires WebGPU with FP16 support. First use downloads about 75 MB of model and processing files. Your photo stays on this device.</p>
      <PhotoDemo />
      <Link className="text-link" href="/#download">Discover the full iPad app ↗</Link>
    </section>
    <SiteFooter />
  </main>;
}
