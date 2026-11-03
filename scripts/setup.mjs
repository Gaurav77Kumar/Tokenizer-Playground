/**
 * One-time setup: creates the Python venv, installs backend requirements,
 * and installs frontend npm packages.
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const isWindows = process.platform === "win32";
const venvPython = join(root, "backend", ".venv", isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python");

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: isWindows, cwd: root, ...options });
  if (result.status !== 0) {
    console.error(`Command failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log("== Tokenizer Playground setup ==\n");

if (!existsSync(venvPython)) {
  run("python", ["-m", "venv", join("backend", ".venv")]);
} else {
  console.log("Backend venv already exists — skipping creation.");
}

run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "-r", join("backend", "requirements.txt")]);
run("npm", ["install", "--no-audit", "--no-fund"], { cwd: join(root, "frontend") });

console.log("\n Setup complete. Start everything with: npm run dev");
console.log("   Backend:  http://localhost:8000  (API docs at /docs)");
console.log("   Frontend: http://localhost:3000");
console.log("\nNote: on first launch the backend downloads tokenizer files (~10 MB total).");
