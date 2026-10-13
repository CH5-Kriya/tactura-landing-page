import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/demo", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `https://www.tactura.app${path}`,
  }));
}
