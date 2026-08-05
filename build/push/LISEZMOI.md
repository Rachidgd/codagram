# Envoi des articles vers Shopify

`bulkOperationRunMutation` est refusé par la politique de sécurité du
connecteur : chaque article part dans son propre appel `articleUpdate`.

Un fichier JSON par article, contenant les variables exactes de la mutation :

```graphql
mutation maj($id: ID!, $article: ArticleUpdateInput!) {
  articleUpdate(id: $id, article: $article) {
    article { handle isPublished publishedAt }
    userErrors { field message }
  }
}
```

Un fichier déplacé dans `fait/` est parti sans erreur. Ce qui reste à la racine
de `push/` reste à envoyer : c'est la liste de travail, et elle survit à une
reprise de session.

## Mise en ligne étalée

Les seize articles déjà en ligne ne reçoivent que leur nouveau corps :
modifier un article publié ne crée aucun événement de publication.

Les vingt-quatre brouillons portent en plus une `publishDate` décalée d'un jour
à l'autre, du 5 au 28 août. Shopify les révèle tout seul le jour dit : aucune
session quotidienne n'est nécessaire.

Passent en premier les brouillons vers lesquels un article déjà en ligne
renvoie. Tant qu'ils sont invisibles, ces liens sont morts pour un visiteur.

**Vérifié le 4 août** : `publishDate` seul, sans `isPublished`, programme bien
la sortie — l'API renvoie `isPublished: false` avec le `publishedAt` demandé, et
Shopify révèle l'article le jour dit. La combinaison `isPublished: true` + date
future est, elle, explicitement refusée.

## Métachamps

`build/blog_metafields.json` porte les 88 métachamps — `editorial.faq`,
`editorial.updated_date` et `global.title_tag` pour les articles retitrés —
à poser par `metafieldsSet`, vingt-cinq au maximum par appel.

La clé de date rejoint `editorial.updated_date`, déjà posée par l'ancien
système éditorial : en créer une seconde aurait laissé deux sources de vérité
pour la même information. Ils sont sortis des appels d'article : y
recopier la FAQ aurait dupliqué un texte déjà présent dans le corps.

## Régénérer

```
python3 build/blog_liens.py            # corrections mécaniques, sans effet si déjà passées
python3 build/blog_faq.py              # extrait les questions pour le balisage
python3 build/blog_push.py --publier   # contrôle : liens, doublons, marqueurs
python3 build/blog_calendrier.py       # découpe par article et pose le calendrier
```

`blog_push.py` refuse de produire quoi que ce soit tant qu'un article garde un
lien mort, un marqueur de travail ou une phrase recopiée d'un autre article.
