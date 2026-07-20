---
description: Sets up dev tooling (CI, lint, hooks, env) before features
---

Read SPEC.md and CLAUDE.md for the stack. Don't explore the rest of the repo.

Set up:

1. Linter + formatter suited to the stack, config versioned.
2. Pre-commit hooks (lint + format + fast tests) via husky/lefthook or equivalent.
3. GitHub Actions: CI lint + tests + build on every PR.
4. .env.example documenting the env variables. Verify .env is in .gitignore.
5. Dependabot for security updates.
6. Branch protection on main: PR required, green CI required.
7. Folder structure matching SPEC.md.

Plan before executing. Gitmoji commits.
