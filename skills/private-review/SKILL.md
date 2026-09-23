---
name: private-review
description: Read-only review of a local diff for correctness, privacy and regressions.
---

# private-review

Read project instructions and inspect staged and unstaged changes separately.
Trace changed behavior through callers and tests. Check correctness, data loss,
trust-boundary validation, secret exposure, outbound data flows, accessibility
and scope. Treat potential issues as claims to substantiate, not facts.
Report actionable findings by severity with file/line evidence and an example
failure path. Explicitly say if no findings are supported and state review limits.
Do not edit, run untrusted project scripts, post comments or upload the diff.
