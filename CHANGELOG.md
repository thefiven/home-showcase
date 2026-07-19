# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce
fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et ce
projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2026-07-19

Première version stable : le MVP décrit dans `SPEC.md` §2 est complet.

### Added

- Site vitrine multi-logements (Next.js, SSR/SSG), pages liste et détail,
  entièrement bilingue FR/EN.
- Galerie photos style Airbnb avec lightbox et navigation cyclique.
- Calendrier de disponibilité sélectionnable par logement, synchronisé
  depuis Airbnb via export iCal (job cron Strapi, `DTEND` traité comme
  exclusif pour rendre le jour de checkout réservable).
- Formulaire de demande de réservation : notification email à la
  propriétaire (SMTP self-hosté via `@strapi/provider-email-nodemailer`),
  échec d'envoi non bloquant ; création/retrait automatique de
  disponibilité selon le statut (`pending`/`accepted`/`refused`).
- Back-office Strapi avec rôle dédié à la propriétaire pour éditer tout le
  contenu sans toucher au code.
- Confidentialité de la localisation : position précise jamais exposée
  publiquement, position approximative dérivée côté CMS.
- SEO technique : sitemap, robots.txt, URLs canoniques et hreflang FR/EN,
  données structurées JSON-LD, page 404 stylée cohérente avec le design
  system.
- Environnement de dev Docker (Postgres, Strapi, Next.js via
  `docker-compose`) et chart Helm pour le déploiement k3s.
- CI GitHub Actions : lint, tests, build, tests end-to-end Playwright, audit
  de dépendances.

[1.0.0]: https://github.com/thefiven/home-showcase/releases/tag/v1.0.0
