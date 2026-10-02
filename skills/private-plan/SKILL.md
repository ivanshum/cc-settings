---
name: private-plan
description: Plan a larger repository change and split it into small issues with acceptance criteria, dependencies and a reviewable version-control sequence.
---

# private-plan

Read the project's instructions, issue/PR conventions and affected code. Identify
the requested outcomes, existing work and unresolved decisions. Write a parent
plan before implementation for a task with multiple outcomes: boundaries,
alternatives, dependency order and verification. Ask only for material choices
that cannot be inferred; existing approval in the conversation counts.

After agreement, split by independently verifiable behavior, not files. Give each
child a problem, outcome, scope, acceptance criteria and relevant checks. Link
children to their parent and prerequisites. Keep a fix and regression test together;
create separate issues for unrelated improvements.

Use one focused branch/PR per child and atomic commits in the project's format.
Preserve uncommitted work. Independent outcomes target the normal project base;
use native stacks only for dependent outcomes when support is verified. A chain of
PR bases alone is not native stack registration. Inspect actual stack order,
candidate SHAs and checks. Native stack automation can rebase/retarget dependents;
manually chained PRs need explicit retarget/rebase after prerequisite merges.

Merge approval must identify every included PR: an upper native layer can merge
all lower unmerged layers. Select the project's merge method explicitly. Stack
sync/push/submit/link commands can mutate branches or remote PRs; check their
installed-version help and scope before use. Verify state as well as exit codes.
Do not install stack tooling, rewrite shared branches, prune or merge as a side
effect of planning. Report tested behavior separately from documented capability.
Report exact checks and release boundaries.
Creating issues/PRs, pushing, merging and publication require authorization for
that destination; otherwise draft locally. Never publish private project data in
a shared settings repository or add tooling, hooks or permissions as a side effect.
