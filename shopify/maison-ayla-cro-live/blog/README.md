# Blocs produits dans les articles du blog

## Pourquoi

Le blog représentait 397 sessions sur ~2 100 (19 % du trafic) pour 1 seul ajout au
panier. Les cinq articles ne contenaient aucune image produit et aucun lien vers
une fiche produit : le lecteur arrivait, lisait, et repartait sans jamais voir ce
que la boutique vend.

## Ce qui a été fait

Deux blocs `.ma-shop` ont été insérés dans chacun des cinq articles :

- un bloc **au milieu de l'article**, juste avant le deuxième `<h2>`, au moment où
  le sujet est le plus chaud ;
- un bloc **en fin d'article**, à l'intérieur du conteneur de l'article, avant sa
  balise fermante.

Chaque bloc contient 4 produits (image, titre, prix) et un lien vers la collection
correspondante. Grille responsive : 2 colonnes en mobile, 4 en desktop.

| Article | ID | Collection ciblée |
|---|---|---|
| robe-mariage-marocain-tunisien-oriental | 642796880209 | abaya-mariage |
| abaya-omra-hajj-pelerinage | 642407399761 | abaya-priere |
| robe-soiree-femme-voilee | 642726232401 | abaya-soiree |
| mode-modeste-2026-s-habiller-avec-style-femme-voilee | 642812019025 | abaya |
| djellaba-caftan-robe-orientale-differences-comment-porter-france | 642836824401 | abaya-marocaine |

## Fichiers

- `generate-blog-blocks.py` — génère les corps d'articles à partir des originaux
  (catalogue produits en dur dans le dict `P`, plan d'insertion dans `PLAN`).
- `blog_out.json` — corps générés, mise en forme d'origine.
- `blog_pushed.json` — corps réellement envoyés à Shopify (mêmes contenus, aplatis
  sur une ligne).
- `../_backup/blog/articles-original.json` — les cinq corps **avant** modification.

## Rollback

Réappliquer le corps d'origine depuis `_backup/blog/articles-original.json` :

```graphql
mutation UpdateArticleBody($id: ID!, $body: HTML!) {
  articleUpdate(id: $id, article: { body: $body }) {
    article { id handle }
    userErrors { field message }
  }
}
```

Attention : la variable `body` est typée `HTML!`, pas `String!`.

## Limite connue

Les images des cartes pointent vers des URLs CDN figées et les prix sont écrits en
dur dans le HTML. Si un prix ou une image produit change, il faut régénérer les
corps avec `generate-blog-blocks.py` après avoir mis à jour le dict `P`.
