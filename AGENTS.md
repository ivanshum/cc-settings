# Privacy-focused settings development

Read README.md and SECURITY.md before changes. This repository distributes instructions, not a security sandbox.
Use Bun for development when available. Node 22+ is a supported fallback; there are no dependencies to install.
Run `bun run check` (or `node --test`) after implementation changes.
Keep scripts dependency-free, offline, and free of subprocess execution.
Never install hooks, MCP servers, schedulers, permission overrides, or remote processing by default.
Retain the MIT notice and the upstream attribution in NOTICE.md.
Never include user/project data in distributed files. Tests use synthetic fixtures.
Preserve project-local instructions and tooling. No required framework, hosting provider, model, or formatter.
