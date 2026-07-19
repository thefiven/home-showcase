# SPEC — home-showcase

> Document de cadrage. Résume les décisions produit/techniques prises avant le démarrage du code.
> Les conventions dérivées de ces décisions (stack, structure de dossiers, workflow Git, gitmoji, tests) sont dans `CLAUDE.md`.

## 1. Contexte & besoin

Vitrine web pour un ou plusieurs logements de type Airbnb, pensée comme **complément** à Airbnb (pas un remplacement) :

- Objectif principal : donner un support à partager sur les réseaux sociaux pour attirer de nouvelles réservations.
- Le site présente les informations des logements (photos, description, tarifs, équipements, localisation) comme le ferait une fiche Airbnb.
- Les visiteurs peuvent consulter la disponibilité et soumettre une **demande de réservation**, que la propriétaire accepte ou refuse manuellement.
- La propriétaire n'est pas technique : toute modification de contenu (textes, photos, tarifs) doit se faire sans toucher au code.

Pas de contrainte de délai : projet développé au rythme normal, sans deadline externe.

## 2. Périmètre fonctionnel

### Inclus au MVP

- Présentation de **plusieurs logements**, chacun avec sa propre fiche (photos, description FR/EN, tarifs, équipements, localisation).
- **Site multilingue FR/EN** dès le MVP (audience Airbnb internationale).
- **Calendrier de disponibilité** par logement, avec demande de réservation depuis ce calendrier.
- **Synchronisation de la disponibilité avec Airbnb** via l'export iCal de chaque annonce (import périodique, lecture seule — on ne pousse rien vers Airbnb).
- **Back-office** permettant à la propriétaire d'éditer tout le contenu sans intervention développeur.
- **Workflow de demande de réservation** : le visiteur soumet une demande (dates, coordonnées, message) → la propriétaire est notifiée → elle accepte ou refuse depuis le back-office.
- **Notification par email** à chaque nouvelle demande de réservation.

### Hors périmètre MVP (évolutions futures)

- Notification **WhatsApp** (Twilio ou WhatsApp Business API) — v2.
- Paiement en ligne / acompte.
- Export/écriture vers le calendrier Airbnb (le flux reste unidirectionnel : Airbnb → home-showcase).

## 3. Décisions techniques

| Sujet                               | Décision                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                            | Next.js (TypeScript), rendu SSR/SSG pour le SEO                                                                                                                                                                                                                                             |
| CMS                                 | Strapi, self-hosted (plutôt qu'un SaaS type Sanity, pour rester cohérent avec la cible d'hébergement)                                                                                                                                                                                       |
| Base de données                     | PostgreSQL (utilisée par Strapi) — cible et environnement de référence, démarré via `docker/docker-compose.yml` (issue #2). `apps/cms` peut aussi tourner sur SQLite en local hors Docker (issue #1, fallback pratique sans lancer les conteneurs, mais non garanti à parité avec Postgres) |
| Conteneurisation                    | Docker dès le départ : `docker/docker-compose.yml` (Postgres + Strapi + Next.js) et Dockerfiles multi-stage (`dev`/`production`) par app — voir README.md                                                                                                                                   |
| Hébergement cible                   | Homelab **k3s** (Kubernetes), pas encore en place — le repo doit rester "portable" (pas de dépendance à un PaaS propriétaire) ; manifests Helm dans `deploy/helm/home-showcase/`                                                                                                            |
| Structure de repo                   | Monorepo : `apps/web` (Next.js) + `apps/cms` (Strapi), gestion via workspaces `pnpm`                                                                                                                                                                                                        |
| Demandes de réservation & sync iCal | Gérées **dans Strapi** : content-type `booking-request` (statut pending/accepted/refused) + content-type `availability` alimenté par un job cron Strapi qui importe les iCal Airbnb. Next.js consomme l'API Strapi (pas de base de données ni de backend séparé côté web)                   |
| Notification email                  | SMTP self-hosté via `@strapi/provider-email-nodemailer`, plutôt que Resend — cohérent avec la logique homelab (voir §5)                                                                                                                                                                     |
| Notification WhatsApp               | Hors périmètre MVP, prévu en v2                                                                                                                                                                                                                                                             |
| Stratégie de tests                  | Tests unitaires + intégration ciblés (Vitest) sur la logique métier critique (calcul de disponibilité, workflow de réservation, parsing iCal) et sur les endpoints API. Tests end-to-end (Playwright) dans `e2e/` sur les parcours critiques (disponibilité, demande de réservation)        |
| Workflow Git                        | Solo mais rigoureux : branches par feature, commits gitmoji, PR systématique sur GitHub avant merge sur `main` (via l'intégration MCP GitHub), voir `CLAUDE.md`                                                                                                                             |

## 4. Modèle de contenu (Strapi) — vue d'ensemble

- **Property** : nom, slug, description FR/EN, photos, adresse/localisation, tarifs, équipements, URL iCal Airbnb.
- **Availability** : plages bloquées par `Property`, alimentées automatiquement par le job de sync iCal (lecture seule côté admin, pas d'édition manuelle des blocs importés).
- **BookingRequest** : `Property` liée, dates demandées, nom/email/téléphone/nombre de voyageurs du demandeur, message, statut (`pending` / `accepted` / `refused`), horodatage. La création déclenche l'email de notification à la propriétaire ; le passage à `accepted`/`refused` crée ou retire l'`Availability` correspondante (`apps/cms/src/documents-middlewares`).

Ce modèle a été implémenté tel quel pour le MVP (voir `CLAUDE.md` pour la structure de dossiers à jour).

## 5. Points tranchés en cours d'implémentation

- **Fournisseur d'email transactionnel** : SMTP self-hosté via `@strapi/provider-email-nodemailer` (config `apps/cms/config/plugins.ts`, variables `SMTP_*`/`EMAIL_FROM`/`EMAIL_REPLY_TO`), plutôt que Resend — cohérent avec la cible homelab. L'échec d'envoi est loggé mais ne bloque jamais la création de la demande de réservation.
- **Sync iCal** : job cron Strapi (`apps/cms/src/cron-tasks`, service `apps/cms/src/api/availability/services/ical.ts`) qui importe l'export iCal Airbnb par `Property` et alimente `Availability`. `DTEND` traité comme exclusif (le jour de checkout redevient réservable).
- **Confidentialité de la localisation** : l'adresse précise n'est jamais exposée publiquement ; le web ne reçoit qu'une position approximative dérivée côté CMS (Document Service middleware sur `Property`).

## 6. Points ouverts / à trancher plus tard

- **Détails de l'intégration WhatsApp** (v2) : choix du provider, coût, opt-in de la propriétaire.
- **Paiement en ligne / acompte** (v2).

## 7. État du MVP

Le MVP tel que décrit ci-dessus (§2 « Inclus au MVP ») est implémenté et couvert par des tests unitaires (Vitest) et end-to-end (Playwright, `e2e/`) : logements multi-fiches FR/EN, calendrier de disponibilité sélectionnable synchronisé depuis Airbnb, formulaire de demande de réservation avec notification email, back-office Strapi (accept/refuse), SEO technique (sitemap, robots.txt, JSON-LD, canoniques/hreflang), Docker pour le dev local, chart Helm pour le déploiement k3s, CI GitHub Actions (lint/test/build/e2e/audit de dépendances). Reste en dehors du périmètre MVP : WhatsApp et paiement en ligne (v2, voir §6).
