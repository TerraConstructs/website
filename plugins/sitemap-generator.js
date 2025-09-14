import { readFileSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to automatically generate/update sitemap.xml
 * - Updates lastmod dates to current build date
 * - Validates sections exist in HTML
 * - Removes non-existent sections
 */
export default function sitemapGenerator(options = {}) {
  const {
    baseUrl = "https://terraconstructs.dev",
    routes = [
      { path: "/", priority: 1.0, changefreq: "weekly" },
      { path: "/#features", priority: 0.8, changefreq: "weekly" },
      { path: "/#demo", priority: 0.8, changefreq: "weekly" },
      { path: "/#faq", priority: 0.7, changefreq: "weekly" },
      { path: "/#community", priority: 0.7, changefreq: "weekly" },
    ],
  } = options;

  let isProduction = false;
  let rootPath = "";

  return {
    name: "sitemap-generator",
    configResolved(config) {
      isProduction = config.command === "build";
      rootPath = config.root;
    },

    generateBundle(options, bundle) {
      if (!isProduction) return;

      try {
        // Read the HTML file to validate sections exist
        const htmlPath = join(rootPath, "index.html");
        const htmlContent = readFileSync(htmlPath, "utf-8");

        // Extract section IDs from HTML
        const sectionIds = new Set();
        const sectionRegex = /id="([^"]+)"/g;
        let match;
        while ((match = sectionRegex.exec(htmlContent)) !== null) {
          sectionIds.add(match[1]);
        }

        // Filter routes to only include existing sections
        const validRoutes = routes.filter(route => {
          if (route.path === "/") return true; // Root always exists

          const sectionId = route.path.replace("/#", "");
          const exists = sectionIds.has(sectionId);

          if (!exists) {
            console.warn(
              `Sitemap: Section '${sectionId}' not found in HTML, excluding from sitemap`
            );
          }

          return exists;
        });

        // Generate current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split("T")[0];

        // Generate sitemap XML
        const sitemapXml = generateSitemapXml(
          baseUrl,
          validRoutes,
          currentDate
        );

        // Add sitemap to bundle
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: sitemapXml,
        });

        console.log(
          `✓ Generated sitemap.xml with ${validRoutes.length} URLs (last modified: ${currentDate})`
        );
      } catch (error) {
        console.error("Failed to generate sitemap:", error);
      }
    },
  };
}

function generateSitemapXml(baseUrl, routes, lastmod) {
  const urls = routes
    .map(
      route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}
