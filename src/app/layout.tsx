import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteBackground } from "@/components/SiteBackground";
import { initializeTheme } from "@/lib/theme";
import { Analytics } from "@vercel/analytics/next";

const blackout = localFont({
  src: "./fonts/BlackoutMidnight.ttf",
  variable: "--font-blackout",
  weight: "400",
  style: "normal",
  display: "swap",
});

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
    <html lang="en" className={blackout.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag("js", new Date());

{
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-WZ72L3KK";
  document.head.appendChild(script);
}`,
          }}
        />
      </head>
      <body>
        <SiteBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
