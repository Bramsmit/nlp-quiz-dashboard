import { spawn } from "node:child_process";

const processes = [
  spawn("node", ["server/ai-server.mjs"], { stdio: "inherit" }),
  spawn("npm", ["run", "dev"], { stdio: "inherit" }),
];

function shutdown() {
  for (const child of processes) {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
