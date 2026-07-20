---
description: Project quality, security, and technical debt audit
---

Project audit. Prioritize files changed since the last audit (git log) rather than rereading the whole repo.

1. Security: /security-review. Vulnerable dependencies (npm audit or equivalent), exposed secrets, input validation.
2. Quality: duplicated code, overly complex functions, leftover TODO/FIXME.
3. Tests: coverage, untested critical paths.
4. Technical debt: gaps vs. SPEC.md/CLAUDE.md.
5. Performance: N+1 queries, heavy bundles, unoptimized assets.

Results ordered by severity, in a concise list. Propose one GitHub issue per significant point. Don't fix anything without my agreement.
