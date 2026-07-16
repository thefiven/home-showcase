---
description: Met en place l'outillage de dev (CI, lint, hooks, env) avant les features
---

Lis SPEC.md et CLAUDE.md pour le stack. N'explore pas le reste du repo.

Mets en place :

1. Linter + formatter adaptés au stack, config versionnée.
2. Pre-commit hooks (lint + format + tests rapides) via husky/lefthook ou équivalent.
3. GitHub Actions : CI lint + tests + build sur chaque PR.
4. .env.example documentant les variables d'env. Vérifie que .env est dans .gitignore.
5. Dependabot pour les mises à jour de sécurité.
6. Branch protection sur main : PR obligatoire, CI verte requise.
7. Structure de dossiers conforme à SPEC.md.

Plan avant exécution. Commits gitmoji.
