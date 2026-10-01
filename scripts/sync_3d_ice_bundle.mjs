import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const bundleConfigPath = path.join(repoRoot, "config", "3d-ice-bundle.json");
const generatedRoot = path.join(repoRoot, "generated", "3d-ice-compat");
const syncStatePath = path.join(repoRoot, "generated", ".3d-ice-compat-sync.json");
const landingRoot = path.join(repoRoot, "generated", "3d-ice-landing");
const remoteCacheRoot = path.join(repoRoot, ".cache", "3d-ice-bundles");

function log(message) {
  process.stdout.write(`[3d-ice sync] ${message}\n`);
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function resolveRepoPath(candidate) {
  if (!candidate) return null;
  return path.isAbsolute(candidate) ? candidate : path.resolve(repoRoot, candidate);
}

async function fileSha256(filePath) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function readChecksumFile(checksumPath) {
  if (!(await pathExists(checksumPath))) return null;
  const raw = await readFile(checksumPath, "utf8");
  const match = raw.trim().match(/^([a-f0-9]{64})\b/i);
  return match ? match[1].toLowerCase() : null;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: options.captureOutput ? "pipe" : "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const details = options.captureOutput ? `\n${result.stdout || ""}${result.stderr || ""}` : "";
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}.${details}`);
  }
  return result;
}

async function resolveLocalBundleSource(config) {
  const assetName = config.assetName;
  const checksumName = config.checksumName;
  const localBundleEnv = process.env.THREED_ICE_LOCAL_BUNDLE;
  const localRepoEnv = process.env.THREED_ICE_LOCAL_REPO;
  const candidates = [];

  if (localBundleEnv) {
    const bundlePath = resolveRepoPath(localBundleEnv);
    const checksumPath = bundlePath ? `${bundlePath}.sha256` : null;
    candidates.push({
      label: `env bundle ${bundlePath}`,
      bundlePath,
      checksumPath,
    });
  }

  if (localRepoEnv) {
    const repoPath = resolveRepoPath(localRepoEnv);
    if (repoPath) {
      candidates.push({
        label: `env repo ${repoPath}`,
        bundlePath: path.join(repoPath, "dist", assetName),
        checksumPath: path.join(repoPath, "dist", checksumName),
      });
    }
  }

  for (const repoCandidate of config.localRepoCandidates || []) {
    const repoPath = resolveRepoPath(repoCandidate);
    if (!repoPath) continue;
    candidates.push({
      label: `local repo ${repoPath}`,
      bundlePath: path.join(repoPath, "dist", assetName),
      checksumPath: path.join(repoPath, "dist", checksumName),
    });
  }

  for (const candidate of candidates) {
    if (!candidate.bundlePath || !(await pathExists(candidate.bundlePath))) continue;
    const expectedSha = (await readChecksumFile(candidate.checksumPath)) || (await fileSha256(candidate.bundlePath));
    return {
      sourceType: "local",
      sourceLabel: candidate.label,
      bundlePath: candidate.bundlePath,
      sha256: expectedSha,
    };
  }

  return null;
}

async function fetchToFile(url, destinationPath) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`GET ${url} failed with status ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, Buffer.from(arrayBuffer));
}

async function resolveRemoteBundleSource(config, ref) {
  const assetName = config.assetName;
  const checksumName = config.checksumName;
  const baseUrl = `https://github.com/${config.owner}/${config.repo}/releases/download/${encodeURIComponent(ref)}`;
  const cacheDir = path.join(remoteCacheRoot, ref);
  const bundlePath = path.join(cacheDir, assetName);
  const checksumPath = path.join(cacheDir, checksumName);

  await mkdir(cacheDir, { recursive: true });

  const cachedChecksum = await readChecksumFile(checksumPath);
  if (cachedChecksum && (await pathExists(bundlePath))) {
    const cachedSha = await fileSha256(bundlePath);
    if (cachedSha === cachedChecksum) {
      return {
        sourceType: "remote-cache",
        sourceLabel: `${baseUrl}/${assetName}`,
        bundlePath,
        sha256: cachedSha,
      };
    }
  }

  await fetchToFile(`${baseUrl}/${checksumName}`, checksumPath);
  const expectedSha = await readChecksumFile(checksumPath);
  if (!expectedSha) {
    throw new Error(`Invalid checksum file downloaded from ${baseUrl}/${checksumName}`);
  }
  await fetchToFile(`${baseUrl}/${assetName}`, bundlePath);
  const actualSha = await fileSha256(bundlePath);
  if (actualSha !== expectedSha) {
    throw new Error(`Checksum mismatch for ${bundlePath}: expected ${expectedSha}, got ${actualSha}`);
  }

  return {
    sourceType: "remote",
    sourceLabel: `${baseUrl}/${assetName}`,
    bundlePath,
    sha256: actualSha,
  };
}

async function readSyncState() {
  if (!(await pathExists(syncStatePath))) return null;
  return JSON.parse(await readFile(syncStatePath, "utf8"));
}

async function writeSyncState(state) {
  await mkdir(path.dirname(syncStatePath), { recursive: true });
  await writeFile(syncStatePath, `${JSON.stringify(state, null, 2)}\n`);
}

async function extractBundle(bundlePath) {
  await rm(generatedRoot, { recursive: true, force: true });
  await mkdir(generatedRoot, { recursive: true });
  run("tar", ["-xzf", bundlePath, "-C", generatedRoot]);
  const expectedToolsDir = path.join(generatedRoot, "tools");
  if (!existsSync(expectedToolsDir)) {
    throw new Error(`Bundle ${bundlePath} did not extract a tools/ directory`);
  }
}

// ------------------------------------------------------------------ landing page

/**
 * 3d-ice.com's home pages, which the bundle carries under home/: the address each is
 * published at there, against which its relative links resolve, and the address of this
 * site's copy.
 */
const LANDING_SOURCES = [
  {
    locale: "en-US",
    source: "home/en-US.html",
    pageUrl: "https://3d-ice.com/",
    siteUrl: "https://yuwang.blog/tools/3d-ice/",
  },
  {
    locale: "zh-CN",
    source: "home/zh-CN.html",
    pageUrl: "https://3d-ice.com/zh/",
    siteUrl: "https://yuwang.blog/zh/tools/3d-ice/",
  },
];
const SITE_ORIGIN = "https://yuwang.blog/";
const URL_ATTRIBUTE = /\b(href|src|poster|data-light-src|data-dark-src)=(["'])(.*?)\2/g;
const SRCSET_ATTRIBUTE = /\bsrcset=(["'])(.*?)\1/g;
// Any page link or asset still relative after resolving would point under /tools/3d-ice/.
const LEFTOVER_RELATIVE = /\b(?:href|src|poster|srcset|action|formaction|data-[a-z-]*src)=(["'])\.\.?\//i;

function matchOnce(html, pattern, label, source) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} in ${source}, found ${matches.length}.`);
  }
  return matches[0][0];
}

/**
 * Relative links resolve as they do on 3d-ice.com, which serves the same paths as this site,
 * and links to this site become site-relative. rel="nofollow" is for 3d-ice.com's links to
 * this site, not for links within it.
 */
function resolveUrl(value, pageUrl) {
  const isRelative = value && !/^(#|\/|[a-z][a-z0-9+.-]*:)/i.test(value);
  if (!isRelative && !value.startsWith(SITE_ORIGIN)) return value;
  const url = new URL(value, pageUrl);
  return `${url.pathname}${url.search}${url.hash}`;
}

function resolveLinks(html, pageUrl, source) {
  const resolved = html
    .replace(URL_ATTRIBUTE, (whole, attribute, quote, value) => `${attribute}=${quote}${resolveUrl(value, pageUrl)}${quote}`)
    .replace(SRCSET_ATTRIBUTE, (whole, quote, value) => {
      const candidates = value.split(",").map((candidate) => {
        const [url, ...descriptors] = candidate.trim().split(/\s+/);
        return [resolveUrl(url, pageUrl), ...descriptors].join(" ");
      });
      return `srcset=${quote}${candidates.join(", ")}${quote}`;
    })
    .replace(/<a ([^>]*)>/g, (tag, attributes) => {
      if (!/\bhref=(["'])\//.test(attributes)) return tag;
      // Drop the nofollow token, and the attribute if nothing else is left in it.
      return `<a ${attributes.replace(/\s*\brel=(["'])(.*?)\1/, (whole, quote, value) => {
        const kept = value.split(/\s+/).filter((token) => token && token !== "nofollow");
        return kept.length ? ` rel=${quote}${kept.join(" ")}${quote}` : "";
      })}>`;
    });
  const leftover = resolved.match(LEFTOVER_RELATIVE);
  if (leftover) {
    throw new Error(`An attribute in ${source} is still relative after resolving links: ${leftover[0]}`);
  }
  return resolved;
}

/**
 * The part of a 3d-ice.com home page this site shows at /tools/3d-ice/: its header and main
 * content, plus the external scripts at the end of its body. The site's own navbar has a
 * theme switch, so the page's is left out. 3d-ice/tests/test_site_embed.py pins the
 * structure this relies on.
 */
function buildLandingFragment(html, { source, pageUrl }) {
  const header = matchOnce(
    html,
    /<header\b[^>]*\bclass=(["'])[^"']*\bexplorer-page-header\b[^"']*\1[^>]*>[\s\S]*?<\/header>/g,
    "page header",
    source
  );
  const main = matchOnce(html, /<main\b[^>]*\bid=(["'])main\1[^>]*>[\s\S]*<\/main>/g, "<main id=\"main\">", source);
  const bodyStart = html.search(/<body\b/);
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyStart < 0 || bodyEnd < bodyStart) throw new Error(`Expected a <body> in ${source}.`);
  // The rest of the body (skip link, footer) is replaced by the site's own, but its scripts
  // are the page's: the feedback form needs its library. Inline ones could not be carried.
  const rest = html.slice(bodyStart, bodyEnd).replace(header, "").replace(main, "");
  const scriptTags = [...rest.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((match) => match[0]);
  const external = scriptTags.filter((tag) => /^<script\b[^>]*\bsrc=(["'])https:\/\/[^"']+\1[^>]*>\s*<\/script>$/.test(tag));
  if (external.length !== scriptTags.length) {
    throw new Error(`${source} has a script outside its header and main that is not external; it would be lost.`);
  }
  if (/action=(["'])https:\/\/usebasin\.com\//.test(main) && !external.some((tag) => tag.includes("js.usebasin.com"))) {
    throw new Error(`${source} has a feedback form but no Basin script after its main content.`);
  }
  const themeToggle = /\s*<button\b[^>]*\bid=(["'])themeToggle\1[^>]*>[\s\S]*?<\/button>/;
  if (!themeToggle.test(header)) {
    throw new Error(`Expected the theme toggle in the page header of ${source}.`);
  }
  const fragment = [header.replace(themeToggle, ""), main, ...external].join("\n");
  return `<!-- Built from 3d-ice ${source} by scripts/sync_3d_ice_bundle.mjs; do not edit. -->\n${resolveLinks(fragment, pageUrl, source)}\n`;
}

/**
 * The page's structured data (the app, the site and the FAQ), describing this site's copy:
 * the app and site entries take its address.
 */
function buildStructuredData(html, { source, siteUrl }) {
  const head = html.slice(0, html.indexOf("</head>"));
  const blocks = [...head.matchAll(/<script\b[^>]*\btype=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/g)];
  const declared = (head.match(/application\/ld\+json/g) || []).length;
  if (!blocks.length || blocks.length !== declared) {
    throw new Error(`Expected to read all ${declared} structured-data blocks in the head of ${source}, read ${blocks.length}.`);
  }
  const retargeted = new Set();
  const scripts = blocks.map(([, , json]) => {
    const data = JSON.parse(json);
    const types = [data["@type"]].flat();
    const type = types.find((candidate) => candidate === "WebApplication" || candidate === "WebSite");
    if (type) retargeted.add(type);
    const described = type ? { ...data, url: siteUrl } : data;
    return `<script type="application/ld+json">${JSON.stringify(described).replace(/</g, "\\u003c")}</script>`;
  });
  if (retargeted.size !== 2) {
    throw new Error(`Expected a top-level WebApplication and WebSite in the structured data of ${source}.`);
  }
  return scripts.join("\n");
}

async function writeLandingFragments() {
  await rm(landingRoot, { recursive: true, force: true });
  await mkdir(landingRoot, { recursive: true });
  for (const landing of LANDING_SOURCES) {
    const sourcePath = path.join(generatedRoot, landing.source);
    if (!(await pathExists(sourcePath))) {
      throw new Error(
        `The 3D ICE bundle has no ${landing.source}. Bundles older than the 2026-09-30 home-page rebuild do not carry the home pages.`
      );
    }
    const html = await readFile(sourcePath, "utf8");
    await writeFile(path.join(landingRoot, `${landing.locale}.html`), buildLandingFragment(html, landing));
    await writeFile(path.join(landingRoot, `${landing.locale}.head.html`), `${buildStructuredData(html, landing)}\n`);
  }
  log(`landing page fragments ready at ${landingRoot}`);
}

// ------------------------------------------------------------------ start

async function main() {
  const config = JSON.parse(await readFile(bundleConfigPath, "utf8"));
  const ref = process.env.THREED_ICE_BUNDLE_REF || config.ref;
  const forceSync = process.env.THREED_ICE_FORCE_SYNC === "1";

  const bundleSource =
    (await resolveLocalBundleSource(config)) ||
    (await resolveRemoteBundleSource(config, ref).catch((error) => {
      const localHints = [process.env.THREED_ICE_LOCAL_REPO, ...(config.localRepoCandidates || [])]
        .filter(Boolean)
        .map((candidate) => resolveRepoPath(candidate))
        .filter(Boolean)
        .join(", ");
      throw new Error(
        `Unable to locate a local 3D ICE bundle and remote download failed for ref ${ref}: ${error.message}${
          localHints ? `\nChecked local repo candidates: ${localHints}` : ""
        }`
      );
    }));

  const currentState = await readSyncState();
  const currentToolsDir = path.join(generatedRoot, "tools");
  if (!forceSync && currentState?.sha256 === bundleSource.sha256 && existsSync(currentToolsDir)) {
    log(`bundle ${ref} already synced from ${bundleSource.sourceLabel}`);
    await writeLandingFragments();
    return;
  }

  log(`syncing bundle ${ref} from ${bundleSource.sourceLabel}`);
  await extractBundle(bundleSource.bundlePath);
  await writeSyncState({
    ref,
    sha256: bundleSource.sha256,
    sourceType: bundleSource.sourceType,
    sourceLabel: bundleSource.sourceLabel,
    syncedAt: new Date().toISOString(),
  });
  log(`ready at ${generatedRoot}`);
  await writeLandingFragments();
}

await main();
