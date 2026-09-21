/**
 * Fail the build if a static file shadows a page that Hugo renders.
 *
 * Hugo runs `copyStatic` and `buildSites` in the same errgroup, so a static mount
 * carrying a file at a page's output path races the rendered page for that path
 * and the winner depends on timing (a warm image cache is enough to flip it).
 * A shadowed page therefore fails silently and intermittently.
 *
 * Two independent assertions:
 *
 *   1. Collisions — no static mount source holds a file at any rendered page's
 *      output path. This inspects the mount sources rather than the build output,
 *      so it reports the collision even on builds where the page happened to win.
 *
 *   2. Output — every page listed in sitemap.xml exists in the publish directory
 *      and carries Hugo's generator meta tag, and every guarded page is still in
 *      the sitemap at all. This catches the symptom whatever its cause.
 *
 * Usage: node scripts/check_static_page_shadowing.mjs [publishDir]
 */
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const bundleConfigPath = path.join(repoRoot, "config", "3d-ice-bundle.json");

const publishDir = path.resolve(repoRoot, process.argv[2] || process.env.HUGO_PUBLISH_DIR || "public");
const hugoBinary = process.env.HUGO_BINARY || "hugo";

// Every Hugo Blox page layout emits this in <head>; a copied static file will not.
const GENERATOR_PATTERN = /<meta[^>]+name=["']?generator["']?/i;
const REDIRECT_PATTERN = /http-equiv=["']?refresh|location\.replace/i;

function fail(message) {
  process.stderr.write(`[page-shadowing] ${message}\n`);
}

function log(message) {
  process.stdout.write(`[page-shadowing] ${message}\n`);
}

/**
 * `hugo config mounts` prints one pretty-printed JSON object per module. Joining
 * them into an array keeps us on Hugo's own resolved view of the mounts instead
 * of re-parsing config/_default/module.yaml.
 */
function readStaticMounts() {
  const result = spawnSync(hugoBinary, ["config", "mounts"], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `\`${hugoBinary} config mounts\` failed: ${result.error?.message || result.stderr || `status ${result.status}`}`
    );
  }

  const objects = `[${result.stdout.trim().replace(/^\}$\n^\{$/gm, "},\n{")}]`;
  let modules;
  try {
    modules = JSON.parse(objects);
  } catch (error) {
    throw new Error(`Could not parse \`${hugoBinary} config mounts\` output: ${error.message}`);
  }

  const staticMounts = [];
  for (const module of modules) {
    for (const mount of module.mounts || []) {
      const target = mount.target || "";
      if (target !== "static" && !target.startsWith("static/")) continue;
      staticMounts.push({
        sourceDir: path.resolve(module.dir || repoRoot, mount.source),
        label: `${mount.source} -> ${target}`,
        // `static` maps 1:1 onto the site root; `static/foo` shifts everything under /foo/.
        targetPrefix: target === "static" ? "" : target.slice("static/".length).replace(/\/+$/, ""),
        filtered: Boolean(
          mount.includeFiles || mount.IncludeFiles || mount.excludeFiles || mount.ExcludeFiles
        ),
      });
    }
  }
  return staticMounts;
}

/**
 * The baseURL's path prefix, which every sitemap location shares but which is not
 * part of the path under the publish directory. Usually "/", but GitHub Pages
 * project sites serve from a subdirectory. When the home page is in the sitemap it
 * is the shortest location and gives the prefix directly; otherwise fall back to
 * the longest common directory prefix.
 */
function findBasePath(pathnames) {
  const shortest = pathnames.reduce((a, b) => (b.length < a.length ? b : a));
  if (pathnames.every((pathname) => pathname.startsWith(shortest))) return shortest;

  const common = pathnames.reduce((prefix, pathname) => {
    let i = 0;
    while (i < prefix.length && i < pathname.length && prefix[i] === pathname[i]) i += 1;
    return prefix.slice(0, i);
  });
  return common.slice(0, common.lastIndexOf("/") + 1) || "/";
}

/**
 * Rendered page paths, taken from the build's own sitemap, as site-root-relative
 * paths plus the file each one is published to.
 */
async function readRenderedPages() {
  const sitemapPath = path.join(publishDir, "sitemap.xml");
  if (!existsSync(sitemapPath)) {
    throw new Error(`No sitemap.xml in ${publishDir} — build the site before running this check.`);
  }
  const xml = await readFile(sitemapPath, "utf8");
  const pathnames = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return decodeURIComponent(new URL(match[1].trim()).pathname);
    } catch {
      throw new Error(`Malformed <loc> in ${sitemapPath}: ${match[1]}`);
    }
  });
  if (pathnames.length === 0) {
    throw new Error(`${sitemapPath} lists no pages — build the site before running this check.`);
  }

  const basePath = findBasePath(pathnames);
  return pathnames.map((pathname) => {
    const sitePath = `/${pathname.slice(basePath.length).replace(/^\/+/, "")}`;
    const outputRelPath = sitePath.endsWith("/") ? `${sitePath.slice(1)}index.html` : sitePath.slice(1);
    return { sitePath, outputRelPath };
  });
}

function findCollisions(pages, staticMounts) {
  const collisions = [];
  for (const mount of staticMounts) {
    if (!existsSync(mount.sourceDir)) continue;
    for (const page of pages) {
      let relPath = page.outputRelPath;
      if (mount.targetPrefix) {
        if (!relPath.startsWith(`${mount.targetPrefix}/`)) continue;
        relPath = relPath.slice(mount.targetPrefix.length + 1);
      }
      const candidate = path.join(mount.sourceDir, relPath);
      if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
      collisions.push({ page, mount, candidate });
    }
  }
  return collisions;
}

async function findUnrenderedPages(pages) {
  const problems = [];
  for (const page of pages) {
    const file = path.join(publishDir, page.outputRelPath);
    if (!existsSync(file)) {
      problems.push({ page, reason: "missing from the publish directory" });
      continue;
    }
    const html = await readFile(file, "utf8");
    if (GENERATOR_PATTERN.test(html)) continue;
    const shape = REDIRECT_PATTERN.test(html) ? "a redirect stub" : "not a Hugo-rendered page";
    problems.push({ page, reason: `${shape} (${html.length} bytes, no generator meta tag)` });
  }
  return problems;
}

async function main() {
  const config = JSON.parse(await readFile(bundleConfigPath, "utf8"));
  const guardedPages = config.guardedPages || [];

  const staticMounts = readStaticMounts();
  const pages = await readRenderedPages();
  const sitePaths = new Set(pages.map((page) => page.sitePath));

  const collisions = findCollisions(pages, staticMounts);
  const unrendered = await findUnrenderedPages(pages);
  const missingGuarded = guardedPages.filter((sitePath) => !sitePaths.has(sitePath));

  if (collisions.length === 0 && unrendered.length === 0 && missingGuarded.length === 0) {
    log(
      `ok — ${pages.length} rendered pages, ${staticMounts.length} static mounts, no shadowed pages`
    );
    return;
  }

  for (const { page, mount, candidate } of collisions) {
    fail(`${page.sitePath} is rendered by Hugo but static mount "${mount.label}" also ships it`);
    fail(`  ${path.relative(repoRoot, candidate)}`);
    if (mount.filtered) {
      fail("  (this mount has includeFiles/excludeFiles, which this check does not evaluate)");
    }
  }
  if (collisions.length > 0) {
    fail(
      "Hugo copies static files and renders pages concurrently, so this path would be served by whichever finishes last."
    );
    fail(
      "Fix: stop shipping that file from the static mount. For the 3D ICE bundle, add its path to `prunePaths` in config/3d-ice-bundle.json."
    );
  }

  for (const { page, reason } of unrendered) {
    fail(`${page.sitePath} in sitemap.xml is ${reason}`);
  }
  for (const sitePath of missingGuarded) {
    fail(`guarded page ${sitePath} is absent from sitemap.xml — it was not rendered`);
  }

  process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  fail(`could not verify the build: ${error.message}`);
  process.exitCode = 1;
}
