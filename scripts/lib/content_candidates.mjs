// Maps a published path back to the `content/` files Hugo could have rendered it from.
//
// Used to detect a file in the mounted 3D ICE bundle that would sit at the same
// published path as one of this site's own pages. Returns every plausible source,
// relative to the content root, for the caller to probe:
//
//   "tools/3d-ice/index.html" -> tools/3d-ice/index.md, tools/3d-ice/_index.md, tools/3d-ice.md
//   "tools/index.html"        -> tools/index.md, tools/_index.md, tools.md
//   "index.html"              -> index.md, _index.md
//   "tools/legacy.html"       -> tools/legacy.md
//
// `_index.md` matters because Hugo drives section pages from it, never `index.md` --
// a directory with children cannot also be a leaf bundle. `content/tools/_index.md`
// backs this site's Tools landing page, directly under the bundle's mount point.
//
// A page that overrides its published path with front-matter `slug`/`url` is not
// discoverable this way; scripts/check_build_output.mjs inspects the real build
// output and covers that case.
export function contentCandidatesFor(publishedPath) {
  if (!publishedPath.endsWith(".html")) return [];

  if (publishedPath === "index.html") {
    return ["index.md", "_index.md"];
  }

  if (publishedPath.endsWith("/index.html")) {
    const base = publishedPath.slice(0, -"/index.html".length);
    if (base === "") return [];
    return [`${base}/index.md`, `${base}/_index.md`, `${base}.md`];
  }

  return [`${publishedPath.slice(0, -".html".length)}.md`];
}
