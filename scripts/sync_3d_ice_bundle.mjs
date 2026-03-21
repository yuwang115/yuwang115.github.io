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
}

await main();
