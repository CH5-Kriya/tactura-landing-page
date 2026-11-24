"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppStoreBadge } from "./AppStoreBadge";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import "./site-header.css";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const syncScroll = () => setScrolled((current) => window.scrollY > (current ? 16 : 32));
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  useEffect(() => {
    const element = header.current;
    const nav = element?.querySelector<HTMLElement>(".header-nav");
    const actions = element?.querySelector<HTMLElement>(".header-actions");
    const icon = element?.querySelector<HTMLElement>(".brand-mark");
    if (!element || !nav || !actions || !icon) return;
    let disposed = false;
    const measure = () => {
      if (disposed || !window.matchMedia("(min-width: 961px)").matches) return;
      const links = Array.from(nav.children).filter((link) => getComputedStyle(link).display !== "none");
      const linkWidth = links.reduce((width, link) => width + link.getBoundingClientRect().width, 0);
      // Compact padding, borders and gaps match site-header.css, independent of the animated wordmark.
      const width = icon.getBoundingClientRect().width + linkWidth + (links.length - 1) * 20
        + actions.getBoundingClientRect().width + 2 * 18 + 20 + 12 + 2;
      const value = `${Math.ceil(width)}px`;
      if (element.style.getPropertyValue("--header-compact-width") !== value) {
        element.style.setProperty("--header-compact-width", value);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(actions);
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 961px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <div className="site-header-slot">
      <svg className="header-glass-filter" aria-hidden="true" focusable="false">
        <defs>
          <filter id="tactura-header-glass" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.003 0.007" numOctaves="1" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="200" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <header ref={header} className="site-header" data-menu-open={open} data-floating={scrolled || open}>
        <div className="header-glass-bend" aria-hidden="true" />
        <div className="header-glass-face" aria-hidden="true" />
        <div className="header-glass-edge" aria-hidden="true" />
        <Link href="/" className="header-brand" aria-label="Tactura home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav id="main-navigation" className="header-nav" aria-label="Main navigation" onClick={() => setOpen(false)}>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#privacy">Privacy</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/demo" aria-current={pathname === "/demo" ? "page" : undefined}>Try demo</Link>
          <AppStoreBadge className="mobile-store-link" />
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <AppStoreBadge className="store-button" />
          <button ref={menuButton} type="button" className="header-menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>
    </div>
  );
}
