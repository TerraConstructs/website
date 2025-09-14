// Build-time CSP hash generator for Vite/Rollup
// - Scans dist/index.html after build
// - Hashes inline <style> & <script> blocks (sha256- base64)
// - Optionally hashes inline event handlers (e.g., onload)
// - Writes dist/csp.json with a ready-to-use CSP header string

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function sha256Base64(input) {
  return createHash("sha256").update(input).digest("base64");
}

export default function cspHashPlugin(opts = {}) {
  const distDir = opts.distDir || "dist";
  const outDir = opts.outDir || "dist";
  const extra = opts.extra || {};

  return {
    name: "csp-hash",
    apply: "build",
    async closeBundle() {
      const htmlPath = resolve(process.cwd(), distDir, "index.html");
      let html;
      try {
        html = readFileSync(htmlPath, "utf8");
      } catch {
        return;
      }

      // Extract inline <style> contents
      const styleHashes = [];
      const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
      for (const m of html.matchAll(styleRe)) {
        const css = m[1] || "";
        if (!css) continue;
        styleHashes.push(`'sha256-${sha256Base64(css)}'`);
      }

      // Extract inline <script> (no src) contents, including JSON-LD
      const scriptHashes = [];
      const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
      for (const m of html.matchAll(scriptRe)) {
        const js = m[1] || "";
        if (!js) continue;
        scriptHashes.push(`'sha256-${sha256Base64(js)}'`);
      }

      // Extract inline event handlers (e.g., onload="this.media='all'")
      const attrHashes = [];
      // Match inline event handlers in both double- and single-quoted forms
      // e.g., onload="this.media='all'" or onload='this.media="all"'
      const onAttrRe = /\son[a-z]+=(\"([^\"]+)\"|'([^']+)')/gi;
      for (const m of html.matchAll(onAttrRe)) {
        const handler = m[2] || m[3] || "";
        if (!handler) continue;
        attrHashes.push(`'sha256-${sha256Base64(handler)}'`);
      }

      // Deduplicate
      const uniq = arr => Array.from(new Set(arr));
      const styleList = uniq(styleHashes);
      const scriptList = uniq(scriptHashes);
      const attrList = uniq(attrHashes);

      // Assemble CSP header
      // Defaults focused on static hosting with Google Fonts & GA
      const d = {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          ...styleList,
          ...(extra.styleSrc || []),
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:",
          ...(extra.fontSrc || []),
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://www.google-analytics.com",
          ...(extra.imgSrc || []),
        ],
        scriptSrc: [
          "'self'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          ...scriptList,
          ...(extra.scriptSrc || []),
        ],
        connectSrc: [
          "'self'",
          "https://www.google-analytics.com",
          ...(extra.connectSrc || []),
        ],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      };

      const parts = [
        `default-src ${d.defaultSrc.join(" ")};`,
        `style-src ${d.styleSrc.join(" ")};`,
        `font-src ${d.fontSrc.join(" ")};`,
        `img-src ${d.imgSrc.join(" ")};`,
        `script-src ${d.scriptSrc.join(" ")};`,
        `connect-src ${d.connectSrc.join(" ")};`,
        `base-uri ${d.baseUri.join(" ")};`,
        `frame-ancestors ${d.frameAncestors.join(" ")};`,
      ];

      if (attrList.length) {
        // Allow hashed inline event handlers
        parts.push(`script-src-attr 'unsafe-hashes' ${attrList.join(" ")};`);
      }

      const csp = parts.join(" ");
      const out = {
        csp,
        details: {
          styleHashes: styleList,
          scriptHashes: scriptList,
          attrHashes: attrList,
        },
      };

      try {
        writeFileSync(
          resolve(process.cwd(), outDir, "csp.json"),
          JSON.stringify(out, null, 2)
        );
        // eslint-disable-next-line no-console
        console.log(`[csp-hash] Wrote ${outDir}/csp.json with CSP header`);
      } catch {
        // ignore
      }
    },
  };
}
