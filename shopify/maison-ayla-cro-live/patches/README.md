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

## État : appliqué le 27/07/2026

Le correctif **est en place** sur le thème `203073257809`
(« CRO Maison Ayla — PayPal PDP 2026-07-27 »), non publié, dupliqué depuis le
thème live `202994123089`. Le diff réellement appliqué est dans
`payment-button.diff`.

**Reste à faire, côté client :** prévisualiser ce thème sur une fiche produit,
vérifier que le bouton PayPal apparaît sous « Ajouter au panier », puis publier.

### Comment la retranscription de 128 Ko a été évitée

`themeFilesUpsert` remplace le fichier entier, et le retaper à la main aurait
été long et faillible. La contrainte est contournable : le champ `body` accepte
un type `URL` en plus de `TEXT`.

1. Lecture du fichier via l'API, extraction sur disque, vérification de la
   taille (128 337 octets).
2. Patch appliqué localement en Python — contrôle que le fichier privé des deux
   insertions reproduit l'original à l'octet près.
3. `stagedUploadsCreate`, puis envoi du fichier patché en `POST` multipart sur
   la cible Google Storage de Shopify. L'ETag renvoyé est le MD5 : il
   correspondait au MD5 local.
4. `themeFilesUpsert` avec `body: { type: URL, value: <resourceUrl> }`.

**Vérification finale :** le `checksumMd5` du fichier dans le thème vaut
`b5005803b98f7363a5dc8858b1e6b451`, identique au MD5 du fichier patché en
local, pour 129 073 octets. Aucun caractère n'a transité par une
retranscription — la fidélité est prouvée, pas supposée.

Le fichier temporaire déposé sur le bucket de transit est privé et expire seul
(24 h). Aucun fichier n'a été ajouté à la page Contenus de la boutique.

### Ce qui n'a pas pu être vérifié

Le rendu visuel. La politique réseau de l'environnement refuse
`maison-ayla.com`, la prévisualisation du thème n'est donc pas atteignable
depuis la session. La validité Liquid est étayée par l'absence de `userErrors`
à l'écriture et par le caractère élémentaire de l'insertion, mais elle n'a pas
été constatée sur une page rendue.

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
