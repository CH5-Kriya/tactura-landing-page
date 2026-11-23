# App Store badge reference

Inspected https://gentlerstories.com/gentlerstreak in Safari Web Inspector on 2026-11-24.

The Gentler Streak White component uses text and the Apple symbol, rather than an SVG badge:

- Base size: 180 × 60 CSS pixels; white background; radius 16px.
- Typeface: Inter Medium (500), normal style.
- Label: 12px / 14.4px; title: 24px / 28.8px, tracking -1.2px.
- Apple symbol: 36px / 43.2px, tracking -1.8px.
- Hover: scale 1.05; Motion spring with duration 0.4 seconds, bounce 0.2, delay 0.
- Font source: https://framerusercontent.com/assets/UjlFhCnUjxhNfep4oYBPqnEssyo.woff2

Tactura uses those base measurements in the download section and scales them proportionally to a 44px badge height in the header. Hover is disabled for reduced motion. The destination remains Tactura's App Store campaign URL.
