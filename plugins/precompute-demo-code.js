// Vite plugin to precompute highlighted HTML and tour segments
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
// Use createRequire to interop with possible CJS export
const require = createRequire(import.meta.url);
const { definer: terraform } = require("@taga3s/highlightjs-terraform");

const VIRTUAL_ID = "virtual:demo-precomputed";
const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

// Register languages for server-side highlighting
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("hcl", terraform);

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightLine(line, language) {
  if (!line) return "";
  try {
    return hljs.highlight(line, { language }).value;
  } catch {
    return escapeHtml(line);
  }
}

function buildLineHtml(lines, language) {
  const htmlLines = [];
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const content = lines[i];
    let highlighted;
    if (content.trim() === "") {
      // Use consistent wrapper structure for empty lines
      highlighted = '<span class="line-content empty-line">&nbsp;</span>';
    } else {
      highlighted = `<span class="line-content">${highlightLine(
        content,
        language
      )}</span>`;
    }
    htmlLines.push(
      `<div class="code-line" data-line-number="${lineNumber}">${highlighted}</div>`
    );
  }
  return htmlLines;
}

function computeLineToSegment(lines, steps) {
  const map = new Map();
  if (!Array.isArray(steps)) return map;
  for (const step of steps) {
    if (step.type === "line-range" && step.startLine && step.endLine) {
      for (let ln = step.startLine; ln <= step.endLine; ln++) {
        map.set(ln, step);
      }
    } else if (step.type === "search-pattern" && step.pattern) {
      const regex = new RegExp(step.pattern, "gi");
      for (let idx = 0; idx < lines.length; idx++) {
        if (regex.test(lines[idx])) {
          const ln = idx + 1;
          map.set(ln, step);
          break;
        }
      }
    }
  }
  return map;
}

function wrapWithSegments(htmlLines, language, steps, lines) {
  const lineToSegment = computeLineToSegment(lines, steps);
  const out = [];
  let current = null;
  let buffer = [];
  let currentMaxChars = 0;

  function flushBuffer() {
    if (buffer.length === 0) return;
    if (!current) {
      out.push(...buffer);
    } else {
      const attrs = [];
      attrs.push(`class="tour-segment"`);
      attrs.push(`data-tour-id="${current.id}"`);
      attrs.push(`data-max-chars="${currentMaxChars}"`);
      if (current.type === "line-range") {
        attrs.push(`data-lines="${current.startLine}-${current.endLine}"`);
      } else if (current.type === "search-pattern") {
        // Find first line number present in this buffer
        const first = buffer[0];
        const match = first.match(/data-line-number="(\d+)"/);
        const ln = match ? match[1] : "";
        attrs.push(`data-lines="${ln}"`);
        attrs.push(`data-pattern="${current.pattern}"`);
      }
      out.push(`<div ${attrs.join(" ")}>`);
      out.push(...buffer);
      out.push("</div>");
    }
    buffer = [];
    currentMaxChars = 0;
  }

  for (let i = 0; i < htmlLines.length; i++) {
    const ln = i + 1;
    const seg = lineToSegment.get(ln);
    if (!seg && current) {
      // Leaving a segment
      flushBuffer();
      current = null;
    }
    if (seg && (!current || current.id !== seg.id)) {
      // Switching segments
      flushBuffer();
      current = seg;
    }
    // Track maximum raw character count for the current segment
    if (seg && current && seg.id === current.id) {
      const raw = lines[i] || "";
      if (raw.length > currentMaxChars) currentMaxChars = raw.length;
    }
    buffer.push(htmlLines[i]);
  }
  flushBuffer();

  // Join without newlines to prevent pre/pre-wrap containers creating extra gaps
  return out.join("");
}

function precomputeOne({ code, language, steps }) {
  const lines = code.split("\n");
  const htmlLines = buildLineHtml(lines, language);
  const html = wrapWithSegments(htmlLines, language, steps, lines);
  return {
    html,
    lineCount: lines.length,
    charCount: code.length,
    raw: code,
    language,
  };
}

function loadJson(jsonPath) {
  const content = fs.readFileSync(jsonPath, "utf8");
  return JSON.parse(content);
}

export default function precomputeDemoCode() {
  // Known demo files; extend as needed
  const root = process.cwd();
  const demos = {
    workshop: {
      // Basic Lambda function with API Gateway REST API
      typescriptPath: path.join(root, "demos/workshop/src/stack.ts"),
      terraformPath: path.join(root, "demos/workshop/cdk.tf"),
      fileName: "main.ts",
    },
    "function-url": {
      // Lambda function with direct HTTP endpoint using Function URL
      typescriptPath: path.join(root, "demos/function-url/src/stack.ts"),
      terraformPath: path.join(root, "demos/function-url/cdk.tf"),
      fileName: "main.ts",
    },
  };

  const tourConfigJson = path.join(root, "src/tour-configs.json");
  const tourConfigJs = path.join(root, "src/tour-configs.js");

  async function loadTourConfigs() {
    if (fs.existsSync(tourConfigJson)) {
      return loadJson(tourConfigJson);
    }
    // Fallback to importing the JS module
    const mod = await import(pathToFileURL(tourConfigJs).href);
    return mod.tourConfigs || {};
  }

  async function buildModuleCode() {
    const tourConfigs = await loadTourConfigs();
    const out = {};

    for (const key of Object.keys(demos)) {
      const cfg = demos[key];
      const tour = tourConfigs[key];
      const tsCode = fs.readFileSync(cfg.typescriptPath, "utf8");
      const tfCode = fs.readFileSync(cfg.terraformPath, "utf8");

      const typescript = precomputeOne({
        code: tsCode,
        language: "typescript",
        steps: tour?.inputSteps || [],
      });
      const terraform = precomputeOne({
        code: tfCode,
        language: "hcl",
        steps: tour?.outputSteps || [],
      });

      out[key] = {
        name: tour?.name || key,
        description: tour?.description || "",
        fileName: cfg.fileName,
        typescript,
        terraform,
        tour: {
          inputSteps: tour?.inputSteps || [],
          outputSteps: tour?.outputSteps || [],
        },
      };
    }

    return `export const demos = ${JSON.stringify(out)};\n`;
  }

  return {
    name: "precompute-demo-code",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },
    async load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return await buildModuleCode();
      }
    },
    buildStart() {
      // watch all inputs
      for (const key of Object.keys(demos)) {
        this.addWatchFile(demos[key].typescriptPath);
        this.addWatchFile(demos[key].terraformPath);
      }
      if (fs.existsSync(tourConfigJson)) {
        this.addWatchFile(tourConfigJson);
      } else {
        this.addWatchFile(tourConfigJs);
      }
    },
    handleHotUpdate(ctx) {
      const changed = path.resolve(ctx.file);
      if (
        changed === tourConfigJson ||
        changed === tourConfigJs ||
        Object.values(demos).some(
          (d) => d.typescriptPath === changed || d.terraformPath === changed
        )
      ) {
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
        if (mod) ctx.server.moduleGraph.invalidateModule(mod);
        return [mod].filter(Boolean);
      }
    },
  };
}
