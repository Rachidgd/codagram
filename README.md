# Ély'Skin Paris — thème Shopify sur mesure

Thème Online Store 2.0 écrit intégralement pour Ély'Skin. Aucun thème parent,
aucune bibliothèque front, aucun bloc repris d'un thème existant.

---

## 1. Direction artistique — « Le Protocole »

Ély'Skin n'est pas un institut de beauté : c'est un cabinet de soin. Le langage
visuel emprunte à la précision clinique — index numérotés, filets de 1 px,
mesures, grille asymétrique — et le réchauffe par une palette peau et une
géométrie douce.

**Ce que le thème s'interdit, par construction :**

| Interdit | Où c'est tenu |
|---|---|
| Polices à empattements | `src/ely.css` — deux familles sans serif, aucune autre déclarée |
| Titres surdimensionnés | échelle bornée : H1 maximum **50 px**, minimum 31 px |
| Mots coupés au retour à la ligne | `text-wrap: balance` sur les titres, `pretty` sur les paragraphes, bornes basses calées pour 320 px |
| Cartes à ombre portée | aucune `box-shadow` décorative — le relief se fait au filet |
| Dégradés décoratifs | seuls des voiles de lisibilité sur média, en `color-mix` de l'encre |
| Grande zone vide | espacement de section : 56 px mobile → 92 px desktop |
| Rayons arrondis « SaaS » | 2, 4 et 8 px ; la pilule est réservée aux boutons et à la navigation |

### Palette

| Jeton | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `porcelaine` | `#f6f3ef` | fond principal | — |
| `craie` | `#ebe5dd` | surface secondaire | — |
| `lin` | `#ded5c9` | surface appuyée | — |
| `encre` | `#191512` | texte principal | **16,8:1** sur porcelaine |
| `grain` | `#75695f` | texte secondaire | **4,81:1** sur porcelaine |
| `absolu` | `#1b3a31` | couleur signature | blanc **12,4:1** dessus |
| `brume` | `#9fb3aa` | texte secondaire sur vert | **5,60:1** sur absolu |
| `peau` / `peau-pale` | `#e0c4b2` / `#f0e2d9` | teintes chaudes, surfaces | décoratif |

Toutes les couleurs sont surchargeables depuis l'éditeur de thème : `theme.liquid`
émet un bloc `:root` que les utilitaires Tailwind consomment en `var()`.

### Typographie

Deux familles variables auto-hébergées, sous-ensemble latin, **56 Ko au total** :

- **Jost** (100–900) — titres et chiffres. Géométrique, tenue haute en display.
- **Instrument Sans** (400–700) — texte courant et interface. Grotesque neutre,
  lisible sous 18 px là où le géométrique fatigue.

Échelle fluide entièrement bornée par `clamp()` — aucune taille ne peut déraper
sur un écran très large ni casser sur un écran de 320 px.

| Rôle | Mobile 320 px | Desktop ≥ 1600 px |
|---|---:|---:|
| H1 | 31 px | 50 px |
| H2 | 29 px | 42 px |
| H3 | 22 px | 27 px |
| Texte courant | 15 px | 17 px |
| Surtitre | 11 px | 11 px |

---

## 2. Arborescence

```
assets/            ely.css (compilé), ely.js, diagnostic.js, 2 polices woff2
config/            settings_schema.json, settings_data.json
layout/            theme.liquid, password.liquid
locales/           fr.default.json, en.json
sections/          29 sections + header-group.json + footer-group.json
snippets/          8 snippets réutilisables
templates/         18 gabarits JSON + gabarits client et carte cadeau
src/               sources Tailwind (ely.css + 4 partiels)
scripts/           theme-check.mjs — recette automatisée
```

---

## 3. Installation et développement

```bash
npm install       # Tailwind v4 uniquement, aucune autre dépendance
npm run build     # compile src/ely.css → assets/ely.css (minifié)
npm run dev       # recompile à chaque modification
npm run check     # recette du thème
```

**`assets/ely.css` est un fichier compilé et versionné** : Shopify ne sait pas
exécuter Tailwind. Toute modification de style se fait dans `src/`, jamais
directement dans `assets/ely.css`, puis `npm run build` avant de committer.

### Recette automatisée (`npm run check`)

Contrôle sept familles d'erreurs qui cassent un thème en production et que la
relecture visuelle ne rattrape pas :

1. JSON valide dans chaque `{% schema %}` ;
2. chaque type de section cité par un gabarit existe ;
3. chaque `{% render %}` pointe vers un snippet existant ;
4. équilibre des balises Liquid (`if`, `for`, `form`, `paginate`…) ;
5. chaque clé de traduction utilisée existe en français **et** en anglais ;
6. présence de tous les gabarits obligatoires de Shopify ;
7. budgets de poids des ressources.

---

## 4. Mise en service sur la boutique

### Option A — intégration GitHub (recommandée)

1. Shopify admin → **Boutique en ligne › Thèmes › Ajouter un thème › Connecter
   depuis GitHub**.
2. Dépôt `rachidgd/codagram`, branche `claude/elyskin-shopify-site-y007mb`.
3. Le thème apparaît **non publié**. Le prévisualiser, le régler, puis publier.

Shopify synchronise ensuite dans les deux sens : les réglages faits par le
cabinet dans l'éditeur reviennent dans le dépôt. **Toujours faire un `git pull`
avant de reprendre le développement**, sous peine d'écraser le travail du client.

### Option B — Shopify CLI

```bash
shopify theme push --unpublished --theme "Ély'Skin — v1.0"
```

> **Règle non négociable avant toute publication** : dupliquer le thème en
> production et l'exporter. Le retour arrière consiste à republier la
> duplication — opération de moins d'une minute.

### Pages à créer dans l'admin

Chaque page de soin utilise un gabarit dédié. Créer les pages puis leur
affecter le gabarit correspondant (champ « Modèle de thème ») :

| Page à créer | Handle attendu | Gabarit à choisir |
|---|---|---|
| Hydrafacial | `hydrafacial` | `page.hydrafacial` |
| Microneedling | `microneedling` | `page.microneedling` |
| Peeling | `peeling` | `page.peeling` |
| Diagnostic infirmier | `diagnostic-infirmier` | `page.diagnostic-infirmier` |
| HIFU & radiofréquence | `hifu-radiofrequence` | `page.hifu-radiofrequence` |
| Luminothérapie LED | `luminotherapie-led` | `page.luminotherapie-led` |
| Drainage lymphatique | `drainage-lymphatique` | `page.drainage-lymphatique` |
| Contact | `contact` | `page.contact` |

Les liens internes du thème pointent déjà vers `/pages/<handle>` : respecter
ces handles évite d'avoir à reprendre les menus.

### Réglages à renseigner avant publication

Dans **Personnaliser › Réglages du thème** :

- **Le cabinet** — adresse, téléphone, e-mail, horaires (les deux champs), et
  surtout le **lien de réservation** : il alimente tous les boutons du site.
- **Identité** — logo clair et logo sombre (l'en-tête bascule automatiquement
  au-dessus des blocs verts), favicon, image de partage.
- **Réseaux** — dont la fiche Google Business, qui renforce le référencement local.

---

## 5. Le tarif, soin par soin

Chaque endroit qui affiche un prix propose le même réglage :

- **« À partir de … € »** — saisir le montant sans symbole (`140`) ;
- **« Sur devis »** — avec un champ d'explication libre, affiché sous la mention ;
- **« Ne pas afficher »** — sur l'index d'accueil et le méga-menu.

Le mode retenu pilote aussi les données structurées : `depuis` publie une
`Offer` avec `minPrice`, `devis` publie une `Offer` sans prix accompagnée de la
mention explicative. Aucun prix n'est jamais inventé pour satisfaire un schéma.

---

## 6. Le diagnostic interactif

Quatre questions — objectif, zone, réactivité de la peau, disponibilité — puis
un score par protocole calculé depuis les réglages de chaque bloc.

Deux critères sont **éliminatoires**, pas seulement pénalisants :

- protocole déconseillé sur peau réactive alors que la peau est déclarée réactive ;
- éviction sociale supérieure à la disponibilité annoncée.

Quand tout est écarté, l'outil ne propose pas un soin par défaut : il renvoie
vers le bilan. C'est un choix de responsabilité, et il évite d'orienter
quelqu'un vers un protocole contre-indiqué.

Le barème est en tête de `assets/diagnostic.js`, en clair et modifiable.

---

## 7. Accessibilité et performance

- **WCAG 2.2 AA** : contrastes vérifiés et documentés, focus visible dessiné,
  cibles tactiles ≥ 44 px, navigation clavier complète, `inert` sur les
  panneaux repliés.
- **`prefers-reduced-motion`** : coupe tout mouvement — apparitions, filets,
  curseur, aperçu flottant, transitions du tiroir — sans jamais retirer une
  fonctionnalité.
- **Sans JavaScript** : le contenu reste lisible et les parcours fonctionnent.
  Les réponses de FAQ sont dépliées, les panneaux du formulaire visibles à la
  suite, le diagnostic remplacé par la liste complète des protocoles. Un filet
  de sécurité posé dans `<head>` réaffiche tout si le script ne démarre pas.
- **Budget tenu** : CSS 13 Ko gzip, JS 7,5 Ko gzip, polices 56 Ko.
  Le module du diagnostic (4 Ko gzip) n'est téléchargé que sur les pages qui
  le contiennent, et seulement à l'approche de la section.
- **Zéro CLS induit** : toutes les images portent `width`/`height`, les
  conteneurs un `aspect-ratio`, et seules `transform` et `opacity` sont animées.

---

## 8. Référencement

- Données structurées : établissement (`@id` stable, réutilisé par référence),
  `Service` par protocole, `FAQPage`, `BreadcrumbList`, `Article`, `Product`,
  `ItemList` des protocoles.
- Un seul `h1` par page, hiérarchie `h2`/`h3` cohérente, sommaire d'article
  construit depuis les titres réels.
- `<title>` et meta description rendus par le thème avec repli sur la
  description de l'établissement — aucune page ne part sans description.
- Aucune chaîne en dur : tout passe par `locales/`, français et anglais.

---

## 9. Limites connues

- **Aucune image n'est fournie.** Les emplacements affichent un repli graphique
  maison (trame de filets) et non une silhouette générique. Le rendu ne sera au
  niveau qu'avec des photographies réelles du cabinet.
- **Les chiffres de la section « Résultats » sont des valeurs d'exemple.** Ils
  doivent être remplacés par des relevés réels avant publication : la note de
  source est obligatoire dès qu'un chiffre est avancé.
- **Les témoignages sont des exemples de mise en page.** Publier de faux avis
  est une pratique interdite ; les remplacer par des retours authentiques.
- **Le nom du praticien n'est pas renseigné** dans la section Expertise : c'est
  le premier levier de confiance de la page, à compléter en priorité.
- La recette automatisée ne remplace pas les tests sur appareils réels
  (Chrome, Safari, Firefox, iOS, Android), qui restent à exécuter sur le thème
  de prévisualisation avant publication.

---

## 10. Journal des versions

### 1.0.0

**Ajouté**
- Thème complet, 29 sections, 18 gabarits, 8 snippets.
- Sept pages de protocole avec contenu rédigé pour chaque soin.
- Diagnostic interactif en quatre questions, avec critères éliminatoires.
- Formulaire de contact en trois temps, validation au fil de la saisie,
  leurre anti-robot, repli complet sans JavaScript.
- En-tête à condensation, méga-menu à aperçu, tiroir mobile en `<dialog>` natif.
- Journal, article avec sommaire et progression de lecture.
- Données structurées complètes, locales française et anglaise.
- Recette automatisée `npm run check`.
