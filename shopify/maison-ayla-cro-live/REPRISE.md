# Reprise de session — Maison Ayla

Ce document est autosuffisant. Il permet de reprendre le travail sans relire
l'historique de la session précédente.

---

## 1. Contexte en dix lignes

**Maison Ayla** (maison-ayla.com) vend des abayas en France. Boutique Shopify,
domaine technique `mi407m-0y.myshopify.com`.

Le problème central : **0 commande sur 26 arrivées au checkout** sur les
30 derniers jours. Le trafic existe (699 sessions), les Françaises ajoutent au
panier à 6,1 % — un taux sain. **La rupture est intégralement à l'étape du
paiement.**

Tout le travail SEO et CRO en cours remplit un entonnoir dont la sortie est
bouchée. Le rappeler au client si l'occasion se présente, sans bloquer le travail
demandé.

---

## 2. Règles absolues

- **Ne jamais modifier ni publier le thème principal.** L'API Shopify refuse
  déjà les écritures sur le thème principal. **Attention, les rôles ont changé
  le 27/07/2026** — vérifier systématiquement avec une requête `themes` avant
  d'écrire, ne pas se fier à ce document :

  | Thème | ID | Rôle au 27/07/2026 |
  |---|---|---|
  | CRO Maison Ayla — guide des tailles 2026-07-26 | `202994123089` | **MAIN, publié** |
  | CRO Maison Ayla — PayPal PDP 2026-07-27 | `203073257809` | non publié, porte le correctif PayPal |
  | CRO Maison Ayla — 2026-07-24 | `202938614097` | non publié, ancien thème live |
- **Jamais de faux avis, de faux stock, de compte à rebours ni d'urgence
  fabriquée.** Le client a confirmé que les avis présents sur les fiches produits
  sont **réels, récoltés manuellement** — ne pas y toucher.
- **Ne jamais inventer une donnée SEO** : volume de recherche, position, moyenne
  de mots de la SERP. Semrush n'est pas inclus dans l'offre du client.
- **Branche git** : `claude/shopify-ayla-connector-d4wxaj` uniquement. Pas de
  pull request sauf demande explicite.
- **Ne pas filtrer sur le stock** : le client corrige les ruptures lui-même.

---

## 3. Tâche terminée — les 11 pages collection sont publiées

### État actuel

**20 collections sur 22 sont en ligne avec leur augmentation SEO.** Les onze
dernières ont été publiées le 27/07/2026 entre 16:01 et 16:11 :

| Collection | Publiée à | Produits |
|---|---|---|
| abaya-chic | 16:01 | 33 |
| abaya-simple | 16:03 | 30 |
| abaya-ouverte | 16:04 | 19 |
| abaya-papillon | 16:04 | 18 |
| abaya-verte | 16:05 | 14 |
| abaya-2-pieces | 16:06 | 12 |
| abaya-bleu | 16:07 | 11 |
| abaya-rose | 16:08 | 10 |
| abaya-saoudienne | 16:09 | 6 |
| abaya-blanche | 16:10 | 5 |
| abaya-beige | 16:11 | 3 |

Elles rejoignent les neuf déjà en ligne : abaya-mariage, abaya-dubai,
abaya-noir, abaya-kimono, abaya-soiree, abaya-marocaine, abaya-priere, abaya,
abaya-pas-cher.

**Restent hors périmètre :** `abaya-khaleeji` et `abaya-aid`, sans aucun
contenu — voir la section 5, qui devient la tâche prioritaire.

Vérification : `abaya-chic` a été relue intégralement après écriture, le
`descriptionHtml` en ligne est identique au fichier source (échappement CSS
`\2212` compris). Shopify réécrit seulement le `<ol>` du sommaire avec un
`<li>` par ligne, sans effet visuel. Les dix autres ont été contrôlées sur
`updatedAt` et sur un extrait de `description`.

Les identifiants Shopify sont dans `seo/collections/ids.json`.

### Procédure suivie, à réutiliser pour toute republication

1. Afficher le fichier :
   `python3 -c "print(open('seo/collections/abaya-chic.html',encoding='utf-8').read())"`
2. Envoyer la mutation avec le contenu **intégral et inchangé** :

```graphql
mutation Up($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection { handle updatedAt }
    userErrors { field message }
  }
}
```

Variables : `{"input": {"id": "<id de ids.json>", "descriptionHtml": "<contenu du fichier>"}}`

3. Vérifier que `updatedAt` correspond bien à maintenant.

### Pièges rencontrés

- **Ne pas demander `descriptionHtml` en retour** de la mutation : la réponse
  renvoie 9 Ko inutiles qui consomment le contexte.
- **Une erreur 502 de passerelle est déjà survenue** en cours d'écriture.
  Elle n'est pas idempotente côté client : **vérifier `updatedAt` avant de
  renvoyer**, une écriture peut ne pas être passée.
- Chaque publication coûte environ 9 Ko en lecture et 9 Ko en écriture. Les onze
  du 27/07 sont passées en une seule session, mais compter **7 à 8 collections**
  reste la marge prudente.
- **Impossible de vérifier sur le site public** depuis la session : la politique
  réseau de l'environnement refuse `maison-ayla.com` (403 au CONNECT du proxy).
  La seule vérification disponible est la relecture par l'API.
- Attention aux échappements JSON : le CSS contient `content: " \2212"`, qui
  doit s'écrire `\\2212` dans les variables JSON.

### Rollback

`seo/collections/_avant/` contient tous les `descriptionHtml` d'origine.

---

## 4. Ce que contient l'augmentation, et pourquoi

Les collections avaient **déjà un bon contenu** (507 à 926 mots, balises SEO
rédigées, FAQ en `schema.org`). **Rien n'a été réécrit.** Ont été ajoutés, avant
le repli `<details>` « Lire la suite » donc en tête de lecture :

1. **Trois liens produits** en ancres descriptives, sans prix (un prix se périme,
   une ancre non).
2. Le **rappel livraison offerte** + lien vers `/pages/guide-des-tailles`.
3. **Un sommaire** ancré sur les `Hn`, qui reçoivent un `id`.

Fondement : sur 30 jours, les 22 collections cumulent **32 sessions** quand un
seul article de blog en fait **261**. Or l'observation de la SERP sur « abaya
dubai » montre que les premiers résultats organiques sont **exclusivement des
pages collection e-commerce** (Asourd, Abaya.fr, Neyssa Shop, Brentiny Paris).
Le format qui ranke sur le commercial est donc celui qui est le plus faible ici.

---

## 5. Tâche prioritaire — les deux collections vides

`abaya-khaleeji` (19 produits) et `abaya-aid` (28 produits) ont un
`descriptionHtml` **totalement vide**. Leurs `seo.title` et `seo.description`
ont été créés, mais les pages n'ont aucun contenu.

47 produits concernés. `abaya-aid` est saisonnière et à fort volume.

**Ne pas improviser leur contenu.** La méthode du client impose : une page = une
requête, et une analyse SERP par requête avant rédaction. Il faut donc les
données de **Thruu** (outil de Samuel Schmitt, qui remonte les `Hn` des
concurrents) sur « abaya khaleeji » et « abaya aïd » :

- type de page qui ranke sur cette requête
- nombre de mots moyen des 10 premiers résultats organiques → viser cette
  moyenne **+ 100 à 150 mots**
- `Hn` et longue traîne des 3 premiers

La méthode complète est encodée dans l'agent `expert-seo-editorial`
(`.claude/agents/expert-seo-editorial.md`). **La lire avant toute rédaction.**

---

## 6. Le bouton PayPal — correctif appliqué, à prévisualiser puis publier

**Fait le 27/07/2026.** Le correctif est en place sur le thème `203073257809`
(non publié), dupliqué depuis le thème live. Il reste à le prévisualiser sur une
fiche produit et à le publier — le rendu n'a pas pu être constaté depuis la
session, `maison-ayla.com` étant refusé par la politique réseau.

La retranscription des 128 Ko a été évitée en passant par `stagedUploadsCreate`
puis `themeFilesUpsert` avec `body: { type: URL }`. Le `checksumMd5` du fichier
dans le thème est identique au MD5 du fichier patché localement : la fidélité
est prouvée. Méthode complète et diff appliqué dans `patches/`.

Le diagnostic d'origine, conservé pour mémoire :

PayPal est activé côté Shopify mais **n'apparaît pas** sur la fiche produit.

**Cause identifiée** : dans `templates/product.json`, la section
`product-information` — celle qui porte le bloc natif `accelerated-checkout` —
est `"disabled": true`. La fiche est rendue par `product-main-3`, une section
personnalisée de 128 Ko qui n'appelle jamais `payment_button`.

**Correctif** : `sections/product-main-3.liquid`, entre la ligne **1117**
(`</button>`) et la ligne **1118** (`{%- endform -%}`) :

```liquid
<div class="pdp__accelerated">{{ form | payment_button }}</div>
```

Le formulaire est ouvert ligne 915 par `{%- form 'product', prod, id: 'pdpForm' -%}`,
donc la variable `form` est disponible au point d'insertion.

Les règles CSS associées et le diff appliqué sont dans `patches/`.

À noter : la ligne 1135 contient un logo PayPal en SVG, purement décoratif. Ce
n'est pas un bouton, seulement une icône de réassurance — elle ne remplace pas
le paiement accéléré et n'a pas été touchée.

---

## 7. Autres chantiers en attente

| Sujet | État |
|---|---|
| Thème `203073257809` à publier | Porte le correctif PayPal. Dupliqué du live, donc il contient déjà le guide des tailles, la bulle MATW et le délai de livraison. Prévisualiser une fiche produit puis publier. |
| Thème `202994123089` | **Publié** depuis le 26/07. Ligne close. |
| `delivery_days: 6` | À passer à **12** dans l'éditeur de thème (contredit les 8 à 12 jours ouvrés annoncés ailleurs). `trust1_line2` à passer de « 48-72H » à « 24 à 72 h ». |
| Relance panier abandonné | Séquence rédigée dans `mailing/relance-panier-abandonne.md`. À configurer dans Marketing → Automatisations. Non faisable par l'API. |
| Trustpilot | Le connecteur attend l'identifiant Business Unit. **Note réelle : 4,0/5 sur 4 avis**, pas 4,6. |
| 25 produits en rupture totale | Le client s'en charge. |
| Plan éditorial 30 jours | `seo/plan-editorial-30-jours.md`. 11 articles restent à rédiger, chacun après analyse SERP. |

---

## 8. Repères de fichiers

```
shopify/maison-ayla-cro-live/
├── REPRISE.md                      ← ce document
├── patches/README.md               ← correctif PayPal
├── seo/
│   ├── cartographie-collections.md ← collection → requête, sans cannibalisation
│   ├── plan-editorial-30-jours.md
│   └── collections/
│       ├── README.md               ← détail des deux lots
│       ├── ids.json                ← handle → id Shopify
│       ├── *.html                  ← contenus augmentés
│       └── _avant/*.html           ← originaux, pour rollback
├── mailing/relance-panier-abandonne.md
├── pages/guide-des-tailles.html
└── blog/README.md

.claude/agents/expert-seo-editorial.md   ← méthode SEO à respecter
```

---

## 9. Première commande à passer

Les 11 collections de la section 3 sont publiées. La suite logique :

```
Lis shopify/maison-ayla-cro-live/REPRISE.md puis traite les deux collections
vides de la section 5 (abaya-khaleeji et abaya-aid).
```

Cette tâche exige les données SERP de Thruu en entrée : sans elles, ne pas
rédiger.

**Plus urgent que le SEO :** le thème `203073257809` porte le correctif PayPal
et attend d'être prévisualisé puis publié. Tant qu'il ne l'est pas, l'entonnoir
reste bouché — 0 commande sur 26 arrivées au checkout. Aucun contenu publié ne
compensera cela.
