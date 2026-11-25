import type { Metadata } from "next";
import { LegalHeader } from "@/components/LegalHeader";
import { FeedbackBoard } from "@/components/FeedbackBoard";
import "./feedback.css";

export const metadata: Metadata = {
  title: "Share your feedback — Tactura",
  description: "Tried Tactura? Tell us what worked and what we can improve.",
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  return (
    <main className="feedback-page">
      <LegalHeader />
      <div className="feedback-content">
        <div className="feedback-intro">
          <h1>Help shape<br /><em>Tactura.</em></h1>
          <p>Tried Tactura? Tell us what worked and what we can improve.</p>
        </div>
        <FeedbackBoard />
      </div>
    </main>
  );
}
