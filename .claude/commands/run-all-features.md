---
description: Enchaîne les features des issues GitHub ouvertes, dans l'ordre numérique, avec pause entre chaque
---

Liste les issues GitHub ouvertes triées par numéro croissant. Affiche la liste avant de commencer.

Pour chaque issue, dans l'ordre. Ne lis que les fichiers nécessaires à l'issue en cours — n'explore pas le repo entier :

1. Résume l'issue, crée une branche dédiée. Puis /compact pour flush les résultats MCP.
2. Plan Mode natif : plan cohérent avec SPEC.md et CLAUDE.md. Attends ma validation.
3. Implémente. Commits atomiques gitmoji. Pas de commentaire de progression superflu.
4. Tests correspondants.
5. Linter + formatter, corrige les erreurs.
6. Suite de tests complète (anti-régression).
7. Vérifie : pas de secret en dur, pas de log oublié, .env.example à jour.
8. PR liée à l'issue : résumé + checklist.
9. Récapitule en 3 lignes max et STOP — attends ma confirmation explicite avant l'issue suivante.
10. Sur ma confirmation : /clear avant d'attaquer l'issue suivante. SPEC.md et CLAUDE.md seront relus automatiquement.

Ne lance pas de subagent de revue — la revue approfondie est dans /audit.

Si une étape échoue, arrête-toi immédiatement et explique le blocage.
