# Déploiement k3s

Chart Helm de déploiement de `home-showcase` (web, cms, postgres) sur un cluster
**k3s** (homelab). Voir `SPEC.md` §3/§5 et `CLAUDE.md` pour le contexte produit/technique.

## Prérequis

- Un cluster k3s accessible (`kubectl` configuré), avec l'ingress controller
  Traefik embarqué (par défaut dans k3s).
- `helm` v3 installé côté poste d'administration.
- Les images `cms` et `web`, disponibles sur un registry accessible par le
  cluster. Publiées automatiquement sur GHCR par `.github/workflows/release.yml`
  à chaque tag `vX.Y.Z` poussé sur `main` :
  `ghcr.io/thefiven/home-showcase-cms:<version>` et `-web:<version>` (+ `latest`) —
  ce sont les valeurs par défaut de `values.yaml`.
  - `web` nécessite `NEXT_PUBLIC_STRAPI_URL` et `NEXT_PUBLIC_SITE_URL` comme
    **build-args** (inlinées au build par Next.js, non reconfigurables au
    runtime). En CI, définies via les variables de dépôt GitHub
    `NEXT_PUBLIC_STRAPI_URL`/`NEXT_PUBLIC_SITE_URL` (Settings → Secrets and
    variables → Actions → Variables) — à renseigner avec les vraies URLs
    publiques une fois le cluster en place ; sans ça, le workflow retombe sur
    des valeurs `localhost` inutilisables en prod.
  - Pour un build manuel (sans le workflow) :
    ```
    docker build -f docker/web.Dockerfile --target production \
      --build-arg NEXT_PUBLIC_STRAPI_URL=https://cms.example.com \
      --build-arg NEXT_PUBLIC_SITE_URL=https://home-showcase.example.com \
      -t <registry>/home-showcase-web:<tag> .
    docker build -f docker/cms.Dockerfile --target production \
      -t <registry>/home-showcase-cms:<tag> .
    ```

## 1. Créer le Secret

Aucun secret n'est présent dans le chart : il consomme un `Secret` Kubernetes créé
à part, avec les mêmes clés que `docker/.env.example` (`POSTGRES_DB`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_PORT`, `DATABASE_NAME`,
`DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`, `APP_KEYS`,
`API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`,
`ENCRYPTION_KEY` — à régénérer pour la prod, ex. `openssl rand -base64 32`).

```bash
kubectl create secret generic home-showcase-secrets \
  --from-env-file=./secrets.env
```

(`secrets.env` : fichier local non versionné, au format `.env`, jamais commité.)

## 2. Installer le chart

```bash
helm install home-showcase deploy/helm/home-showcase \
  --set cms.image.repository=<registry>/home-showcase-cms \
  --set cms.image.tag=<tag> \
  --set web.image.repository=<registry>/home-showcase-web \
  --set web.image.tag=<tag> \
  --set ingress.host=home-showcase.example.com
```

Toutes les valeurs paramétrables sont documentées dans
`deploy/helm/home-showcase/values.yaml`.

## Vérifier / mettre à jour

```bash
helm lint deploy/helm/home-showcase
helm template deploy/helm/home-showcase   # rendu local, sans toucher au cluster
helm upgrade home-showcase deploy/helm/home-showcase
```

## Hors périmètre de ce chart

- Rotation ou gestion avancée des secrets (ex. Sealed Secrets, Vault) — le chart
  se contente de référencer un Secret existant.
