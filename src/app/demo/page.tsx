import type { Metadata } from "next";
import Link from "next/link";
import { appStoreUrl } from "@/lib/app-store";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import PhotoDemo from "@/components/PhotoDemo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Try Tactura in your browser",
  description: "Turn a photo into a relief in your browser. Adjust its depth in a 3D preview.",
};

export default function Demo() {
  return <main>
    <SiteHeader />
    <section className="demo-page">
      <h1>Try Tactura in your browser</h1>
      <p className="demo-lede">Choose a photo. Create a relief and adjust its depth in the 3D preview.</p>
      <p className="demo-requirements">The demo needs WebGPU with FP16 support. The first run downloads about 75 MB. Your photo stays on your device.</p>
      <PhotoDemo />
      <Link className="text-link" href={appStoreUrl}>Get Tactura on the App Store</Link>
    </section>
    <SiteFooter />
  </main>;
}
