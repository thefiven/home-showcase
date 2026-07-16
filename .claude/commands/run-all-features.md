---
description: Enchaîne les features des issues GitHub ouvertes, dans l'ordre numérique, avec pause entre chaque
---

Liste les issues GitHub ouvertes triées par numéro croissant. Affiche la liste avant de commencer.

Pour chaque issue, dans l'ordre. Ne lis que les fichiers nécessaires à l'issue en cours — n'explore pas le repo entier :

1. Résume l'issue, crée une branche dédiée.
2. Plan Mode natif : plan cohérent avec SPEC.md et CLAUDE.md. Attends ma validation.
3. Implémente. Commits atomiques gitmoji. Pas de commentaire de progression superflu.
4. Tests correspondants.
5. Linter + formatter, corrige les erreurs.
6. Suite de tests complète (anti-régression).
7. Vérifie : pas de secret en dur, pas de log oublié, .env.example à jour.
8. /review pour la relecture qualité.
9. PR liée à l'issue : résumé + checklist.
10. Récapitule en 3 lignes max et STOP — attends ma confirmation explicite avant l'issue suivante.
11. Sur ma confirmation : exécute /clear avant d'attaquer l'issue suivante (contexte neuf par feature). SPEC.md et CLAUDE.md seront relus automatiquement.

Si une étape échoue, arrête-toi immédiatement et explique le blocage.
