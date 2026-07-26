# Bouton PayPal sur la fiche produit

## Le diagnostic

PayPal est activé côté Shopify mais n'apparaît pas sur la fiche produit, parce que
la section qui porte le bloc natif de paiement accéléré est **désactivée**.

Dans `templates/product.json` :

| Section | Type | État |
|---|---|---|
| `product_main_3_dnzYU8` | `product-main-3` | **active** — c'est elle qui rend la fiche |
| `product_main_2_Rzbf7j` | `product-main-2` | `disabled` |
| `section_ma_product_NiGb3t` | `section-ma-product` | `disabled` |
| `main` | `product-information` | `disabled` — **contient le bloc `accelerated-checkout`** |
| `product_recommendations_qggXJq` | `product-recommendations` | `disabled` |

La section native `product-information` déclare pourtant tout ce qu'il faut :

```json
"buy_buttons_eYQEYi": {
  "type": "buy-buttons",
  "blocks": {
    "add-to-cart":          { "static": true },
    "accelerated-checkout": { "static": true }
  }
}
```

Et `blocks/accelerated-checkout.liquid` contient bien `{{ form_obj | payment_button }}`.

Mais c'est `product-main-3.liquid` qui rend la page, et cette section personnalisée
(128 Ko, écrite par un développeur précédent) n'appelle jamais `payment_button`.

## Le correctif

Fichier : `sections/product-main-3.liquid`
Emplacement : entre la ligne **1117** (`</button>`) et la ligne **1118** (`{%- endform -%}`)

Le formulaire produit est ouvert ligne 915 par
`{%- form 'product', prod, id: 'pdpForm' -%}` — la variable `form` est donc
disponible au point d'insertion, ce qui est la condition pour que le filtre marche.

Coller ce bloc :

```liquid
          {%- comment -%} Paiement accéléré natif Shopify : n'affiche que les
          fournisseurs réellement activés sur la boutique (PayPal, Shop Pay,
          Apple Pay…). Rend une chaîne vide si aucun n'est actif. {%- endcomment -%}
          <div class="pdp__accelerated">{{ form | payment_button }}</div>
```

Puis ajouter ces règles à la fin du bloc `<style>` de la section (il se termine
ligne 652) :

```css
.pdp__accelerated { margin: 0 0 0.65rem; }
.pdp__accelerated:empty { display: none; margin: 0; }
.pdp__accelerated .shopify-payment-button__button { border-radius: 0; min-height: 56px; }
.pdp__accelerated .shopify-payment-button__more-options { font-family: var(--pdp-font); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; }
```

La règle `:empty` est importante : si aucun fournisseur accéléré n'est actif,
le filtre ne rend rien et le conteneur disparaît au lieu de laisser un blanc.

## Pourquoi ce n'est pas appliqué automatiquement

`themeFilesUpsert` remplace le fichier entier. Insérer une ligne dans un fichier
de 128 Ko imposerait de le retranscrire intégralement, sans aucune garantie
d'exactitude au caractère près. Le risque de corruption de la fiche produit est
disproportionné face à un copier-coller de quatre lignes.

## Optionnel : sortir le CSS de la section

`pdp-main-3.optionnel.css` contient les 41 Ko de CSS actuellement inline dans la
section (lignes 104 à 652), extraits tels quels — ils ne contiennent aucun Liquid,
donc ils sont externalisables sans adaptation.

Les déposer dans `assets/pdp-main-3.css` et remplacer le bloc `<style>…</style>`
par :

```liquid
{{ 'pdp-main-3.css' | asset_url | stylesheet_tag }}
```

Gain : 41 Ko de HTML en moins à chaque vue de fiche produit, et une feuille mise
en cache d'un produit à l'autre. À faire seulement si vous voulez le gain de
performance — ce n'est pas nécessaire au bouton PayPal.
