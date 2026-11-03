import type { Metadata } from "next";
import "./globals.css";
import { SiteBackground } from "@/components/SiteBackground";

export const metadata: Metadata = {
  title: "Tactura — Turn 2D images into 2.5D reliefs",
  description:
    "A private, on-device workflow for turning artwork into printable 2.5D relief models on iPad.",
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
