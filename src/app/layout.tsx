import type { Metadata } from "next";
import "./globals.css";
import { SiteBackground } from "@/components/SiteBackground";

export const metadata: Metadata = {
  title: "Tactura | Turn photos into 3D reliefs",
  description:
    "Turn photos and artwork into reliefs for 3D printing on iPhone and iPad. Your photos stay on your device.",
  icons: {
    icon: { url: "/tactura-favicon.png", sizes: "48x48", type: "image/png" },
    apple: { url: "/tactura-apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteBackground />{children}</body>
    </html>
  );
}
