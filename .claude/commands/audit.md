---
description: Audit qualité, sécurité et dette technique du projet
---

Audit du projet. Priorise les fichiers modifiés depuis le dernier audit (git log) plutôt que de relire tout le repo.

1. Sécurité : /security-review. Dépendances vulnérables (npm audit ou équivalent), secrets exposés, validation des inputs.
2. Qualité : code dupliqué, fonctions trop complexes, TODO/FIXME laissés.
3. Tests : couverture, chemins critiques non testés.
4. Dette technique : écarts avec SPEC.md/CLAUDE.md.
5. Performance : requêtes N+1, bundles lourds, assets non optimisés.

Résultats par ordre de criticité, en liste concise. Propose une issue GitHub par point important. Ne corrige rien sans mon accord.
