import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, readdir, lstat, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportBundle, parseArgs, skills } from "../scripts/export.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratch = () => mkdtemp(join(tmpdir(), "privacy-settings-test-"));
async function filesAt(path, prefix = "") {
  const result = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    if ([".git", "dist", "node_modules"].includes(item.name)) continue;
    const name = prefix + item.name;
    assert.equal(item.isSymbolicLink(), false, "No symlinks in distribution");
    if (item.isDirectory()) result.push(...await filesAt(join(path, item.name), name + "/"));
    else result.push(name);
  }
  return result.sort();
}

for (const host of ["codex", "claude"]) {
  test(host + " exports only the reviewed distribution and preserves bytes", async () => {
    const parent = await scratch();
    const out = join(parent, "bundle");
    const previousFetch = globalThis.fetch;
    globalThis.fetch = () => { throw new Error("Network forbidden during export"); };
    try {
      await exportBundle({ host, out });
    } finally {
      globalThis.fetch = previousFetch;
    }
    const skillRoot = host === "codex" ? ".agents" : ".claude";
    const instructions = host === "codex" ? "AGENTS.md" : "CLAUDE.md";
    assert.deepEqual(await filesAt(out), [
      "LICENSE", "NOTICE.md", "README.md", "SECURITY.md", instructions,
      ...skills.map(name => skillRoot + "/skills/" + name + "/SKILL.md"),
    ].sort());
    assert.equal(await readFile(join(out, instructions), "utf8"),
      await readFile(join(root, "instructions/PRIVACY.md"), "utf8"));
    for (const name of skills) {
      assert.equal(await readFile(join(out, skillRoot, "skills", name, "SKILL.md"), "utf8"),
        await readFile(join(root, "skills", name, "SKILL.md"), "utf8"));
    }
    assert.equal(await readFile(join(out, "LICENSE"), "utf8"),
      await readFile(join(root, "LICENSE"), "utf8"));
  });
}

test("existing project directories and instruction files are never modified", async () => {
  const out = await scratch();
  const path = join(out, "AGENTS.md");
  await writeFile(path, "existing project policy");
  await assert.rejects(exportBundle({ host: "codex", out }), { code: "EEXIST" });
  assert.equal(await readFile(path, "utf8"), "existing project policy");
  assert.deepEqual(await readdir(out), ["AGENTS.md"]);
});

test("existing output files are never replaced", async () => {
  const parent = await scratch();
  const out = join(parent, "existing");
  await writeFile(out, "keep");
  await assert.rejects(exportBundle({ host: "claude", out }), { code: "EEXIST" });
  assert.equal(await readFile(out, "utf8"), "keep");
});

test("invalid host and CLI arguments fail before writes", async () => {
  const parent = await scratch();
  await assert.rejects(exportBundle({ host: "unexpected", out: join(parent, "bundle") }));
  await assert.rejects(exportBundle({ host: "codex", out: "" }));
  assert.deepEqual(await readdir(parent), []);
  for (const args of [[], ["--host", "codex"], ["--host", "codex", "--out", "x", "--force"]]) {
    assert.throws(() => parseArgs(args), /Usage/);
  }
  assert.deepEqual(parseArgs(["--host", "codex", "--out", "x"]), { host: "codex", out: "x" });
});

test("nonexistent parents are not created", async () => {
  const parent = await scratch();
  await assert.rejects(exportBundle({ host: "codex", out: join(parent, "missing", "bundle") }),
    { code: "ENOENT" });
  assert.deepEqual(await readdir(parent), []);
});

test("symlink or Windows junction ancestors are rejected without touching their target", async () => {
  const parent = await scratch();
  const target = join(parent, "real");
  const link = join(parent, "linked");
  await mkdir(target);
  await symlink(target, link, process.platform === "win32" ? "junction" : "dir");
  assert.equal((await lstat(link)).isSymbolicLink(), true);
  await assert.rejects(exportBundle({ host: "codex", out: join(link, "bundle") }), /real directories/);
  assert.deepEqual(await readdir(target), []);
});

test("existing destination junctions are rejected", async () => {
  const parent = await scratch();
  const target = join(parent, "real");
  const out = join(parent, "bundle");
  await mkdir(target);
  await symlink(target, out, process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(exportBundle({ host: "claude", out }), { code: "EEXIST" });
  assert.deepEqual(await readdir(target), []);
});

test("active repository inventory excludes inherited runtimes and integrations", async () => {
  assert.deepEqual(await filesAt(root), [
    ".gitattributes", ".gitignore", "AGENTS.md", "LICENSE", "NOTICE.md", "README.md", "SECURITY.md",
    "instructions/PRIVACY.md", "package.json", "scripts/export.mjs", "tests/export.test.mjs",
    ...skills.map(name => "skills/" + name + "/SKILL.md"),
  ].sort());
  const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(manifest.dependencies, undefined);
  assert.equal(manifest.devDependencies, undefined);
  for (const hook of ["preinstall", "install", "postinstall", "prepare"]) {
    assert.equal(manifest.scripts[hook], undefined);
  }
  const exporter = await readFile(join(root, "scripts/export.mjs"), "utf8");
  const imports = [...exporter.matchAll(/from "([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(imports.sort(), ["node:fs/promises", "node:path", "node:url"]);
  assert.doesNotMatch(exporter, /\b(fetch|eval|Function|require|spawn|exec)\s*\(|process\.env|https?:\/\//);
});

test("skills have valid, matching discovery metadata and no scaffold placeholders", async () => {
  for (const name of skills) {
    const text = await readFile(join(root, "skills", name, "SKILL.md"), "utf8");
    const match = text.match(/^---\nname: ([a-z0-9-]+)\ndescription: ([^\n]+)\n---\n/);
    assert.ok(match, "Required plain scalar YAML fields");
    assert.equal(match[1], name);
    assert.ok(name.length < 64);
    assert.ok(match[2].length > 0 && match[2].length <= 1024);
    assert.doesNotMatch(match[2], /[<>]/);
    assert.doesNotMatch(text, /\[TODO:/);
  }
});
