# DESIGN.md — Maison Vue Mer (Plouider)

Source de vérité du design system utilisé dans `Maison Vue Mer - Plouider.dc.html`. Toute nouvelle page/écran doit réutiliser ces tokens tels quels (pas de nouvelle couleur/taille ad hoc sans mise à jour de ce document).

## 1. Tokens de couleur

| Nom                              | Hex                                             | Usage                                                                                                    |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `background`                     | `#F5F2EC`                                       | Fond de page général (pierre chaude / blanc cassé), fond des inputs                                      |
| `surface`                        | `#EDE9DF`                                       | Fond de section alterné (disponibilités, carte du formulaire)                                            |
| `surface-dark`                   | `#1C2B33`                                       | Fond des sections sombres (bandeau chiffres clés, localisation, footer top-border), couleur du logo mark |
| `border`                         | `rgba(28,43,51,0.1)`                            | Séparateurs discrets (nav, footer)                                                                       |
| `border-strong`                  | `rgba(28,43,51,0.15)` à `rgba(28,43,51,0.25)`   | Bordures d'inputs, cases de calendrier, pastille langue                                                  |
| `foreground`                     | `#1C2B33`                                       | Texte principal sur fond clair (ardoise / navy profond)                                                  |
| `foreground-muted`               | `#3A3C3D`                                       | Paragraphes de contenu (description, texte de section)                                                   |
| `foreground-soft`                | `#6B6459`                                       | Éyebrows/labels en majuscules, texte secondaire (granite)                                                |
| `foreground-on-dark`             | `#F5F2EC`                                       | Texte sur fond sombre (hero, bandeau, localisation, footer texte)                                        |
| `foreground-on-dark-muted`       | `#C7CDD1` / `#9BB0BC` / `#E7E1D3`               | Texte secondaire sur fond sombre (variantes selon section)                                               |
| **Accent primaire** — `atlantic` | `#2B4A5E`                                       | CTA principal (nav, bouton formulaire), liens (`a`)                                                      |
| **Accent primaire hover**        | `#1C2B33`                                       | État hover des CTA/liens en accent primaire                                                              |
| **Accent chaud** — `gorse`       | `#B8863A`                                       | CTA hero ("Demander la disponibilité"), prix, coches équipements                                         |
| **Accent chaud hover**           | `#a37530`                                       | État hover du CTA en accent chaud                                                                        |
| **Sémantique — disponible**      | `#F5F2EC` (case) + bordure `rgba(28,43,51,0.3)` | Case de calendrier libre                                                                                 |
| **Sémantique — indisponible**    | `#8B8177`                                       | Case de calendrier bloquée (écume grisée), fond légende                                                  |

Pas de couleur de succès/erreur codée en dur dans le design actuel (formulaire sans état de validation visuel) — si ajoutée, dériver de `#2B4A5E` (info/succès) et d'un rouge discret desaturé à définir avant implémentation, jamais un rouge saturé générique.

## 2. Échelle typographique

Familles :

- **Display** : `'Source Serif 4', serif` — titres (h1, h2, h3, logo). Graisses utilisées : 600 (défaut), poids chargés 400/500/700 disponibles.
- **Texte courant** : `'Work Sans', sans-serif` — corps de texte, nav, formulaire, boutons.
- **Utilitaire (dates / prix / labels)** : `'Space Mono', monospace` — prix, dates de calendrier, eyebrows en majuscules, pastille langue.

| Rôle                        | Famille        | Poids | Taille                                                      | Interligne                      | Notes                                             |
| --------------------------- | -------------- | ----- | ----------------------------------------------------------- | ------------------------------- | ------------------------------------------------- |
| Display (H1 hero)           | Source Serif 4 | 600   | `clamp(2.4rem, 6vw, 4.4rem)`                                | 1.05                            | `max-width:16ch`, couleur `#F5F2EC` sur hero      |
| H2 (titres de section)      | Source Serif 4 | 600   | `clamp(1.7rem, 3vw, 2.3rem)`                                | normal (défaut navigateur ~1.3) | Utilisé pour tous les titres de section           |
| H3 (sous-titres calendrier) | Source Serif 4 | 600   | `18px`                                                      | normal                          |                                                   |
| Body                        | Work Sans      | 400   | `16px` (texte long) / `15px` (texte secondaire, formulaire) | `1.5` (hérité du body)          | `max-width:58ch` sur paragraphes longs            |
| Nav / liens                 | Work Sans      | 500   | `15px`                                                      | 1.5                             |                                                   |
| Labels de formulaire        | Work Sans      | 600   | `14px`                                                      | 1.5                             |                                                   |
| Eyebrow / label majuscule   | Space Mono     | 400   | `12px`                                                      | 1.5                             | `text-transform:uppercase; letter-spacing:0.12em` |
| Eyebrow hero                | Space Mono     | 400   | `13px`                                                      | 1.5                             | `letter-spacing:0.14em`                           |
| Caption / mentions          | Work Sans      | 400   | `13px`–`14px`                                               | 1.5                             | Footer, sous-libellés bandeau chiffres            |
| Chiffres clés (bandeau)     | Space Mono     | 700   | `22px`                                                      | 1.2                             |                                                   |
| Dates calendrier            | Space Mono     | 400   | `13px`                                                      | 1 (case carrée `34px`)          |                                                   |
| Prix hero (gorse)           | Space Mono     | 700   | `22px`                                                      | 1.2                             | Couleur accent chaud                              |

Taille de base du texte courant : `16px`, jamais en dessous de `12px` (mentions footer). Aucune taille de type sous 12px.

## 3. Espacement

Unité de base : **2px** (grille sous-jacente), mais le rythme réel s'exprime surtout en paliers **multiples de 4** :

`2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32`, puis paliers fluides `clamp()` pour les grands espacements de section :

| Usage                               | Valeur                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| Gap interne (icône + texte, chip)   | `6px`–`10px`                                                   |
| Gap entre champs de formulaire      | `14px`–`16px`                                                  |
| Gap entre cartes/colonnes (grid)    | `12px` (galerie), `clamp(32px,5vw,64px)` (colonnes de section) |
| Padding nav (vertical / horizontal) | `14px` / `clamp(16px,4vw,48px)`                                |
| Padding section (vertical)          | `clamp(48px,7vw,88px)`                                         |
| Padding hero (interne)              | `clamp(28px,5vw,64px)`                                         |
| Padding bouton                      | `10px 20px` (nav), `14px 24px`–`14px 26px` (CTA principaux)    |
| Padding input/textarea              | `11px 12px`                                                    |
| Padding carte formulaire            | `clamp(20px,3vw,32px)`                                         |

Les grands espacements (padding de section, gaps de grille responsive) utilisent systématiquement `clamp(min, préférence-vw, max)` plutôt que des breakpoints fixes — le rythme se resserre en continu du mobile au desktop.

## 4. Radius / bordures / ombres

- **Radius** : politique volontairement plate — `2px` sur tous les éléments interactifs (boutons, inputs, cartes de formulaire), `20px` (pill) uniquement sur le sélecteur de langue FR/EN. Pas de `border-radius` sur les images (angles francs, cohérent avec le motif de toit). Pas de cartes "rounded-xl" façon SaaS.
- **Bordures** : `1px solid`, toujours en `rgba(28,43,51, α)` — `0.1` (séparateurs discrets), `0.15` (cases calendrier), `0.25` (inputs, pastille langue), `0.3` (légende disponible), `0.6` (bouton ghost sur hero, en `rgba(245,242,236,0.6)`).
- **Ombres** : **aucune** box-shadow dans le design actuel. La profondeur vient du contraste de fond (bandeaux `#1C2B33` / `#EDE9DF` / `#F5F2EC`) et d'un `backdrop-filter: blur(8px)` sur la nav sticky, pas d'élévation en ombre portée. Ne pas introduire de shadow sans revoir cette règle.

## 5. Élément signature

Silhouette de toit de longère (deux pans, faîtage bas) : `clip-path: polygon(0 100%, 0 55%, 22% 20%, 50% 0%, 78% 20%, 100% 55%, 100% 100%)` sur fond `#1C2B33`. Utilisée en logo mark (nav `34×26px`, footer `26×20px`). Réutilisable comme divider ou accent décoratif, jamais comme icône vague/mouette.

## 6. Breakpoints responsive

Aucun breakpoint fixe (`@media`) : le layout est **fluide** de bout en bout.

- **Typographie et grands espacements** : `clamp()` (bornes indiquées section 2 et 3) — évolue en continu avec `vw`.
- **Grilles de contenu** : `grid-template-columns: repeat(auto-fit, minmax(Xpx, 1fr))` — se replient automatiquement en 1 colonne sous le seuil `X` :
  - Colonnes de section (description/équipements, réservation, localisation) : `minmax(320px, 1fr)`
  - Galerie photos : `minmax(260px, 1fr)`, `grid-auto-rows:220px`, tuile héro `grid-column:span 2; grid-row:span 2`
  - Calendrier (2 mois) : `minmax(300px, 1fr)`
  - Champs de formulaire en paire (dates, email/tél) : `minmax(160px, 1fr)`
- **Nav et rangées d'actions** : `flex-wrap: wrap` avec `gap` fluide (`clamp(14px,3vw,28px)`) plutôt qu'un menu burger dédié — se réorganise naturellement en colonnes empilées sur mobile.
- **Hero** : hauteur fluide `clamp(440px, 62vw, 720px)` (jamais de hauteur fixe en vh pur, pour rester lisible en format portrait mobile).

Repères d'usage courants observés dans les seuils `minmax()` (≈ équivalents implicites, à titre de référence uniquement) :

- **Mobile** : < 480px — tout en 1 colonne
- **Tablette** : ≈ 480–860px — 2 colonnes selon les grilles (`auto-fit` bascule seul)
- **Desktop** : > 860–1100px — grilles pleines (jusqu'à 3 colonnes équipements, 2 colonnes calendrier/formulaire), contenu plafonné à `max-width:1200px` (`1000px` pour la section disponibilités).
