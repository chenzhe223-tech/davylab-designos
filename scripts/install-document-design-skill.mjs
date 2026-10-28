#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const source = path.join(repoRoot, ".agents", "skills", "document-design-layout-qa");
const codexHome = process.env.CODEX_HOME ? path.resolve(process.env.CODEX_HOME) : path.join(os.homedir(), ".codex");
const target = path.join(codexHome, "skills", "document-design-layout-qa");
const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

if (!fs.existsSync(path.join(source, "SKILL.md"))) {
  console.error("Skill source not found: " + source);
  process.exit(2);
}
if (fs.existsSync(target) && !force) {
  console.error("Target already exists: " + target);
  console.error("Review the target first, then rerun with --force to replace it.");
  process.exit(2);
}
console.log("Source: " + source);
console.log("Target: " + target);
console.log("Mode: " + (dryRun ? "dry run" : force ? "replace existing skill" : "install new skill"));
if (dryRun) process.exit(0);
fs.mkdirSync(path.dirname(target), { recursive: true });
if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
if (!fs.existsSync(path.join(target, "SKILL.md"))) {
  console.error("Install verification failed: SKILL.md missing at target.");
  process.exit(1);
}
console.log("Installed and verified: " + path.join(target, "SKILL.md"));
console.log("Restart or refresh the Codex session if the skill does not appear immediately.");
