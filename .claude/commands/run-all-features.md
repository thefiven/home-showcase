---
description: Chains through open GitHub issues' features, in numeric order, with a pause between each
---

List open GitHub issues sorted by ascending number. Display the list before starting.

For each issue, in order. Only read the files needed for the current issue — don't explore the whole repo:

1. Summarize the issue, create a dedicated branch. Then /compact to flush the raw MCP results.
2. Native Plan Mode: plan consistent with SPEC.md and CLAUDE.md. Wait for my approval.
3. Implement. Atomic gitmoji commits. No unnecessary progress commentary.
4. Corresponding tests.
5. Linter + formatter, fix errors.
6. Full test suite (regression check).
7. Verify: no hard-coded secrets, no leftover logs, .env.example up to date.
8. PR linked to the issue: summary + checklist.
9. Recap in 3 lines max and STOP — wait for my explicit confirmation before the next issue.
10. On my confirmation: /clear before starting the next issue. SPEC.md and CLAUDE.md will be reread automatically.

Don't launch a review subagent — in-depth review is in /audit.

If a step fails, stop immediately and explain the blocker.
