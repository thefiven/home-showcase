# k3s Deployment

Helm chart to deploy `home-showcase` (web, cms, postgres) on a
**k3s** cluster (homelab). See `SPEC.md` §3/§5 and `CLAUDE.md` for product/technical context.

## Prerequisites

- An accessible k3s cluster (`kubectl` configured), with the built-in
  Traefik ingress controller (default in k3s).
- `helm` v3 installed on the admin workstation.
- The `cms` and `web` images, available on a registry accessible by the
  cluster. Automatically published to GHCR by `.github/workflows/release.yml`
  on every `vX.Y.Z` tag pushed to `main`:
  `ghcr.io/thefiven/home-showcase-cms:<version>` and `-web:<version>` (+ `latest`) —
  these are the default values in `values.yaml`.
  - `web` requires `NEXT_PUBLIC_STRAPI_URL` and `NEXT_PUBLIC_SITE_URL` as
    **build-args** (inlined at build time by Next.js, not reconfigurable at
    runtime). In CI, set via the GitHub repository variables
    `NEXT_PUBLIC_STRAPI_URL`/`NEXT_PUBLIC_SITE_URL` (Settings → Secrets and
    variables → Actions → Variables) — fill these in with the real public
    URLs once the cluster is in place; otherwise, the workflow falls back to
    `localhost` values that are unusable in production.
  - For a manual build (without the workflow):
    ```
    docker build -f docker/web.Dockerfile --target production \
      --build-arg NEXT_PUBLIC_STRAPI_URL=https://cms.example.com \
      --build-arg NEXT_PUBLIC_SITE_URL=https://home-showcase.example.com \
      -t <registry>/home-showcase-web:<tag> .
    docker build -f docker/cms.Dockerfile --target production \
      -t <registry>/home-showcase-cms:<tag> .
    ```

## 1. Create the Secret

No secret is present in the chart: it consumes a Kubernetes `Secret` created
separately, with the same keys as `docker/.env.example` (`POSTGRES_DB`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_PORT`, `DATABASE_NAME`,
`DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`, `APP_KEYS`,
`API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`,
`ENCRYPTION_KEY` — regenerate these for production, e.g. `openssl rand -base64 32`).

```bash
kubectl create secret generic home-showcase-secrets \
  --from-env-file=./secrets.env
```

(`secrets.env`: local, unversioned file, in `.env` format, never committed.)

## 2. Install the chart

```bash
helm install home-showcase deploy/helm/home-showcase \
  --set cms.image.repository=<registry>/home-showcase-cms \
  --set cms.image.tag=<tag> \
  --set web.image.repository=<registry>/home-showcase-web \
  --set web.image.tag=<tag> \
  --set ingress.host=home-showcase.example.com
```

All configurable values are documented in
`deploy/helm/home-showcase/values.yaml`.

## Check / update

```bash
helm lint deploy/helm/home-showcase
helm template deploy/helm/home-showcase   # local rendering, no cluster changes
helm upgrade home-showcase deploy/helm/home-showcase
```

## Out of scope for this chart

- Secret rotation or advanced secret management (e.g. Sealed Secrets, Vault) — the
  chart just references an existing Secret.
