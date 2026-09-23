# cc-settings-private

A privacy-focused, framework-neutral derivative of cc-settings. Bun is preferred
for new projects. Existing projects keep their package manager and checks.

## What is included

- Portable privacy and engineering instructions.
- Five workflows: private-explore, private-fix, private-review, private-verify,
  and private-ui-review.
- A dependency-free, offline exporter for Codex or Claude project directories.
- Tests for the distribution boundary, collision safety and export contents.

No executable agent hooks, MCP servers, telemetry, remote classifiers, shared
knowledge publication, model routing, background jobs, automatic updates, or
permission overrides are distributed. No runtime downloads or package installs
are performed. The exporter reads only its fixed distribution allowlist.

## Use

Bun must already be installed; this project never installs it for you:

```sh
bun run check
mkdir dist
bun scripts/export.mjs --host codex --out ./dist/codex
bun scripts/export.mjs --host claude --out ./dist/claude
```

Node 22+ can run the same scripts if Bun is unavailable:

```sh
node --test
node scripts/export.mjs --host codex --out ./dist/codex
```

The output directory must not exist, and its parent must already exist.
The commands above create the parent with `mkdir dist`, also available in PowerShell.
The exporter rejects symlink/junction ancestors and never replaces a directory.
It creates a standalone reviewable bundle, not an installation in your home.

Review the generated README and files before adoption:
- Codex: copy the named skill directories into the project's `.agents/skills`.
- Claude: copy the named skill directories into the project's `.claude/skills`.
- Merge the generated AGENTS.md / CLAUDE.md guidance into the project's existing
  instructions. Do not replace approved instructions or copy over existing skills.
- Do not commit client material, prompts, credentials or environment values.

Existing host skills, plugins, settings and permissions remain unchanged. This
package does not disable or sanitize previously installed upstream components.
For a clean evaluation, use a fresh project with reviewed host configuration.

## Tooling choices

Bun is a runtime, package manager and test runner. It is independent of any web
framework or hosting provider. Prefer it for new JS/TS projects; migrate an
existing lockfile only when requested and verify compatibility.

Next.js is optional, not required. It can be self-hosted; choose it only when its
application features justify the operational complexity. Astro is a suitable
option for content-led sites. No hosting vendor is assumed.

Biome combines a formatter, linter and code assistance (such as import sorting).
It is optional. Preserve ESLint/Prettier where already configured; verify language,
framework and rule coverage before any migration. This small distribution needs
no formatter dependency or dependency-install step.

## Privacy boundary

These are instructions to an agent, not an enforced sandbox. Your AI provider
still receives the context you send it, and existing host tools can still use the
network. Read SECURITY.md for exact guarantees and limitations.

Upstream changes are reviewed and ported manually. Do not run old upstream setup
scripts from Git history or install the upstream npm package to update this edition.

## Reference documentation

- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Biome configuration](https://biomejs.dev/guides/configure-biome/)
