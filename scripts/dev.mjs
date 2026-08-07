#!/usr/bin/env node
/**
 * Project-scoped Next.js dev entry for no23-landing.
 *
 * 1) Removes orphaned Next workers that still belong to THIS project
 *    (left behind when a parent `next dev` is hard-killed, e.g. Cursor close).
 * 2) Starts `next dev` and forwards signals so a normal stop tears down
 *    the child tree when possible.
 *
 * Scoping rules:
 * - Kill only PIDs whose command path is under this project's node_modules/next
 *   OR whose cwd is this project root (for `next-server` orphans with no path).
 * - Never match on Next version strings.
 * - Never touch unrelated projects.
 */

import { spawn, spawnSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function sleepMs(ms) {
  spawnSync("sleep", [String(ms / 1000)]);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const nextModulePrefix = path.join(root, "node_modules", "next") + path.sep;

function listProcesses() {
  const out = execFileSync("ps", ["-ax", "-o", "pid=,ppid=,command="], {
    encoding: "utf8",
  });
  const rows = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const m = line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
    if (!m) continue;
    rows.push({
      pid: Number(m[1]),
      ppid: Number(m[2]),
      command: m[3],
    });
  }
  return rows;
}

function processCwd(pid) {
  try {
    const out = execFileSync(
      "lsof",
      ["-a", "-d", "cwd", "-p", String(pid), "-Fn"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const match = out.match(/^n(.*)$/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function isNextServerCommand(command) {
  return (
    /(^|\/)next-server(\s|$)/.test(command) ||
    command.includes("next/dist/server/lib/start-server.js")
  );
}

function belongsToThisProject(proc) {
  if (proc.command.includes(nextModulePrefix) || proc.command.includes(nextBin)) {
    return true;
  }
  // Orphan workers often show only `next-server (vX.Y.Z)` — scope by cwd.
  if (isNextServerCommand(proc.command)) {
    return processCwd(proc.pid) === root;
  }
  return false;
}

function collectOrphans() {
  const procs = listProcesses().filter(belongsToThisProject);
  return [...new Set(procs.map((p) => p.pid))].sort((a, b) => a - b);
}

function killPids(pids) {
  for (const sig of ["SIGTERM", "SIGKILL"]) {
    for (const pid of pids) {
      try {
        process.kill(pid, sig);
      } catch {
        // already gone
      }
    }
    sleepMs(200);
  }
}

function cleanupOrphans() {
  const pids = collectOrphans();
  if (!pids.length) {
    return;
  }
  console.log(
    `[no23-dev] clearing ${pids.length} orphan Next process(es) for ${path.basename(root)}: ${pids.join(", ")}`,
  );
  killPids(pids);
}

function childrenOf(pid) {
  try {
    const out = execFileSync("pgrep", ["-P", String(pid)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out
      .split(/\s+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function collectTree(rootPid) {
  const found = new Set([rootPid]);
  const queue = [rootPid];
  while (queue.length) {
    const cur = queue.shift();
    for (const child of childrenOf(cur)) {
      if (!found.has(child)) {
        found.add(child);
        queue.push(child);
      }
    }
  }
  return [...found];
}

function main() {
  if (!fs.existsSync(nextBin)) {
    console.error(`[no23-dev] Next binary not found at ${nextBin}`);
    process.exit(1);
  }

  cleanupOrphans();

  const args = ["dev", ...process.argv.slice(2)];
  const child = spawn(process.execPath, [nextBin, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    const tree = collectTree(child.pid);
    for (const sig of ["SIGTERM", "SIGKILL"]) {
      for (const pid of tree) {
        try {
          process.kill(pid, sig);
        } catch {
          // gone
        }
      }
      sleepMs(150);
    }
    if (signal) process.exit(signal === "SIGINT" ? 130 : 1);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    // Ensure no stray workers remain from this tree after next exits.
    const leftovers = collectOrphans();
    if (leftovers.length) killPids(leftovers);
    if (signal) process.exit(1);
    process.exit(code ?? 0);
  });
}

main();
