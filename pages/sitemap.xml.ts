import { GetServerSideProps } from "next";

const SITEMAP_BASE_URL = "https://oraxbot.com";

const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/explore", priority: "0.8", changefreq: "daily" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/tos", priority: "0.3", changefreq: "yearly" },
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lastModified = new Date().toISOString();

  const urls = STATIC_PAGES.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${SITEMAP_BASE_URL}${path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
