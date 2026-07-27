# Augmentation SEO des pages collection

## Ce qui a été constaté

Les 7 collections ciblées avaient déjà un contenu **solide** — 507 à 926 mots,
`seo.title` et `seo.description` bien rédigés, FAQ balisée en `schema.org/FAQPage`.
Rien à réécrire.

En revanche, sur les 7 collections :

- **0 lien produit** dans le texte
- **0 sommaire**
- Le contenu SEO est replié derrière un `<details>` « Lire la suite », donc sous
  la ligne de flottaison

D'où le parti pris : **augmenter, pas remplacer.**

## Ce qui a été ajouté

Inséré **avant** le repli « Lire la suite », donc visible immédiatement et lu par
Google en premier :

1. **Un bloc de liens produits** — 3 produits par collection, avec une ancre
   descriptive en contexte, pas une liste de prix. Aucun prix affiché : ils se
   périment, les ancres non.
2. **Un rappel livraison offerte + lien vers le guide des tailles**
3. **Un sommaire** avec ancres vers les `Hn`, qui reçoivent au passage un `id`.
   Les navigateurs modernes déplient automatiquement un `<details>` quand on
   navigue vers une ancre située à l'intérieur.

## Règle appliquée sur le choix des produits

**Seuls des produits réellement en stock sont liés.** Plusieurs best-sellers
remontés par `sortKey: BEST_SELLING` sont en rupture totale — les lier aurait
envoyé les visiteuses vers des impasses.

| Collection | Produits liés |
|---|---|
| abaya-mariage | Layla bleu nuit brodé or, Rania blanche, Layla bleu ciel |
| abaya-dubai | Nadia brodé, Farasha Almas vert sauge, Lyana gris |
| abaya-noir | Nour Noir Prestige, Maya noire, Warda noire |
| abaya-soiree | Inaya champagne, Farasha Almas vert sauge, Rania blanche |
| abaya-kimono | Lyana noir, Nadia brodé, Lyana gris |
| abaya-marocaine | Layla bleu ciel, Warda pourpre, Warda rouge |
| abaya-priere | Lyana noir, Alya lavande, Alya vert |

## État de publication

Les 7 collections sont **en ligne**, publiées le 27/07/2026 entre 06:31 et 09:15 :
abaya-mariage, abaya-dubai, abaya-noir, abaya-kimono, abaya-soiree,
abaya-marocaine, abaya-priere.

Deux `seo.title` manquants ont également été ajoutés hors de ce lot :
abaya-khaleeji et abaya-aid. Voir `../cartographie-collections.md`.

## Rollback

`_avant/` contient les 7 `descriptionHtml` d'origine, tels qu'ils étaient avant
toute modification.

## Pourquoi ce lot compte

Données Shopify sur 30 jours : les 22 collections cumulent **32 sessions**, tandis
qu'un seul article de blog en fait 261. Or l'observation de la SERP sur « abaya
dubai » montre que les premiers résultats organiques sont **exclusivement des
pages collection e-commerce** — Asourd, Abaya.fr, Neyssa Shop, Brentiny Paris.

Le format qui ranke sur le commercial est donc la collection, et c'est
précisément le format le plus faible du site aujourd'hui.

---

# Lot 2 — les 15 collections restantes

Généré le 27/07/2026, **sans filtre sur le stock** (demande explicite : les
ruptures seront corrigées séparément). Les trois produits liés par collection
sont donc les meilleures ventes brutes remontées par l'API.

## 13 collections augmentées et prêtes

abaya, abaya-pas-cher, abaya-chic, abaya-simple, abaya-ouverte, abaya-papillon,
abaya-verte, abaya-2-pieces, abaya-bleu, abaya-rose, abaya-saoudienne,
abaya-blanche, abaya-beige.

Même traitement que le lot 1 : bloc de trois liens produits, rappel livraison et
guide des tailles, sommaire ancré sur les Hn.

## 2 collections écartées — elles n'ont aucun contenu

`abaya-khaleeji` (19 produits) et `abaya-aid` (28 produits) ont un
`descriptionHtml` **vide**. Ce sont les deux mêmes qui n'avaient pas de
`seo.title` avant correction.

Elles ne relèvent pas d'une augmentation mais d'une **rédaction complète**, qui
exige au préalable l'analyse SERP de leur requête propre — « abaya khaleeji » et
« abaya aïd » — conformément à la règle « une page, une requête ». Improviser
leur contenu sans cette analyse contredirait la méthode.

47 produits sont concernés : c'est le plus gros trou SEO restant du catalogue.
