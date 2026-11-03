/**
 * One-command dev start: runs the FastAPI backend and Next.js frontend
 * together
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const isWindows = process.platform === "win32";
const pythonDir = isWindows ? "Scripts" : "bin";
const pythonExe = isWindows ? "python.exe" : "python";
const venvPython = join(root, "backend", ".venv", pythonDir, pythonExe);
const backendOnly = process.argv.includes("--backend-only");
const frontendOnly = process.argv.includes("--frontend-only");

if (!existsSync(venvPython)) {
  console.error("Backend venv not found. Run `npm run setup` first.");
  process.exit(1);
}

const children = [];

function start(name, color, command, args, cwd, useShell) {
  console.log(`[${name}] starting…`);
  const child = spawn(command, args, {
    cwd,
    // shell only for npm (a .cmd on Windows); a direct exe path keeps
    // spaces in the venv path from being split by cmd.
    shell: useShell,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  child.stdout.on("data", (data) => process.stdout.write(`\x1b[${color}m[${name}]\x1b[0m ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`\x1b[${color}m[${name}]\x1b[0m ${data}`));
  child.on("exit", (code) => {
    if (code !== null && code !== 0) console.error(`[${name}] exited with code ${code}`);
  });
  children.push(child);
}

if (!frontendOnly) {
  start("api", "36", venvPython, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], join(root, "backend"), false);
}
if (!backendOnly) {
  start("web", "32", "npm", ["run", "dev"], join(root, "frontend"), isWindows);
}

console.log("\n  API   → http://localhost:8000  (docs at /docs)");
console.log("  Web   → http://localhost:3000\n  Ctrl+C stops both.\n");

const shutdown = () => {
  for (const child of children) {
    try {
      child.kill();
    } catch {
      // already gone
    }
  }
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
