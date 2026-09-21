// Post-build sanity check for pages that a mounted static source could overwrite.
//
// `config/_default/module.yaml` mounts the gitignored `generated/3d-ice-compat` bundle
// as a static source. Hugo copies static files concurrently with rendering pages, so a
// bundle file sharing a published path with one of this site's pages can win that race
// and replace the rendered page -- silently, and only on some builds. This asserts the
// real output instead of trusting the mount, so the failure cannot reach production.
//
// Usage: node scripts/check_build_output.mjs [publishDir]
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const checksConfigPath = path.join(repoRoot, "config", "build-checks.json");

function log(message) {
  process.stdout.write(`[build check] ${message}\n`);
}

async function checkPage(publishRoot, page) {
  const { path: relativePath, minBytes = 0, mustContain = [] } = page;
  const absolutePath = path.join(publishRoot, relativePath);
  const problems = [];

  let details;
  try {
    details = await stat(absolutePath);
  } catch {
    return [`${relativePath}: missing from the build output`];
  }
  if (!details.isFile()) {
    return [`${relativePath}: expected a file, found a directory`];
  }
  if (details.size < minBytes) {
    problems.push(
      `${relativePath}: ${details.size} bytes, expected at least ${minBytes} ` +
        `(a static file from a mounted bundle probably overwrote the rendered page)`
    );
  }
  if (mustContain.length > 0) {
    const contents = await readFile(absolutePath, "utf8");
    const missing = mustContain.filter((needle) => !contents.includes(needle));
    for (const needle of missing) {
      problems.push(`${relativePath}: does not contain expected marker ${JSON.stringify(needle)}`);
    }
  }
  return problems;
}

async function main() {
  const config = JSON.parse(await readFile(checksConfigPath, "utf8"));
  const publishDir = process.argv[2] || config.publishDir || "public";
  const publishRoot = path.isAbsolute(publishDir) ? publishDir : path.resolve(repoRoot, publishDir);

  try {
    const details = await stat(publishRoot);
    if (!details.isDirectory()) throw new Error("not a directory");
  } catch {
    throw new Error(`Publish directory ${publishRoot} does not exist. Run a Hugo build first.`);
  }

  const pages = config.pages || [];
  const problems = (await Promise.all(pages.map((page) => checkPage(publishRoot, page)))).flat();

  if (problems.length > 0) {
    throw new Error(
      `Build output failed ${problems.length} check(s) in ${publishRoot}:\n` +
        problems.map((problem) => `  - ${problem}`).join("\n")
    );
  }

  log(`${pages.length} page(s) verified in ${publishRoot}`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`[build check] ${error.message}\n`);
  process.exit(1);
}
