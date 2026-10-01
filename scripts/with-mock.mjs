// Runs a command while the mock API is up (needed for build-time fetches in SSG/ISR).
// Usage: node scripts/with-mock.mjs <command> [...args]
import { spawn } from "node:child_process";

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("usage: with-mock.mjs <command> [...args]");
  process.exit(1);
}

async function isUp() {
  try {
    const r = await fetch("http://localhost:4000/__stats");
    return r.ok;
  } catch {
    return false;
  }
}

let mock = null;
if (!(await isUp())) {
  mock = spawn(process.execPath, ["mock-api/server.mjs"], { stdio: "inherit" });
  for (let i = 0; i < 50 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 100));
}

const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => {
  mock?.kill();
  process.exit(code ?? 1);
});
