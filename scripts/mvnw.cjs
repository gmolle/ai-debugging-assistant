/**
 * Run Maven Wrapper from backend/ (cross-platform: mvnw.cmd on Windows, ./mvnw elsewhere).
 * Usage: node scripts/mvnw.cjs [maven-args...]
 */
const { spawnSync } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const isWin = process.platform === "win32";
const mvn = isWin ? "mvnw.cmd" : "./mvnw";
const args = process.argv.slice(2);

const result = spawnSync(mvn, args, {
  cwd: backendDir,
  stdio: "inherit",
  shell: isWin,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
