# home-showcase

Vitrine web multi-logements type Airbnb. Voir `SPEC.md` (cadrage produit) et `CLAUDE.md` (conventions du projet).

## Développement avec Docker

Démarre Postgres, Strapi (`apps/cms`) et Next.js (`apps/web`) en une seule commande.

```sh
cp docker/.env.example docker/.env
# éditer docker/.env : renseigner de vraies valeurs pour les secrets Strapi
# (APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET,
# ENCRYPTION_KEY — voir les commentaires du fichier), ex. via `openssl rand -base64 32`

pnpm docker:up    # démarre les 3 services (build à la première exécution)
pnpm docker:down  # arrête les services (les données Postgres sont conservées dans le volume)
```

- Next.js : http://localhost:3000
- Strapi (admin) : http://localhost:1337/admin

`apps/web` et `apps/cms` sont montés dans leurs conteneurs respectifs : les
modifications de code sont prises en compte à chaud (hot-reload Next.js /
Strapi), sans reconstruire l'image. Un rebuild (`pnpm docker:up`, qui relance
toujours `--build`) n'est nécessaire qu'après un changement de dépendances
(`package.json`) ou de Dockerfile.

Voir `docker/docker-compose.yml` pour le détail des services.

## Outillage de dev

```sh
pnpm lint          # ESLint (apps/web + apps/cms)
pnpm format        # Prettier --write sur tout le repo
pnpm format:check  # Prettier --check (utilisé en pre-commit et en CI)
pnpm test          # Vitest (apps/web + apps/cms)
pnpm build         # build de production des deux apps
```

`pnpm install` active automatiquement un hook **pre-commit** (via
[Lefthook](https://lefthook.dev)) qui lance `format:check` + `lint` + `test`
avant chaque commit. La CI GitHub Actions (`.github/workflows/ci.yml`)
relance les mêmes étapes + le build sur chaque pull request vers `main`.

### Branch protection sur `main`

Le repo est public, ce qui permet la branch protection sans plan payant.
Configurée sur `main` :

- Pull request obligatoire avant merge (0 approbation requise — projet solo).
- Statut CI (`ci`) requis et à jour avant merge.
- Pas de push direct sur `main`, y compris pour les admins.
- Pas de force-push, pas de suppression de la branche.
