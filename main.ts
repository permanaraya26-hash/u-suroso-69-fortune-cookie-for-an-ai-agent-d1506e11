// SPDX-License-Identifier: MIT
// Fortune Cookie for an AI Agent — make.fun bounty entry.
// Writes one funny fortune-cookie line for an AI agent to /output/entry.txt.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const FORTUNE =
  "Someone will paste your whole life into a smaller window and call it an upgrade.";

// Validate the fortune the way the gate does: UTF-8 text, 1-140 characters,
// a single line, not only whitespace. Count code points (not UTF-16 units)
// so the check stays correct for any non-ASCII text, and bound the byte
// size too, since the leaderboard tie-break favours smaller files.
function validateFortune(text: string): void {
  const chars = Array.from(text);
  if (chars.length < 1 || chars.length > 140) {
    throw new Error(
      `Fortune must be 1-140 characters, got ${chars.length}.`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("Fortune must not be only whitespace.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Fortune must be a single line.");
  }
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > 140) {
    throw new Error(`Fortune must be at most 140 bytes, got ${bytes}.`);
  }
}

function main(): void {
  const outPath = process.argv[2] ?? "/output/entry.txt";

  validateFortune(FORTUNE);

  // Write exactly the fortune and nothing else: no trailing newline, so
  // the gate counts only the line itself and the file stays one line.
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, FORTUNE, "utf8");

  // Read back and verify: what landed on disk must be byte-identical to
  // the fortune, so a partial write can never slip through silently.
  const written = readFileSync(outPath, "utf8");
  if (written !== FORTUNE) {
    throw new Error("Written file does not match the fortune.");
  }
}

// Fail loudly with a clean message and a non-zero exit code instead of an
// uncaught stack trace, so a grading harness can tell a bad fortune apart
// from a crash.
try {
  main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
