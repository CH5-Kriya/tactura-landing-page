import { ArrowDown, Camera, Cpu, Download, Layers3, LockKeyhole, Sparkles } from "lucide-react";
import { GlowButton } from "@/components/GlowButton";
import { BlurText } from "@/components/BlurText";
import { ReliefVisual } from "@/components/ReliefVisual";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  { icon: Camera, number: "01", title: "Bring your image", body: "Capture a sketch, import a photo, or start with the artwork already in your library." },
  { icon: Sparkles, number: "02", title: "Let depth emerge", body: "Tactura reads the image on your iPad and turns visual cues into a sculptable depth map." },
  { icon: Download, number: "03", title: "Make it tangible", body: "Refine the result, preview the relief, then export a printable model when it feels right." },
];

export default function Home() {
  return <main>
    <SiteHeader />
    <section className="hero page-grid">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> BUILT FOR IPAD · MADE FOR MAKERS</div><BlurText text="Turn flat ideas into physical form." /><p className="hero-sub">Tactura transforms 2D artwork into 2.5D reliefs, entirely on your iPad. From first image to printable mesh, your work stays with you.</p><div className="hero-actions"><GlowButton href="#how-it-works">See how it works</GlowButton><GlowButton href="#privacy" secondary>Read our privacy promise</GlowButton></div><div className="hero-proof"><span>◉</span><span>On-device processing</span><i /><span>No account required</span></div></div>
      <div className="hero-art"><ReliefVisual /><div className="floating-note note-one"><span>01</span><strong>2D → 2.5D</strong><small>depth, locally inferred</small></div><div className="floating-note note-two"><span className="pulse" /> iPadOS native</div></div>
    </section>
    <section className="marquee"><span>ONE IMAGE, A NEW DIMENSION</span><span>✦</span><span>PRIVATE BY DESIGN</span><span>✦</span><span>READY TO PRINT</span><span>✦</span></section>
    <section className="intro section"><div className="section-kicker">THE IDEA</div><div className="intro-layout"><h2>Give your images<br /><span>a little more room</span> to exist.</h2><div><p className="lead">A photograph is a surface. A relief is a memory you can hold.</p><p>Tactura is a focused conversion studio for iPad — designed to help illustrators, makers, and curious people discover what their flat images can become.</p><a className="text-link" href="#how-it-works">Explore the workflow <ArrowDown size={15} /></a></div></div></section>
    <section id="how-it-works" className="steps section"><div className="section-kicker">A SIMPLE PIPELINE</div><div className="section-heading"><h2>From source to surface.</h2><p>Every stage stays close at hand. No upload queues, no black boxes in the cloud.</p></div><div className="step-grid">{steps.map(({ icon: Icon, number, title, body }) => <article className="step-card" key={number}><div className="step-top"><span>{number}</span><Icon size={19} strokeWidth={1.5} /></div><h3>{title}</h3><p>{body}</p><div className="step-line" /></article>)}</div></section>
    <section id="privacy" className="privacy-band"><div className="privacy-copy"><div className="icon-tile"><LockKeyhole size={20} /></div><div className="section-kicker">PRIVATE BY DESIGN</div><h2>Your images do not<br /><em>go anywhere.</em></h2><p>Tactura has no servers, no accounts, and no networking code. The AI model and the complete relief pipeline run locally on your iPad.</p><GlowButton href="/privacy" secondary>Read the Privacy Policy</GlowButton></div><div className="privacy-specs"><div><span>01</span><strong>Nothing uploaded</strong><p>Your source image and project files remain in the app’s private storage.</p></div><div><span>02</span><strong>No tracking</strong><p>No analytics, ads, crash reporting, or third-party data collection.</p></div><div><span>03</span><strong>Works offline</strong><p>Airplane Mode does not change the core workflow.</p></div></div></section>
    <section id="faq" className="faq section"><div className="section-kicker">GOOD TO KNOW</div><div className="faq-layout"><h2>Questions,<br /><span>answered.</span></h2><div className="faq-list"><details open><summary>What can I export?</summary><p>Tactura is built around printable reliefs. Export your finished model as a standard STL, or export a height image as a PNG for other workflows.</p></details><details><summary>Does Tactura need an internet connection?</summary><p>No. The app is designed to work offline, including image preparation, depth estimation, refinement, mesh generation, and export.</p></details><details><summary>Who is Tactura for?</summary><p>Anyone curious about giving artwork a physical presence — illustrators, 3D-printing enthusiasts, designers, and makers of all kinds.</p></details></div></div></section>
    <section id="download" className="download-cta"><div><div className="section-kicker">COMING TO THE APP STORE</div><h2>Make the jump<br /><em>from screen to surface.</em></h2></div><div className="download-action"><div className="apple-badge"><span className="apple-mark">●</span><div><small>Coming soon on the</small><strong>App Store</strong></div></div><span>Have a project in mind? <a href="mailto:hello@tactura.app">Say hello ↗</a></span></div></section>
    <SiteFooter />
  </main>;
}
