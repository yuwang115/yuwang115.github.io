import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceHtmlPath = path.join(repoRoot, "public", "tools", "3d-ice", "index.html");
const targetRepoRoot = path.resolve(repoRoot, "..", "3d-ice");
const targetRootIndexPath = path.join(targetRepoRoot, "static", "index.html");
const targetRedirectIndexPath = path.join(targetRepoRoot, "static", "tools", "3d-ice", "index.html");

const SOURCE_SITE_ORIGIN = "https://yuwang.blog";
const STANDALONE_SITE_URL = "https://yuwang115.github.io/3d-ice/";

function replaceRequired(html, pattern, replacement, label) {
  const nextHtml = html.replace(pattern, replacement);
  if (nextHtml === html) {
    throw new Error(`Could not find expected ${label} in generated Hugo page.`);
  }
  return nextHtml;
}

function rewriteStandaloneHtml(html) {
  let nextHtml = html;

  nextHtml = replaceRequired(
    nextHtml,
    /(<div class="page-header sticky top-0 z-30">)\s*<header[\s\S]*?<\/header>/,
    "$1",
    "top navigation header"
  );

  if (!nextHtml.includes("homeLocaleSwitcher")) {
    nextHtml = replaceRequired(
      nextHtml,
      /(<nav class="?explorer-page-breadcrumb"?[\s\S]*?<\/nav>)\s*(<header>)/,
      '<div class="explorer-page-topbar">$1<div id=homeLocaleSwitcher class=explorer-home-locale-switcher></div></div>$2',
      "home locale switcher mount"
    );
  }

  if (!nextHtml.includes("3d-ice-home.css")) {
    nextHtml = replaceRequired(
      nextHtml,
      /<\/head>/,
      '<link href=./css/3d-ice-home.css rel=stylesheet></head>',
      "standalone locale stylesheet"
    );
  }

  if (!nextHtml.includes("3d-ice-locale.js")) {
    nextHtml = replaceRequired(
      nextHtml,
      /<\/head>/,
      '<script src=./js/3d-ice-locale.js></script></head>',
      "standalone locale script"
    );
  }

  nextHtml = nextHtml.replace(
    /<link rel=alternate hreflang=en-us href=https:\/\/yuwang\.blog\/tools\/3d-ice\/>/,
    `<link rel=alternate hreflang=en-us href=${STANDALONE_SITE_URL}>`
  );
  nextHtml = nextHtml.replace(
    /<link rel=canonical href=https:\/\/yuwang\.blog\/tools\/3d-ice\/>/,
    `<link rel=canonical href=${STANDALONE_SITE_URL}>`
  );
  nextHtml = nextHtml.replace(
    /<meta property="og:url" content="https:\/\/yuwang\.blog\/tools\/3d-ice\/">/,
    `<meta property="og:url" content="${STANDALONE_SITE_URL}">`
  );

  // Keep Hugo site assets on yuwang.blog, but point 3D ICE runtime/media/logo paths to this repo.
  nextHtml = nextHtml.replace(/href=\/tools\/#tools-demo/g, `href=${SOURCE_SITE_ORIGIN}/tools/#tools-demo`);
  nextHtml = nextHtml.replace(/href=\/tools\/(?=[\s>])/g, `href=${SOURCE_SITE_ORIGIN}/tools/`);
  nextHtml = nextHtml.replace(/([("'=])\/tools\//g, "$1./tools/");
  nextHtml = nextHtml.replace(/([("'=])\/(?!tools\/)([^"'()<> ]+)/g, `$1${SOURCE_SITE_ORIGIN}/$2`);
  nextHtml = nextHtml.replace(/([("'=])\/(?=["' >])/g, `$1${SOURCE_SITE_ORIGIN}/`);
  nextHtml = nextHtml.replace(/ integrity="[^"]+"/g, "");

  // Make the standalone landing page self-identify as the project entry point.
  nextHtml = nextHtml.replace(
    /<meta property="og:site_name" content="Yu Wang \| Antarctic Researcher">/,
    '<meta property="og:site_name" content="3D ICE">'
  );
  nextHtml = nextHtml.replace(
    /"url":"https:\/\/yuwang\.blog\/"/g,
    `"url":"${SOURCE_SITE_ORIGIN}/"`
  );
  nextHtml = nextHtml.replace(
    /"url":"https:\/\/yuwang\.blog\/tools\/3d-ice\/"/g,
    `"url":"${STANDALONE_SITE_URL}"`
  );

  if (!nextHtml.includes('initPage({locale:"en-US",switchers:["#homeLocaleSwitcher"]})')) {
    nextHtml = replaceRequired(
      nextHtml,
      /<\/body>/,
      '<script>(()=>{const e=()=>{const l=window.__3dIceLocale;if(!l)return;l.initPage({locale:"en-US",switchers:["#homeLocaleSwitcher"]})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()})()</script></body>',
      "standalone locale init"
    );
  }

  return nextHtml;
}

const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=../../" />
    <title>Redirecting to 3D ICE</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      window.location.replace(new URL("../../", window.location.href).toString());
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="../../">3D ICE</a>…</p>
  </body>
</html>
`;

const sourceHtml = await fs.readFile(sourceHtmlPath, "utf8").catch((error) => {
  throw new Error(`Could not read ${sourceHtmlPath}. Run \`npm run build\` first.\n${error.message}`);
});

await fs.access(targetRepoRoot).catch((error) => {
  throw new Error(`Could not find sibling 3d-ice repo at ${targetRepoRoot}.\n${error.message}`);
});

const standaloneHtml = rewriteStandaloneHtml(sourceHtml);

await fs.writeFile(targetRootIndexPath, standaloneHtml);
await fs.writeFile(targetRedirectIndexPath, redirectHtml);

console.log(`[3d-ice export] wrote standalone landing page to ${targetRootIndexPath}`);
console.log(`[3d-ice export] wrote /tools/3d-ice/ redirect to ${targetRedirectIndexPath}`);
