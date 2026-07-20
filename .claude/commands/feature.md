---
description: Drives a complete feature end-to-end from a GitHub issue
---

GitHub issue #$ARGUMENTS. Only read the files strictly necessary for this issue — don't explore the whole repo. If you need a file I haven't mentioned, ask for it rather than searching.

1. Summarize the issue, create a dedicated branch. Then /compact — the issue summary is enough for the rest, the raw MCP results don't need to stay in context.
2. Native Plan Mode: implementation plan consistent with SPEC.md and CLAUDE.md. Wait for my approval.
3. Implement. Atomic gitmoji commits. No progress commentary between steps — the code and commits are enough.
4. Corresponding tests (unit + integration if relevant) per CLAUDE.md.
5. Linter + formatter. Fix errors.
6. Full test suite (regression check).
7. Verify: no hard-coded secrets, no leftover logs, .env.example up to date if new variables were added.
8. PR linked to issue #$ARGUMENTS: summary of changes, checklist of what was tested.
9. Recap in 3 lines max and STOP.

Don't launch a review subagent — quality is covered by the linter, tests, and my reading of the PR. In-depth review happens in /audit.

If a step fails, stop and explain the blocker.
