# Guide des tailles

## Pourquoi

Les fiches produits proposent des tailles (S à 2XL, XS à L, « 1 » et « 2 »,
« Taille unique ») sans qu'aucune page n'explique à quoi elles correspondent. Sur
des abayas à 26–65 €, l'incertitude sur la taille est le premier frein à l'ajout
au panier — la cliente ne peut pas trancher, donc elle ne commande pas.

## Ce qui a été fait

**Page `/pages/guide-des-tailles`** (Page ID `169181118801`, publiée) —
`guide-des-tailles.html` est la source de ce qui a été poussé.

Elle couvre : la règle de choix en une phrase, la méthode de prise de mesures,
la correspondance tailles lettres / tailles françaises, les modèles hors grille
(taille unique, tailles 1 et 2), le choix selon la coupe, la question de la
longueur, et une FAQ.

**Lien depuis les fiches produits** — `assets/ma-size-guide.js`, chargé par
`snippets/ma-cro-dev-fixes.liquid` uniquement quand `request.page_type == 'product'`.
Le script cherche le libellé de l'option de taille et insère le lien juste à côté ;
à défaut il se replie au-dessus du bouton d'ajout au panier. Il ne fait rien si le
thème propose déjà un lien vers un guide des tailles.

**Lien dans le menu Footer** — ajouté en deuxième position, juste après
« Recherche ». Ce lien est actif immédiatement, sans dépendre de la publication
du thème.

## Ce qui reste à trancher

Le tableau de correspondance donne des **mesures corporelles de référence du
prêt-à-porter français** (S = 36–38, tour de poitrine 84–88 cm, etc.), pas les
dimensions des vêtements. C'est indiqué explicitement dans la page.

Si le fournisseur fournit une grille en centimètres propre à ses modèles, elle
doit remplacer ce tableau — c'est la seule partie de la page qui repose sur une
convention plutôt que sur une donnée Maison Ayla.

## Incohérences de catalogue repérées au passage

- « XXL » sur certains produits, « 2XL » sur d'autres, pour la même taille.
  La page le signale à la cliente, mais l'idéal est d'uniformiser côté produits.
- Les abayas Farasha Almas sont numérotées « 1 » et « 2 », sans indication de
  correspondance sur la fiche.
- `hijab` et `sac-a-main-de-soiree` n'ont pas d'option de taille (`Default Title`)
  et n'appartiennent à aucune collection.

## Tests

`qa/size-guide/` — 42 assertions Playwright sur 8 structures DOM (legend/fieldset,
label simple, parent flex, absence de libellé de taille, lien déjà présent, page
non-produit, libellé en majuscules, rendu différé), plus l'idempotence sur double
exécution.
