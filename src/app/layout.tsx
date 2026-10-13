import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tactura — Turn 2D images into 2.5D reliefs",
  description:
    "A private, on-device workflow for turning artwork into printable 2.5D relief models on iPad.",
  icons: { icon: "/tactura-icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
