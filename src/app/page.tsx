import {
  Camera,
  Download,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { appStoreUrl } from "@/lib/app-store";
import { GlowButton } from "@/components/GlowButton";
import { BlurText } from "@/components/BlurText";
import { ReliefPreview } from "@/components/ReliefPreview";
import { ProjectScreenshot } from "@/components/ProjectScreenshot";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    icon: Camera,
    number: "01",
    title: "Add an image",
    body: "Scan your artwork or pick a photo from your library.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Create a relief",
    body: "Crop your image and create a relief. Adjust the depth in the 3D preview.",
  },
  {
    icon: Download,
    number: "03",
    title: "Export a file",
    body: "Export an STL file for 3D printing or save a PNG height map.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <section className="hero page-grid">
        <div className="hero-copy">
          <BlurText text="Turn photos into 3D reliefs." />
          <p className="hero-sub">
            Create a raised design from a photo or artwork. Adjust its depth on
            your iPhone or iPad, then export it for 3D printing.
          </p>
          <div className="hero-actions">
            <GlowButton href="/demo">Try your own photo</GlowButton>
            <GlowButton href="#privacy" secondary>
              How your photos stay private
            </GlowButton>
          </div>
          <div className="hero-proof">
            <span>Photos stay on your device</span>
            <i aria-hidden="true" />
            <span>No account required</span>
          </div>
        </div>
        <div className="hero-art">
          <ProjectScreenshot />
        </div>
      </section>
      <ReliefPreview src="/vase-bhg.stl.gz" />
      <section className="intro section">
        <div className="section-kicker">What you can use</div>
        <div className="intro-layout">
          <h2>
            Start with a photo,<br />a sketch, or a painting.
          </h2>
          <div>
            <p className="lead">
              Choose the part of the image you want to turn into a relief.
            </p>
            <p>
              Crop the image before you create the relief.
            </p>
            <a className="text-link" href="#how-it-works">
              See how to make a relief
            </a>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="steps section">
        <div className="section-kicker">In the app</div>
        <div className="section-heading">
          <h2>How to make a relief</h2>
          <p>
            Use Tactura on your iPhone or iPad. The app saves your work so you can return to it later.
          </p>
        </div>
        <figure className="app-demo-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/BRqeI5NVX6s"
            title="Tactura demo: Turn 2D art into 3D-printable reliefs"
            loading="lazy"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
          />
          <figcaption>
            <a href="https://www.youtube.com/watch?v=BRqeI5NVX6s">
              Watch the demo on YouTube
            </a>
          </figcaption>
        </figure>
        <div className="step-grid">
          {steps.map(({ icon: Icon, number, title, body }) => (
            <article className="step-card" key={number}>
              <div className="step-top">
                <span>{number}</span>
                <Icon size={19} strokeWidth={1.5} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              <div className="step-line" />
            </article>
          ))}
        </div>
      </section>
      <section id="privacy" className="privacy-band">
        <div className="privacy-copy">
          <div className="icon-tile">
            <LockKeyhole size={20} />
          </div>
          <div className="section-kicker">App privacy</div>
          <h2>
            Your photos stay<br /><em>on your device.</em>
          </h2>
          <p>
            The iPhone and iPad app creates reliefs on your device. You do not need an account.
          </p>
          <GlowButton href="/privacy" secondary>
            Read the Privacy Policy
          </GlowButton>
        </div>
        <div className="privacy-specs">
          <div>
            <span>01</span>
            <strong>Nothing uploaded</strong>
            <p>
              The app keeps your images and projects in its private storage.
            </p>
          </div>
          <div>
            <span>02</span>
            <strong>No tracking</strong>
            <p>
              No analytics, ads, crash reporting, or third-party data
              collection.
            </p>
          </div>
          <div>
            <span>03</span>
            <strong>Works offline</strong>
            <p>You can create and export reliefs in Airplane Mode.</p>
          </div>
        </div>
      </section>
      <section id="faq" className="faq section">
        <div className="faq-layout">
          <h2>
            Common questions
          </h2>
          <div className="faq-list">
            <details open>
              <summary>What can I export?</summary>
              <p>
                Export an STL file for 3D printing. You can also export a PNG height map.
                A height map records how high each part of the relief is.
              </p>
            </details>
            <details>
              <summary>Does the app work offline?</summary>
              <p>
                Yes. The iPhone and iPad app can create and export reliefs offline.
                The web demo needs a connection to load.
              </p>
            </details>
            <details>
              <summary>Who is Tactura for?</summary>
              <p>
                Use Tactura if you want to turn a photo or artwork into a relief for 3D printing.
              </p>
            </details>
          </div>
        </div>
      </section>
      <section id="download" className="download-cta">
        <div>
          <div className="section-kicker">For iPhone and iPad</div>
          <h2>
            Get Tactura
          </h2>
        </div>
        <div className="download-action">
          <a className="apple-badge" href={appStoreUrl}>
            <div>
              <small>Download on the</small>
              <strong>App Store</strong>
            </div>
          </a>
          <span>
            Need help?{" "}
            <a href="mailto:contact@tactura.app">Email us</a>
          </span>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
