# Privacy and security boundary

## Implemented

The active distribution contains Markdown instructions and one offline exporter.
The exporter uses only Node filesystem/path primitives and fixed filenames.
It has no dependencies, subprocess calls, HTTP client, dynamic code evaluation,
environment-variable collection, home-directory discovery or credential reads.

It does not configure hooks, MCP, remote control, permissions, model routing,
scheduled tasks or auto-update. It does not read the project being worked on.
Output is written only to a new explicitly selected directory. Existing targets
and symlink/junction ancestors are rejected.

The tests check the active file inventory and critical export behavior. They
are regression guards, not proof that arbitrary future code is trustworthy.

## Not guaranteed

Instructions cannot prevent an agent from making a mistake. They do not enforce
network isolation or replace host sandbox/approval controls. The configured AI
provider still handles conversation context under its own policies. Tools already
installed in the host retain their access; exporting these files does not revoke it.

Output-parent validation is not protection against a malicious concurrent process
with write access racing filesystem changes. Use a directory you control.
Temporary output may remain after a filesystem failure; inspect it before reuse.
The exporter never recursively deletes directories for cleanup.

Local notes, repository history, logs and exported bundles may be read by other
accounts or programs according to filesystem permissions. Use appropriate access
controls and disk encryption for sensitive work.

## Optional network work

Browsing, dependency installation, publishing and external tools require the
user's task authorization and the host's normal approval mechanisms.
Never include private source, client names, prompts, logs, secrets or internal
URLs in external queries without specific authorization for that data and recipient.
Public documentation lookups should use generic, non-sensitive queries.
No shared memory or learning publication is enabled by this package.

## Updates and reporting

Pin the commit you review. Compare changes locally before updating; there is no
automatic updater. Do not include credentials or private project data in public
bug reports. Review code as well as documentation before trusting a new release.
