import type { NextApiRequest, NextApiResponse } from "next";

const SITEMAP_BASE_URL = "https://oraxbot.com";

const STATIC_PAGES = [
  "",
  "/explore",
  "/privacy",
  "/tos",
];

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const lastModified = new Date().toISOString();

  const urls = STATIC_PAGES.map(
    (path) => `  <url>
    <loc>${SITEMAP_BASE_URL}/${path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${path === "" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "" ? "1.0" : "0.6"}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();
}
