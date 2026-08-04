# Envoi des articles vers Shopify

`bulkOperationRunMutation` est refusé par la politique de sécurité : chaque
article part donc dans un appel `articleUpdate` séparé.

Un fichier JSON par article, contenant les variables exactes de la mutation :

```graphql
mutation maj($id: ID!, $article: ArticleUpdateInput!) {
  articleUpdate(id: $id, article: $article) {
    article { handle isPublished }
    userErrors { field message }
  }
}
```

Un fichier déplacé dans `fait/` a été envoyé sans erreur. Ce qui reste à la
racine de `push/` reste à envoyer : c'est la liste de travail, et elle survit à
une reprise de session.

Régénérer l'ensemble : `python3 build/blog_push.py --publier`, puis le
découpage par article.
