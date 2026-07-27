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

- **Ne jamais modifier ni publier le thème principal.** Le thème publié est
  `202938614097` (« CRO Maison Ayla — 2026-07-24 »). Le thème de travail est
  `202994123089` (non publié). L'API Shopify refuse déjà les écritures sur le
  thème principal.
- **Jamais de faux avis, de faux stock, de compte à rebours ni d'urgence
  fabriquée.** Le client a confirmé que les avis présents sur les fiches produits
  sont **réels, récoltés manuellement** — ne pas y toucher.
- **Ne jamais inventer une donnée SEO** : volume de recherche, position, moyenne
  de mots de la SERP. Semrush n'est pas inclus dans l'offre du client.
- **Branche git** : `claude/shopify-ayla-connector-d4wxaj` uniquement. Pas de
  pull request sauf demande explicite.
- **Ne pas filtrer sur le stock** : le client corrige les ruptures lui-même.

---

## 3. Tâche prioritaire — publier 11 pages collection

### État actuel

9 collections sur 22 sont déjà en ligne avec leur augmentation SEO :
abaya-mariage, abaya-dubai, abaya-noir, abaya-kimono, abaya-soiree,
abaya-marocaine, abaya-priere, abaya, abaya-pas-cher.

### À publier

Le HTML est **déjà généré, vérifié et versionné**. Rien à rédiger.

| Fichier dans `seo/collections/` | Produits |
|---|---|
| `abaya-chic.html` | 33 |
| `abaya-simple.html` | 30 |
| `abaya-ouverte.html` | 19 |
| `abaya-papillon.html` | 18 |
| `abaya-verte.html` | 14 |
| `abaya-2-pieces.html` | 12 |
| `abaya-bleu.html` | 11 |
| `abaya-rose.html` | 10 |
| `abaya-saoudienne.html` | 6 |
| `abaya-blanche.html` | 5 |
| `abaya-beige.html` | 3 |

Les identifiants Shopify sont dans `seo/collections/ids.json`.

### Procédure, pour chaque collection

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
- Chaque publication coûte environ 9 Ko en lecture et 9 Ko en écriture. Compter
  **7 à 8 collections par session** avant épuisement du contexte.
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

## 5. Tâche suivante — les deux collections vides

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

## 6. Le chantier bloquant — le bouton PayPal

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

**Ce correctif n'a pas été appliqué automatiquement, volontairement** :
`themeFilesUpsert` remplace le fichier entier, ce qui imposerait de retranscrire
128 Ko sans garantie d'exactitude au caractère près. Le détail complet, les
règles CSS associées et le diff sont dans `patches/README.md`. **C'est au client
de coller ces quatre lignes.**

---

## 7. Autres chantiers en attente

| Sujet | État |
|---|---|
| Thème `202994123089` à publier | Contient le lien guide des tailles sur la fiche produit, la bulle MATW, le délai de livraison. Prévisualiser puis publier. |
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

```
Lis shopify/maison-ayla-cro-live/REPRISE.md puis publie les 11 collections
restantes listées en section 3.
```
