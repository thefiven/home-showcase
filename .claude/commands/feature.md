---
description: Pilote une feature complète de bout en bout à partir d'une issue GitHub
---

Issue GitHub #$ARGUMENTS. Ne lis que les fichiers strictement nécessaires à cette issue — n'explore pas le repo entier. Si tu as besoin d'un fichier que je n'ai pas mentionné, demande-le plutôt que de chercher.

1. Résume l'issue, crée une branche dédiée. Puis /compact — le résumé de l'issue suffit pour la suite, les résultats MCP bruts n'ont plus à rester en contexte.
2. Plan Mode natif : plan d'implémentation cohérent avec SPEC.md et CLAUDE.md. Attends ma validation.
3. Implémente. Commits atomiques gitmoji. Pas de commentaire de progression entre les étapes — le code et les commits suffisent.
4. Tests correspondants (unitaires + intégration si pertinent) selon CLAUDE.md.
5. Linter + formatter. Corrige les erreurs.
6. Suite de tests complète (anti-régression).
7. Vérifie : pas de secret en dur, pas de log oublié, .env.example à jour si nouvelles variables.
8. PR liée à l'issue #$ARGUMENTS : résumé des changements, checklist de ce qui a été testé.
9. Récapitule en 3 lignes max et STOP.

Ne lance pas de subagent de revue — la qualité est couverte par le linter, les tests, et ma lecture de la PR. La revue approfondie se fait dans /audit.

Si une étape échoue, arrête-toi et explique le blocage.
