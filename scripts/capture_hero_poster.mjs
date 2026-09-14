#!/usr/bin/env node
/**
 * Capture the homepage hero poster from the live 3D ICE showcase.
 *
 * The poster is what mobile visitors see instead of the WebGL runtime, and
 * what everyone sees while the iframe boots. It has to be a clean render:
 * no "Click to interact" badge, no HUD, no loading overlay. Re-run this after
 * `pnpm sync:3d-ice` changes the bundle's camera preset or colour ramps.
 *
 *   hugo server -p 1313 &
 *   node scripts/capture_hero_poster.mjs
 *
 * Options: --url, --out, --width, --height, --scale, --quality, --timeout
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const BASE = opt("url", "http://localhost:1313");
const OUT = path.resolve(opt("out", "assets/media/hero-3d-ice.jpg"));
const QUALITY = Number(opt("quality", 88));
const WIDTH = Number(opt("width", 1600));
const HEIGHT = Number(opt("height", 1000));
const SCALE = Number(opt("scale", 1.5));
const TIMEOUT = Number(opt("timeout", 120_000));

const TARGET =
  `${BASE}/tools/3D-interactive-cryosphere-explorer.html` +
  `?mode=showcase&preset=home-hero`;

/* Showcase mode still paints an interaction badge and a status chip over the
   canvas. Both are pseudo-elements or HUD nodes, so hide them in CSS rather
   than trying to unset the classes that drive them. */
const HIDE_CHROME = `
  .viewer-shell::after { content: none !important; display: none !important; }
  .hud, .status, .viewer-toolbar, .loading-overlay,
  #fullscreenToggle, #viewerFullscreenToggle { display: none !important; }
`;

/* Use the locally installed Google Chrome so the repo does not need
   Playwright's ~150 MB browser download just to refresh one image. */
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") console.warn("  page error:", msg.text());
  });

  console.log(`→ ${TARGET}`);
  await page.goto(TARGET, { waitUntil: "load", timeout: TIMEOUT });

  // The explorer streams several megabytes of gridded data before the first
  // meaningful frame; it clears the overlay only once the meshes are built.
  await page.waitForFunction(
    () => document.getElementById("loadingOverlay")?.classList.contains("hidden"),
    undefined,
    { timeout: TIMEOUT, polling: 500 },
  );

  await page.addStyleTag({ content: HIDE_CHROME });

  // Let the auto-rotation settle on a pose and the ice shading finish.
  await page.waitForTimeout(3500);

  await mkdir(path.dirname(OUT), { recursive: true });
  /* JPEG, not PNG: the render is photographic, and a lossless capture of it
     costs ~2.5 MB of repo weight for no visible gain. Hugo re-encodes this to
     webp at build time anyway. */
  await page.screenshot({ path: OUT, type: "jpeg", quality: QUALITY });
  console.log(`✓ ${path.relative(process.cwd(), OUT)} (${WIDTH}×${HEIGHT} @${SCALE}x)`);
} finally {
  await browser.close();
}
