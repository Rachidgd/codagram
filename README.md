# Clickscreation — thème Shopify « Signal »

Thème Shopify Online Store 2.0 écrit intégralement pour Clickscreation.
Aucun thème acheté, aucun gabarit repris, aucune librairie d'interface.

- **CSS** : Tailwind v4 compilé en un asset statique unique (aucun CDN, aucun runtime)
- **JS** : vanilla, sans dépendance ni polyfill
- **Polices** : Jost + JetBrains Mono, variables, auto-hébergées (aucune requête Google)
- **Poids front** : 11,7 Ko de CSS + 9 Ko de JS (gzip) + 58 Ko de polices

---

## Démarrer

```bash
npm install
npm run build:css        # compile src/css → theme/assets/signal.css
npm run watch:css        # recompilation à la volée
```

Le CSS **doit** être recompilé après toute modification de `src/css/**` ou après
l'ajout d'une classe utilitaire Tailwind dans un fichier `.liquid`.

## Contrôler avant de livrer

```bash
python3 build/qa.py        # snippets/sections manquants, schemas, réglages, tags Liquid
node build/render.mjs      # rend les gabarits en HTML hors Shopify
node build/shoot.mjs       # captures + mesures typo/débordement sur 3 largeurs
node build/functional.mjs  # 28 tests : formulaire, palette, onglets, en-tête, menu mobile
```

`build/` est un outillage de développement : rien de ce dossier n'est déployé.
Pour l'aperçu HTTP (nécessaire aux polices) :
`python3 -m http.server 8899 -d build/preview`

---

## Design system

### Couleurs

Le graphite n'est jamais du noir pur : il est légèrement viré vert, ce qui
l'écarte du rendu « thème sombre par défaut » et l'harmonise avec l'accent.

| Rôle | Jeton | Valeur |
|---|---|---|
| Fond principal | `--color-ink-900` | `#0b0e0d` |
| Fond profond (CTA, pied) | `--color-ink-950` | `#080a09` |
| Surfaces surélevées | `--color-ink-850` | `#101412` |
| Fond clair (lecture) | `--color-paper` | `#f5f6f3` |
| Accent — décision | `--color-volt` | `#d6fb51` |
| Accent — mesure | `--color-ember` | `#ff5a2c` |

**Règle d'usage du volt** : il ne sert qu'aux éléments de décision (bouton
principal, état actif, chiffre clé). Deux boutons volt sur un même écran
détruisent la hiérarchie de conversion. Sur fond clair, le volt n'est jamais
du texte (contraste insuffisant) : le bouton devient graphite plein.

### Surfaces

Une page alterne `surface-dark` (impact) et `surface-paper` (lecture dense).
Chaque section porte `data-surface="dark|paper"` : l'en-tête lit cet attribut
au défilement et inverse son propre thème automatiquement.

### Typographie

Jost pour tout le texte, JetBrains Mono (`CC Mono`) pour les données chiffrées
et les libellés système — c'est elle qui donne la texture « instrument ».

Échelle fluide bornée, mesurée dans le navigateur :

| Niveau | 390 px | 768 px | 1440 px |
|---|---|---|---|
| H1 | 28,2 px | 35,4 px | 48 px |
| H2 | 24,2 px | 27,8 px | 34 px |
| H3 | 19,1 px | 20,2 px | 22,2 px |
| Corps | 15,1 px | 15,5 px | 16,2 px |

Protection contre les coupures : `text-wrap: balance` sur les titres,
`text-wrap: pretty` sur les paragraphes, `hyphens: none` partout.
Aucun débordement horizontal à aucune largeur (vérifié par `build/shoot.mjs`).

### Rythme

`--spacing-section` : 44 px sur mobile → 80 px sur desktop. Volontairement
serré : l'espace ne sert qu'à séparer, jamais à remplir.

---

## Architecture

```
theme/
├── assets/          signal.css (compilé), signal.js, 2 polices woff2
├── config/          settings_schema.json, settings_data.json
├── layout/          theme.liquid, password.liquid
├── locales/         fr.default.json, en.json
├── sections/        24 sections
├── snippets/        icon, meta-social, structured-data,
│                    command-palette, diagnostic-drawer
└── templates/       12 gabarits JSON
```

### Sections d'accueil

`home-hero` · `home-diagnostic` · `home-levers` · `home-results` ·
`home-method` · `home-work`

### Inventaire des pages rédigées

39 gabarits portent un contenu écrit spécifiquement, avec 27 enchaînements de
sections distincts :

| Famille | Pages |
|---|---|
| Services | SEO, Shopify, site vitrine, Meta Ads, CRO, SEO local, SEO e-commerce |
| Audits | SEO, Meta Ads, e-commerce, Merchant Center, analyse concurrentielle |
| Cibles vitrine | PME/TPE, indépendant, restaurant, artisan |
| Villes | Paris, Lyon, Marseille, Bordeaux, Nantes, Lille, Toulouse, Nice, Rennes, Strasbourg, Montpellier, Grenoble, Luxembourg |
| Pays | Suisse, Belgique |
| Institutionnel | accueil, à propos, résultats, études de cas, contact, hub géographique, plan du site, réservation |

Les 28 autres gabarits utilisent une structure sobre (titre + contenu saisi dans
l'admin) : pages légales et suffixes qu'aucune page publiée n'utilise. Aucun ne
porte de copie marketing, donc aucun risque de duplication latente.

### Sections réutilisables (composition de pages)

Toute page service se construit en assemblant ces sections dans un gabarit JSON,
sans écrire de Liquid :

| Section | Usage |
|---|---|
| `page-hero` | En-tête avec fil d'Ariane et bande de preuve |
| `content-split` | Démonstration en deux colonnes + liste de points |
| `content-grid` | Livrables, inclusions, bénéfices |
| `content-faq` | FAQ accessible + données structurées FAQPage |
| `content-prose` | Contenu éditorial dense (SEO local, guides) |
| `content-cta` | Bande de conversion de fin de page |
| `content-compare` | Tableau comparatif à trois colonnes |
| `content-stats` | Bande de contexte chiffré |
| `content-steps` | Process numéroté horizontal |
| `content-quote` | Prise de position pleine largeur |
| `page-sitemap` | Plan du site construit depuis les menus |
| `page-body` | Contenu saisi dans l'admin, masqué si vide |

`templates/page.agence-shopify.json` est l'exemple de référence : copiez-le
pour créer une nouvelle page service.

### Ajouter une page service

1. Créer la page dans l'admin Shopify (le handle donne l'URL).
2. Dupliquer `templates/page.agence-shopify.json` en `page.<handle>.json`.
3. Adapter les sections et les textes.
4. Ajouter la page au menu concerné — elle devient automatiquement trouvable
   dans la recherche ⌘K, l'index étant construit depuis les menus.

---

## Composants interactifs

Tous dans `theme/assets/signal.js`, tous dégradant proprement sans JavaScript.

- **En-tête caméléon** — s'ancre, se masque en descente, réapparaît en montée,
  et inverse son thème selon la surface qui passe dessous.
- **Mega-menu** — deux volets, descriptions par lien, volet de preuve chiffrée.
  Ouverture au survol avec intention, navigation clavier, `Échap`, piège de focus.
- **Palette de commandes (⌘K / Ctrl+K)** — index construit depuis les menus
  Shopify, recherche insensible aux accents, navigation flèches + `Entrée`.
- **Diagnostic multi-étapes** — sur `{% form 'contact' %}` natif. Logique
  conditionnelle (`data-step-when`), auto-avance sur choix unique, validation
  inline, progression conservée entre ouvertures. Sans JS, toutes les étapes
  restent affichées et le formulaire s'envoie normalement.
- **Sélecteur de frein** — motif ARIA tablist complet.
- **Timeline de méthode** — remplissage lié au défilement.
- **Canvas de signal** — tracé dessiné à la main, arrêté hors écran et onglet
  inactif pour ne pas consommer de CPU.

`prefers-reduced-motion` neutralise l'ensemble des animations.

---

## Référencement

- Titres et descriptions par métachamp : `seo_release.title_tag`,
  `seo_release.description_tag`, `editorial.excerpt`, `editorial.noindex`
  (mêmes clés que l'ancien thème — aucune ressaisie éditoriale).
- JSON-LD en graphe unique avec `@id` stables : `ProfessionalService` +
  `WebSite` + `WebPage`/`Article` + `BreadcrumbList`, sans doublon d'entité.
- `FAQPage` émis uniquement si la section contient au moins deux questions
  réellement rédigées, et désactivable par section pour éviter les doublons.
- Fil d'Ariane HTML sur toutes les pages internes.

---

## Déploiement

Le thème se pousse sur un **thème de préproduction non publié**. La mise en
ligne reste une décision manuelle, prise dans l'admin Shopify après relecture
de l'aperçu.

Les fichiers de `build/` et `src/` ne sont jamais envoyés à Shopify : seul le
contenu de `theme/` constitue le thème.

### Méthode d'envoi

Les fichiers sont poussés par `themeFilesUpsert` avec un corps de type `URL`
pointant vers le dépôt GitHub à un SHA figé. Shopify télécharge alors chaque
fichier lui-même — le contenu ne transite pas par la requête.

### Deux pièges à connaître

**1. L'envoi par URL masque les erreurs de validation.**
Quand Shopify refuse un fichier (schema invalide, syntaxe Liquid), la mutation
répond `userErrors: []` et `upsertedThemeFiles: []` : l'échec est silencieux.
Il faut donc **toujours relire les tailles après envoi** :

```graphql
theme(id: "gid://shopify/OnlineStoreTheme/…") {
  files(first: 50, filenames: [...]) { nodes { filename size } }
}
```

En cas de divergence, renvoyer le fichier en `TEXT` : ce mode remonte le vrai
message d'erreur.

**2. Un refus se propage en cascade.**
Une section refusée fait refuser tous les gabarits qui la référencent. Sur ce
projet, un `name` de schema à 26 caractères a fait échouer 53 gabarits d'un
coup. `build/qa.py` vérifie maintenant cette contrainte, ainsi que les
accolades dans une balise de sortie — les deux causes rencontrées.

### État de la préproduction

L'API Shopify interdit `themeFilesDelete` : les 241 fichiers de l'ancien thème
subsistent sur la préproduction. Ils ne sont plus référencés (aucun gabarit ne
pointe vers eux, aucune feuille de style n'est chargée) mais ils encombrent le
thème. Pour repartir totalement propre, les supprimer depuis l'admin Shopify —
ou dupliquer la préproduction dans un thème neuf après validation.

### Ce qui reste à composer

Les pages suivantes utilisent le gabarit de repli (en-tête + contenu de la page
Shopify + appel à l'action). Elles s'affichent correctement dans la nouvelle
identité, mais leur contenu métier n'a pas été réécrit :

- pages villes (13), pages SEO local, audits, Meta Ads, site vitrine par cible.

Pour les composer, dupliquer `templates/page.agence-seo.json` — c'est le
gabarit de référence, avec `page.agence-shopify.json` et `page.resultats.json`.

---

## Mise en ligne : procédure ordonnée

Le thème **CLICKSCREATION Signal — site complet** est prêt et non publié. Il ne
reste **qu'une opération** : publier le thème depuis l'admin Shopify.

Aucun réglage de page n'est à faire, ni avant ni après. Les 16 pages
géographiques sont déjà rattachées à leur gabarit, et chaque page publiée du
site porte un suffixe qui lui est propre — aucun gabarit n'est partagé par deux
pages, donc aucune page ne peut en cloner une autre après publication.

### Rattachement géographique — état réel

| Page | Suffixe | Gabarit |
|---|---|---|
| Consultant SEO Paris | `seo-paris` | page.seo-paris.json |
| Consultant SEO Lyon | `seo-lyon` | page.seo-lyon.json |
| Consultant SEO Rennes | `seo-rennes` | page.seo-rennes.json |
| Agence SEO Lille | `seo-lille` | page.seo-lille.json |
| Agence SEO Nice | `seo-nice` | page.seo-nice.json |
| Agence SEO Toulouse | `seo-toulouse` | page.seo-toulouse.json |
| Agence SEO Montpellier | `seo-montpellier` | page.seo-montpellier.json |
| Agence SEO Strasbourg | `seo-strasbourg` | page.seo-strasbourg.json |
| Agence SEO Grenoble | `seo-grenoble` | page.seo-grenoble.json |
| Agence SEO Marseille | `seo-local-marseille` | page.seo-local-marseille.json |
| Agence SEO Nantes | `seo-local-nantes` | page.seo-local-nantes.json |
| Agence SEO Bordeaux | `seo-local-bordeaux` | page.seo-local-bordeaux.json |
| Agence SEO Luxembourg | `agence-seo-luxembourg` | page.agence-seo-luxembourg.json |
| Consultant SEO Suisse | `seo-suisse` | page.seo-suisse.json |
| Consultant SEO Belgique | `seo-belgique` | page.seo-belgique.json |

À quoi s'ajoutent `a-propos` et `reserver`, rattachés dans le même mouvement.

### Le corps de page comme filet de sécurité

Un gabarit n'existe que dans le thème publié. Tant que **Signal** n'est pas en
ligne, Shopify retombe sur `page.json`, qui n'affiche que le titre et le corps
de la page. Les douze pages de villes ne contenaient qu'une phrase de
remplacement : elles auraient été vides pendant cet intervalle.

`build/bodies_geo.py` génère donc un corps HTML depuis le gabarit de chaque
ville — 415 à 528 mots, mêmes faits, même voix, structure suivant l'ordre de
sections propre à la ville. Résultat mesuré : 248 phrases longues comparées,
**zéro collision entre deux villes**.

Après publication ces corps ne sont plus rendus : aucun gabarit de ville
n'inclut `main-page` ni `page-body`. Ils ne créent donc **aucun contenu
dupliqué** — ils couvrent uniquement la fenêtre avant publication, et laissent
un contenu lisible dans l'admin.

```bash
python3 build/bodies_geo.py   # régénère les corps + audit de duplication
```

**Récapitulatif géographique** — 16 pages, 16 gabarits distincts :
13 villes (Paris, Lyon, Marseille, Bordeaux, Nantes, Lille, Toulouse, Nice,
Rennes, Strasbourg, Montpellier, Grenoble, Luxembourg) et 3 marchés
transfrontaliers (Luxembourg, Suisse, Belgique). Les 16 sont rattachées.

## Règles de rédaction

Le texte suit la logique AIDA, avec une contrainte : **le prospect doit savoir
ce qu'il gagne avant d'avoir fait défiler**.

| Étape | Où | Ce qu'elle doit faire |
|---|---|---|
| Attention | H1 du hero | Nommer le gain, pas l'activité de l'agence |
| Intérêt | accroche, sélecteur de symptôme | Dire comment, concrètement, en phrases courtes |
| Désir | résultats datés, méthode | Prouver, et lever le risque |
| Action | appel du pied de page | Une seule demande, sans friction |

Quatre interdits, tous vérifiés automatiquement :

1. **Le lexique creux** — « levier », « démarche », « solution », « booster »,
   « à vos côtés », « il est essentiel de »… Un mot qui ne dit rien au prospect
   ne reste pas.
2. **Les phrases de plus de 28 mots** — elles se relisent deux fois, c'est de
   la friction.
3. **Le hero sans gain nommé** — demandes, clients, trafic, ventes, appels,
   devis. Si aucun n'apparaît, le visiteur ne sait pas ce qu'il vient chercher.
4. **Les tics de rédaction** — un procédé répété de page en page sonne
   automatique, même quand chaque phrase prise seule est bonne. L'antithèse
   « X, pas Y » et la question rhétorique en titre sont comptées à l'échelle du
   site, pas de la page.

```bash
python3 build/copy.py                       # tout le site
python3 build/copy.py theme/templates/index.json   # un gabarit
```

État mesuré sur les 39 gabarits réellement publiés : **0 mot creux, 0 phrase de
plus de 28 mots, 0 hero sans gain nommé, 4 titres à tic** — ces quatre-là sont
gardés volontairement, parce qu'un procédé employé une fois est un effet de
style et non un tic.

Quatre pages parlent plus d'elles que du prospect : `resultats`,
`a-propos`, `etudes-de-cas` et `optimisation-cro`. C'est le sujet même des
trois premières ; la quatrième est à 20 contre 18, à surveiller sans plus.

## Contrôle anti-duplication

```bash
python3 build/qa.py          # validité Liquid, schemas, réglages
node build/render.mjs        # rendu HTML hors Shopify
node build/functional.mjs    # 28 tests d'interface
```

Le contrôle de duplication compare tous les champs longs et toutes les phrases
de plus de 60 caractères entre les gabarits. Il a détecté deux mutualisations
introduites par raccourci pendant la rédaction — blocs « méthode » et appels à
l'action partagés entre treize pages de villes — qui ont été réécrites page par
page. Résultat final : **0 champ identique, 0 phrase identique** sur 35 pages
rédigées, pour 25 enchaînements de sections distincts.

## Audit SEO et CRO

Les deux audits portent sur le **HTML réellement rendu**, pas sur les gabarits :
les balises se construisent dans le layout, les données structurées dans un
snippet, les liens dans les menus. Un audit qui lit les JSON passe à côté.

```bash
node build/render.mjs      # rend les 41 pages publiées dans build/preview
python3 build/audit_seo.py # structure, balises, snippets, maillage, cannibalisation
node build/audit_cro.mjs   # mesures navigateur : ligne de flottaison, friction
```

`build/live_pages.json` liste les pages publiées avec leurs métachamps SEO
réels. C'est ce manifeste qui rend l'audit fidèle — sans lui, la maquette
mesure un contenu de remplacement et masque les défauts.

### Ce que l'audit SEO vérifie

structure (un H1 et un seul, hiérarchie sans saut), balises (title et
description : présence, longueur, unicité), indexation (canonical, robots,
lang, Open Graph), volume de contenu utile, éligibilité aux extraits enrichis,
données structurées, maillage interne et pages orphelines, attributs alt,
et cannibalisation par recouvrement de vocabulaire entre title et H1.

### Ce que l'audit CRO mesure

Dans un navigateur réel, à 390 px et à 1440 px : promesse visible sans défiler,
bouton visible sans défiler, réassurance visible sans défiler, plus long trajet
sans occasion de convertir, distance entre le dernier bouton et le bas de page,
mots lisibles au premier écran, et coût du formulaire en champs obligatoires.

## Visuels de la bibliothèque Shopify

Les images ne sont pas des assets du thème : ce sont des fichiers de la
bibliothèque Shopify, référencés dans les gabarits sous la forme
`shopify://shop_images/<nom-du-fichier>`.

| Emplacement | Fichiers |
|---|---|
| Accueil — Réalisations | 7 captures de projets livrés |
| Accueil et Résultats — Logos | 6 logos clients |
| À propos | `equipe-clickscreation.webp` |
| Partage social (og:image) | `clickscreation-social-share-1200x630.png` |

**La couleur des logos décide du fond.** La section `content-logos` a un
réglage `surface` : clair pour des logos sombres, sombre pour des logos
clairs. Le réglage actuel est *clair*, déduit du fait que la bibliothèque
contient des variantes explicitement suffixées `_Blanc` — donc les fichiers
sans suffixe sont les versions sombres. À vérifier d'un coup d'œil après
publication ; si un logo disparaît, une bascule de réglage suffit.

`build/shop_files.json` associe chaque nom de fichier à son URL CDN. Le CDN
Shopify n'étant pas joignable depuis l'environnement de test, la maquette
sert des gabarits locaux **aux dimensions exactes** des fichiers réels : la
géométrie de la mise en page est donc fidèle, seul le contenu du visuel
diffère. `PREVIEW_CDN=1 node build/render.mjs` force les URL réelles.
