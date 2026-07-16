---
description: Pilote une feature complète de bout en bout à partir d'une issue GitHub
---

Issue GitHub #$ARGUMENTS. Ne lis que les fichiers strictement nécessaires à cette issue — n'explore pas le repo entier. Si tu as besoin d'un fichier que je n'ai pas mentionné, demande-le plutôt que de chercher.

1. Résume l'issue, crée une branche dédiée.
2. Plan Mode natif : plan d'implémentation cohérent avec SPEC.md et CLAUDE.md. Attends ma validation.
3. Implémente. Commits atomiques gitmoji. Pas de commentaire explicatif de ce que tu fais entre les étapes — le code et les commits suffisent.
4. Tests correspondants (unitaires + intégration si pertinent) selon CLAUDE.md.
5. Linter + formatter. Corrige les erreurs.
6. Suite de tests complète (anti-régression).
7. Vérifie : pas de secret en dur, pas de log oublié, .env.example à jour si nouvelles variables.
8. /review pour la relecture qualité.
9. PR liée à l'issue #$ARGUMENTS : résumé des changements, checklist de ce qui a été testé.
10. Récapitule en 3 lignes max et STOP.

Si une étape échoue, arrête-toi et explique le blocage.
