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
