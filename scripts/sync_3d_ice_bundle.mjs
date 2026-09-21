import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentCandidatesFor } from "./lib/content_candidates.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const bundleConfigPath = path.join(repoRoot, "config", "3d-ice-bundle.json");
const generatedRoot = path.join(repoRoot, "generated", "3d-ice-compat");
const syncStatePath = path.join(repoRoot, "generated", ".3d-ice-compat-sync.json");
const remoteCacheRoot = path.join(repoRoot, ".cache", "3d-ice-bundles");
const contentRoot = path.join(repoRoot, "content");

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

// When Hugo runs from a git worktree (`.claude/worktrees/<name>`), `repoRoot` is the
// worktree, so sibling-relative candidates like `../3d-ice` miss the real checkout.
// Resolve them against the main working tree as well.
function mainWorktreeRoot() {
  const result = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    cwd: repoRoot,
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  const commonDir = (result.stdout || "").trim();
  if (!commonDir) return null;
  const root = path.dirname(commonDir);
  return root === repoRoot ? null : root;
}

function resolveRepoPathCandidates(candidate) {
  if (!candidate) return [];
  if (path.isAbsolute(candidate)) return [candidate];
  const bases = [repoRoot, mainWorktreeRoot()].filter(Boolean);
  const resolved = bases.map((base) => path.resolve(base, candidate));
  return [...new Set(resolved)];
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

  for (const bundlePath of resolveRepoPathCandidates(localBundleEnv)) {
    candidates.push({
      label: `env bundle ${bundlePath}`,
      bundlePath,
      checksumPath: `${bundlePath}.sha256`,
    });
  }

  for (const repoPath of resolveRepoPathCandidates(localRepoEnv)) {
    candidates.push({
      label: `env repo ${repoPath}`,
      bundlePath: path.join(repoPath, "dist", assetName),
      checksumPath: path.join(repoPath, "dist", checksumName),
    });
  }

  for (const repoCandidate of config.localRepoCandidates || []) {
    for (const repoPath of resolveRepoPathCandidates(repoCandidate)) {
      candidates.push({
        label: `local repo ${repoPath}`,
        bundlePath: path.join(repoPath, "dist", assetName),
        checksumPath: path.join(repoPath, "dist", checksumName),
      });
    }
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

// The bundle is the whole of 3d-ice's `static/tools`, which includes compat redirect
// stubs that only make sense on the standalone 3d-ice.com site. Mounted here as a
// static source, such a stub sits at the same published path as one of this site's
// own pages and can overwrite it during `hugo --minify`. Drop them on extraction so
// the file never exists on disk for any consumer to pick up.
async function prunePaths(excludePaths) {
  for (const relativePath of excludePaths) {
    const target = path.join(generatedRoot, relativePath);
    // A blank or `../` entry would resolve to the bundle root (or outside it) and
    // delete far more than intended, so refuse it rather than acting on a typo.
    const withinBundle = path.relative(generatedRoot, target);
    if (withinBundle === "" || withinBundle.startsWith("..") || path.isAbsolute(withinBundle)) {
      throw new Error(
        `Invalid "excludePaths" entry ${JSON.stringify(relativePath)} in config/3d-ice-bundle.json: ` +
          `must be a path inside the bundle.`
      );
    }
    if (!(await pathExists(target))) continue;
    await rm(target, { recursive: true, force: true });
    log(`pruned ${relativePath} (would shadow this site's own page)`);
  }
}

async function collectRelativeFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(rootDir, absolutePath)));
      continue;
    }
    files.push(path.relative(rootDir, absolutePath).split(path.sep).join("/"));
  }
  return files;
}

// Guard against upstream adding a new stub we do not know about yet.
async function contentPageFor(publishedPath) {
  for (const candidate of contentCandidatesFor(publishedPath)) {
    if (await pathExists(path.join(contentRoot, candidate))) return `content/${candidate}`;
  }
  return null;
}

async function assertNoShadowedPages() {
  const bundleFiles = await collectRelativeFiles(generatedRoot);
  const collisions = [];
  for (const relativePath of bundleFiles) {
    const contentPage = await contentPageFor(relativePath);
    if (contentPage) collisions.push({ relativePath, contentPage });
  }
  if (collisions.length === 0) return;
  const details = collisions
    .map(({ relativePath, contentPage }) => `  - ${relativePath} shadows ${contentPage}`)
    .join("\n");
  throw new Error(
    `The 3D ICE bundle contains file(s) published at the same path as this site's own page(s):\n${details}\n` +
      `Add the path(s) to "excludePaths" in config/3d-ice-bundle.json so Hugo renders this site's page instead.`
  );
}

async function main() {
  const config = JSON.parse(await readFile(bundleConfigPath, "utf8"));
  const ref = process.env.THREED_ICE_BUNDLE_REF || config.ref;
  const forceSync = process.env.THREED_ICE_FORCE_SYNC === "1";

  const bundleSource =
    (await resolveLocalBundleSource(config)) ||
    (await resolveRemoteBundleSource(config, ref).catch((error) => {
      const localHints = [process.env.THREED_ICE_LOCAL_REPO, ...(config.localRepoCandidates || [])]
        .filter(Boolean)
        .flatMap((candidate) => resolveRepoPathCandidates(candidate))
        .join(", ");
      throw new Error(
        `Unable to locate a local 3D ICE bundle and remote download failed for ref ${ref}: ${error.message}${
          localHints ? `\nChecked local repo candidates: ${localHints}` : ""
        }`
      );
    }));

  const currentState = await readSyncState();
  const currentToolsDir = path.join(generatedRoot, "tools");
  const alreadySynced =
    !forceSync && currentState?.sha256 === bundleSource.sha256 && existsSync(currentToolsDir);

  if (alreadySynced) {
    log(`bundle ${ref} already synced from ${bundleSource.sourceLabel}`);
  } else {
    log(`syncing bundle ${ref} from ${bundleSource.sourceLabel}`);
    await extractBundle(bundleSource.bundlePath);
  }

  // Enforced on every run, not just a fresh extraction: `excludePaths` and this site's
  // own content can both change while the extracted bundle stays byte-identical.
  await prunePaths(config.excludePaths || []);
  await assertNoShadowedPages();

  if (!alreadySynced) {
    await writeSyncState({
      ref,
      sha256: bundleSource.sha256,
      sourceType: bundleSource.sourceType,
      sourceLabel: bundleSource.sourceLabel,
      syncedAt: new Date().toISOString(),
    });
    log(`ready at ${generatedRoot}`);
  }
}

await main();
