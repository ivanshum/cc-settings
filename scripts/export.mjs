import { mkdir, lstat, readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const skills = Object.freeze([
  "private-plan", "private-explore", "private-fix", "private-review", "private-verify", "private-ui-review",
]);
const root = fileURLToPath(new URL("../", import.meta.url));

async function requireRealDirectory(path) {
  const absolute = resolve(path);
  let current = parse(absolute).root;
  const parts = absolute.slice(current.length).split(/[\\/]/).filter(Boolean);
  for (const part of parts) {
    current = join(current, part);
    const stat = await lstat(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error("Output parent must contain only real directories.");
    }
  }
}

export async function exportBundle({ host, out }) {
  if (!["codex", "claude"].includes(host)) throw new Error("Host must be codex or claude.");
  if (typeof out !== "string" || !out.trim()) throw new Error("An explicit output directory is required.");
  const destination = resolve(out);
  await requireRealDirectory(dirname(destination));
  // Read the fixed distribution before making any filesystem changes.
  const entries = [
    ["LICENSE", "LICENSE"], ["NOTICE.md", "NOTICE.md"], ["SECURITY.md", "SECURITY.md"],
    ["instructions/PRIVACY.md", host === "codex" ? "AGENTS.md" : "CLAUDE.md"],
    ...skills.map((name) => [
      `skills/${name}/SKILL.md`,
      `${host === "codex" ? ".agents" : ".claude"}/skills/${name}/SKILL.md`,
    ]),
  ];
  const contents = await Promise.all(entries.map(async ([source, target]) => [
    target, await readFile(join(root, source), "utf8"),
  ]));
  // Non-recursive mkdir exclusively reserves a new destination; no overwrite.
  await mkdir(destination);
  for (const [target, content] of contents) {
    const path = join(destination, target);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, { flag: "wx" });
  }
  await writeFile(join(destination, "README.md"),
    `# Reviewed project bundle for ${host}\n\nReview SECURITY.md first. Merge the instruction file into existing project\ninstructions; never overwrite them. Copy only the private-* skill directories\ninto the matching project skills directory after checking for collisions.\nNo host settings, permissions, plugins or network configuration are included.\nThis bundle does not remove previously installed components.\n`,
    { flag: "wx" });
  return destination;
}

export function parseArgs(args) {
  if (args.length !== 4 || args[0] !== "--host" || args[2] !== "--out") {
    throw new Error("Usage: bun scripts/export.mjs --host codex|claude --out <new-directory>");
  }
  return { host: args[1], out: args[3] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await exportBundle(parseArgs(process.argv.slice(2)));
    console.log(`Exported reviewable bundle: ${result}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Export failed.");
    process.exitCode = 1;
  }
}
