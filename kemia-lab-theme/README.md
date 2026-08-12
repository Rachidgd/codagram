# Kemia Lab - Thème Shopify

Thème sur mesure construit à partir de la maquette Kemia Lab et du dossier Webmaster V2.
Aucune base de thème du Theme Store, aucun composant visuel générique.

## Structure

```
assets/     kemia.css (tokens + primitives), kemia-sections.css (sections), kemia.js
config/     settings_schema.json, settings_data.json
layout/     theme.liquid, password.liquid
locales/    fr.default.json
sections/   28 sections + header-group.json / footer-group.json
snippets/   icon, image, logo, stars, review-card, article-card, product-card, reviews-modal, meta-tags
templates/  index, product, page (+ science/about/faq/contact), blog, article, collection, cart, search, 404, customers
```

## Principes

- **Tout le contenu éditorial est administrable** depuis le Theme Builder ou depuis les champs méta produit. Aucun texte marketing n'est figé dans le code.
- **Les données produit pilotent l'affichage.** Aucune condition sur le nom ou le handle du produit : le thème fonctionnera à l'identique pour la deuxième et la troisième gamme.
- **La navigation utilise les menus natifs Shopify** (Boutique en ligne > Navigation), habillés à la charte Kemia Lab.
- **Les champs images sont volontairement vides.** Chaque emplacement affiche un aplat beige avec un pictogramme, qui indique où déposer le visuel.
- **Une section sans donnée ne s'affiche pas.** Avis, test utilisateurs, actifs, bénéfices : si le champ méta est vide, le bloc disparaît au lieu de laisser un trou.

## Design tokens

Extraits de la maquette, modifiables dans Personnaliser > Couleurs.

| Rôle | Valeur |
|---|---|
| Fond de page | `#FEFDFC` |
| Beige clair (cartes) | `#FBF8F5` |
| Beige (barre d'annonce, pied de page) | `#F8F1E9` |
| Titres | `#12161C` |
| Texte courant | `#63636A` |
| Doré champagne | `#C47A17` |
| Doré survol | `#A5640F` |
| Doré clair (filets) | `#E5C89F` |
| Bleu profond (bandeaux) | `#011F4B` |
| Bleu scientifique | `#002D9C` |
| Bleu très clair | `#F6F7FD` |

Largeur de contenu 1320 px, arrondi cartes 10 px, arrondi boutons 6 px.
Typographies : Montserrat (titres et texte), Playfair Display (titres éditoriaux de la page Science). Les trois sont modifiables dans Personnaliser > Typographie.

## Déploiement

Le thème s'importe sous forme d'archive ZIP contenant les dossiers ci-dessus à la racine.

Contrainte Shopify à connaître : **les valeurs `name` des schémas de section, de bloc et de preset sont limitées à 25 caractères.** Au-delà, Shopify écarte silencieusement le fichier à l'import.

Voir `docs/LIVRAISON.md` pour la recette complète et les éléments encore attendus du client.

## Attributions

L'icône « bras fléchi » du jeu de pictogrammes est dérivée de Lucide (licence ISC).
