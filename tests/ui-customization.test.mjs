import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../resources/index.html", import.meta.url), "utf8");

test("unified UI customization entry and accessible dialog exist", () => {
  assert.match(html, /id="openUiStudio"/);
  assert.match(html, /id="uiStudioBackdrop"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  for (const id of ["closeUiStudio", "doneUiStudio", "resetUiStudio"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
});

test("theme, layout, navigation, typography and color tokens are configurable", () => {
  for (const theme of ["editorial", "graphite", "ocean", "midnight", "terracotta", "classic"]) {
    assert.match(html, new RegExp('data-theme="' + theme + '"'));
  }
  for (const id of ["uiAccent", "uiBackground", "uiSurface", "uiText", "uiBorder", "uiNavSurface", "uiLayout", "uiNav", "uiFont"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  for (const layout of ["balanced", "vertical", "compact", "bento", "split"]) {
    assert.match(html, new RegExp('data-layout="' + layout + '"'));
  }
  for (const nav of ["top", "right", "bottom", "floating", "hidden"]) {
    assert.match(html, new RegExp('data-nav="' + nav + '"'));
  }
});

test("Motion Lab includes six previewable effects and tuning controls", () => {
  for (const motion of ["fade-up", "spring", "slide", "blur", "stagger", "orbit"]) {
    assert.match(html, new RegExp('data-motion="' + motion + '"'));
    assert.match(html, new RegExp('"?' + motion + '"?\\s*:\\['));
  }
  for (const id of ["uiMotionPreview", "replayUiMotion", "uiMotionIntensity", "uiMotionDuration"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /--card-index/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /data-low-motion="true"/);
});

test("preferences persist locally and can be reset without changing resource data", () => {
  assert.match(html, /davylab-resourcehub-ui:v1/);
  assert.match(html, /localStorage\.setItem\(KEY/);
  assert.match(html, /resetUiStudio/);
  assert.match(html, /restoreNavButton/);
});

test("inline JavaScript parses", () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0, "expected inline application script");
  for (const [, source] of scripts) {
    assert.doesNotThrow(() => new Function(source));
  }
});
