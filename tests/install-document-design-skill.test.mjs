import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("global skill installer dry-run reports source and target without writing", () => {
  const result = spawnSync(process.execPath, ["scripts/install-document-design-skill.mjs", "--dry-run"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /document-design-layout-qa/);
  assert.match(result.stdout, /dry run/);
});
