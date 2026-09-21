import assert from "node:assert/strict";
import { test } from "node:test";
import { contentCandidatesFor } from "./content_candidates.mjs";

test("leaf bundle page", () => {
  assert.deepEqual(contentCandidatesFor("tools/3d-ice/index.html"), [
    "tools/3d-ice/index.md",
    "tools/3d-ice/_index.md",
    "tools/3d-ice.md",
  ]);
});

// Regression: section pages are backed by `_index.md`, so probing only `index.md`
// missed content/tools/_index.md -- a stub at tools/index.html would have shadowed
// this site's Tools landing page undetected.
test("section page is probed via _index.md", () => {
  assert.ok(contentCandidatesFor("tools/index.html").includes("tools/_index.md"));
});

test("site root", () => {
  assert.deepEqual(contentCandidatesFor("index.html"), ["index.md", "_index.md"]);
});

test("standalone html page", () => {
  assert.deepEqual(contentCandidatesFor("tools/legacy.html"), ["tools/legacy.md"]);
});

test("non-html files are never candidates", () => {
  for (const path of ["tools/featured.png", "tools/js/app.js", "tools/data/x.bin", ""]) {
    assert.deepEqual(contentCandidatesFor(path), [], path);
  }
});

test("every candidate stays relative to the content root", () => {
  const paths = ["tools/3d-ice/index.html", "tools/index.html", "index.html", "a/b/c.html"];
  for (const path of paths) {
    for (const candidate of contentCandidatesFor(path)) {
      assert.ok(!candidate.startsWith("/"), candidate);
      assert.ok(!candidate.includes(".."), candidate);
      assert.ok(candidate.endsWith(".md"), candidate);
    }
  }
});
