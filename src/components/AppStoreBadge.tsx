"use client";

import localFont from "next/font/local";
import { motion, useReducedMotion } from "motion/react";
import { appStoreUrl } from "@/lib/app-store";
import "./app-store-badge.css";

const inter = localFont({
  src: "../app/fonts/InterMedium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
});

export function AppStoreBadge({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={appStoreUrl}
      className={`app-store-badge ${inter.className} ${className}`.trim()}
      aria-label="Download on the App Store"
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
    >
      <span className="app-store-badge__icon" aria-hidden="true"></span>
      <span className="app-store-badge__label" aria-hidden="true">Download on the</span>
      <span className="app-store-badge__title" aria-hidden="true">App Store</span>
    </motion.a>
  );
}
