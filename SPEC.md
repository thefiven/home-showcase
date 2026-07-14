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
- Tests end-to-end (Playwright) — à introduire une fois le MVP stabilisé.
- Manifests Helm / déploiement k3s — préparés dans une phase dédiée ultérieure.

## 3. Décisions techniques

| Sujet | Décision |
|---|---|
| Frontend | Next.js (TypeScript), rendu SSR/SSG pour le SEO |
| CMS | Strapi, self-hosted (plutôt qu'un SaaS type Sanity, pour rester cohérent avec la cible d'hébergement) |
| Base de données | PostgreSQL (utilisée par Strapi) — en attendant l'issue #2 (environnement Docker), `apps/cms` tourne temporairement sur SQLite en local pour ne pas dépendre de Docker/Postgres avant que ceux-ci existent |
| Conteneurisation | Docker dès le départ (Dockerfile + docker-compose pour le dev local) |
| Hébergement cible | Homelab **k3s** (Kubernetes), pas encore en place — le repo doit rester "portable" (pas de dépendance à un PaaS propriétaire) mais les manifests k3s/Helm sont une phase ultérieure |
| Structure de repo | Monorepo : `apps/web` (Next.js) + `apps/cms` (Strapi), gestion via workspaces `pnpm` |
| Demandes de réservation & sync iCal | Gérées **dans Strapi** : content-type `booking-request` (statut pending/accepted/refused) + content-type `availability` alimenté par un job cron Strapi qui importe les iCal Airbnb. Next.js consomme l'API Strapi (pas de base de données ni de backend séparé côté web) |
| Notification email | Service à trancher avant l'implémentation de la feature notifications (candidat par défaut : Resend ; alternative : SMTP self-hosté, plus cohérent avec la logique homelab mais plus de maintenance) — **point ouvert**, voir §5 |
| Notification WhatsApp | Hors périmètre MVP, prévu en v2 |
| Stratégie de tests | Tests unitaires + intégration ciblés (Vitest) sur la logique métier critique (calcul de disponibilité, workflow de réservation, parsing iCal) et sur les endpoints API. Pas de E2E pour l'instant |
| Workflow Git | Solo mais rigoureux : branches par feature, commits gitmoji, PR systématique sur GitHub avant merge sur `main` (via l'intégration MCP GitHub), voir `CLAUDE.md` |

## 4. Modèle de contenu (Strapi) — vue d'ensemble

- **Property** : nom, slug, description FR/EN, photos, adresse/localisation, tarifs, équipements, URL iCal Airbnb.
- **Availability** : plages bloquées par `Property`, alimentées automatiquement par le job de sync iCal (lecture seule côté admin, pas d'édition manuelle des blocs importés).
- **BookingRequest** : `Property` liée, dates demandées, nom/email/téléphone du demandeur, message, statut (`pending` / `accepted` / `refused`), horodatage. La bascule de statut déclenche l'email de notification et, à terme, la mise à jour de la disponibilité affichée.

Ce modèle est une base de départ, à affiner lors de l'implémentation.

## 5. Points ouverts / à trancher plus tard

- **Fournisseur d'email transactionnel** (Resend vs SMTP self-hosté) : à décider avant de commencer la feature notifications.
- **Format exact de l'export iCal Airbnb** et fréquence de synchronisation (ex. toutes les heures) : à valider avec une vraie URL iCal Airbnb lors de l'implémentation.
- **Détails de l'intégration WhatsApp** (v2) : choix du provider, coût, opt-in de la propriétaire.
- **Manifests k3s/Helm** : structure à définir dans une phase dédiée, une fois le homelab prêt.
