# CLAUDE.md

Conventions du projet **home-showcase**. Voir `SPEC.md` pour le cadrage produit et les décisions détaillées.

## Résumé du projet

Vitrine web multi-logements type Airbnb (complément à Airbnb, pas un remplacement) : présentation des logements, calendrier de disponibilité synchronisé depuis Airbnb (iCal, lecture seule), demandes de réservation avec notification email à la propriétaire, back-office pour éditer le contenu sans toucher au code.

## Stack technique

- **Frontend** : Next.js (TypeScript), SSR/SSG. Multilingue FR/EN dès le MVP.
- **CMS** : Strapi, self-hosted. Sert aussi de backend pour les demandes de réservation et la disponibilité (pas de base/backend séparé côté web).
- **Base de données** : PostgreSQL (utilisée par Strapi) — cible et environnement de référence, démarré via `docker/docker-compose.yml` (issue #2). Le SQLite dans `apps/cms` (issue #1) reste disponible comme fallback pratique pour du local hors Docker, mais n'est pas garanti à parité avec Postgres (pas de CI dessus) : toute fonctionnalité spécifique à Postgres (JSON, SQL brut...) prime sur la compatibilité SQLite.
- **Gestionnaire de paquets** : `pnpm` (workspaces pour le monorepo).
- **Conteneurisation** : Docker + docker-compose pour le développement local (Next.js, Strapi, Postgres) — voir `README.md` (`pnpm docker:up`).
- **Hébergement cible** : homelab k3s (à venir) — éviter toute dépendance à un PaaS propriétaire non portable. Les manifests Helm/k3s seront ajoutés dans une phase dédiée ultérieure, pas au démarrage.
- **Notification email** : fournisseur non encore tranché (voir `SPEC.md` §5) — prévoir un point d'extension isolé (ex. un module `notifications`) plutôt que de coupler l'implémentation au reste du code.
- **WhatsApp** : hors périmètre MVP, prévu en v2.

## Structure de dossiers

```
home-showcase/
├── apps/
│   ├── web/          # Next.js — site vitrine public (FR/EN)
│   └── cms/          # Strapi — back-office, API, content-types, jobs cron (sync iCal), notifications
├── docker/            # Dockerfiles et docker-compose pour le dev local
├── SPEC.md            # Cadrage produit et décisions
├── CLAUDE.md          # Ce fichier
└── README.md
```

Modèle de contenu Strapi (`apps/cms`) : `Property`, `Availability` (alimenté par sync iCal, lecture seule côté admin), `BookingRequest` (statut `pending`/`accepted`/`refused`, déclenche la notification email).

## Stratégie de tests

- **Vitest** pour les tests unitaires et d'intégration ciblés.
- Prioriser la logique métier critique : calcul/fusion de disponibilité, parsing et synchronisation iCal, workflow de statut des demandes de réservation (`pending`/`accepted`/`refused`), endpoints API Strapi.
- Pas de tests E2E pour l'instant (à introduire avec Playwright une fois le MVP stabilisé) — ne pas ajouter cette dépendance sans validation préalable.
- Ne pas tester ce qui relève du framework lui-même (rendu Next.js par défaut, admin Strapi standard) — se concentrer sur le code métier propre au projet.
- Vitest est configuré dans `apps/web` et `apps/cms` (`pnpm run test` à la racine, `--passWithNoTests` tant qu'aucune logique métier n'existe) : c'est la fondation posée dès le monorepo (issue #1), à remplir au fil des issues qui introduisent de la vraie logique (ex. sync iCal, workflow de réservation).

## Workflow Git

Projet solo mais avec un historique propre et une PR systématique avant merge sur `main`.

### Branches

- `main` : toujours déployable, protégée (on n'y commit jamais directement).
- Une branche par feature/correctif, préfixée par type : `feat/...`, `fix/...`, `chore/...`, `refactor/...`, `docs/...`, `test/...`.
  - Exemples : `feat/booking-request-form`, `fix/ical-sync-timezone`.

### Commits — convention gitmoji

Chaque commit commence par un gitmoji correspondant à sa nature. Convention déjà initiée sur ce repo (`🎉` pour le commit initial). Emojis à utiliser :

| Emoji | Usage |
|---|---|
| 🎉 | Commit initial / lancement du projet |
| ✨ | Nouvelle fonctionnalité |
| 🐛 | Correction de bug |
| ♻️ | Refactoring (sans changement de comportement) |
| 💄 | Style / UI / CSS |
| ✅ | Ajout ou correction de tests |
| 📝 | Documentation |
| 🔧 | Configuration (outils, env, CI) |
| ⚡️ | Amélioration de performance |
| 📦 | Dépendances / build |
| 👷 | CI/CD |
| 🚧 | Travail en cours, commit intermédiaire (à éviter sur `main`) |
| ⏪ | Revert |
| 🔒 | Sécurité |
| 🌐 | Internationalisation (FR/EN) |

Format : `<gitmoji> <résumé court à l'impératif>` (ex. `✨ Ajoute le formulaire de demande de réservation`).

### Pull Requests — via MCP GitHub

Le workflow de PR passe par les outils MCP GitHub (`mcp__github__*`), pas par des commandes `gh` manuelles, lorsque Claude Code intervient :

1. Créer la branche (`mcp__github__create_branch`) depuis `main`.
2. Committer les changements sur la branche (commits gitmoji comme ci-dessus).
3. Ouvrir la PR (`mcp__github__create_pull_request`) avec un résumé clair du changement et, si pertinent, un plan de test.
4. Pour une revue avec commentaires sur des lignes précises : `pull_request_review_write` (create) → `add_comment_to_pending_review` → `pull_request_review_write` (submit_pending).
5. Merge (`mcp__github__merge_pull_request`) uniquement après validation explicite de l'utilisateur — ne jamais merger automatiquement sans confirmation.

Pas de force-push sur `main`, pas de rebase interactif automatisé.
