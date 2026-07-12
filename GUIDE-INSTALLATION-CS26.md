# CS-26 · Guide d'installation du thème Clickscreation

Thème Shopify OS 2.0 construit selon la spécification maître CS-26 v1.0.
Livrable : `clickscreation-cs26-theme-v1.1.0.zip`, prêt à uploader.
**v1.1.0 : templates alignés sur les pages réelles de la boutique k4rdj6-sd
(lecture faite via le connecteur Shopify le 12/07/2026).**

## 1. Upload

Admin Shopify → Boutique en ligne → Thèmes → **Ajouter un thème → Téléverser un fichier zip**.
Ne pas publier avant d'avoir déroulé la checklist ci-dessous (§10.9 : zéro mise en ligne avant zéro erreur).

## 2. Vos pages ↔ templates livrés (aucune page à créer)

Vos 49 pages portent déjà leur suffixe de template ; le thème livre un
`page.<suffixe>.json` pour **chaque** suffixe. À l'upload, l'appariement est
automatique — vérifiez simplement dans Pages → Thème → Template.

| Suffixe déjà posé sur vos pages | Template livré | Gabarit |
|---|---|---|
| `contact` | page.contact | Formulaire + NAP |
| `agence-seo` | page.agence-seo | Service (stats + preuve Search Console) |
| `creation-site-vitrine` | page.creation-site-vitrine | Service (stack 4 étapes) |
| `ecommerce-shopify` | page.ecommerce-shopify | Service (media ×2 : fiches + tunnel) |
| `meta-ads` | page.meta-ads | Service (media ×2 : créas + résultats) |
| `agence-meta-ads` | page.agence-meta-ads | Service (comparatif) |
| `agence-shopify` | page.agence-shopify | Service (stack 3 terrains + garanties) |
| `seo-ecommerce` | page.seo-ecommerce | Service (bulles chantiers) |
| `seo-local` | page.seo-local | Service (media fiche Google) |
| `resultats` | page.resultats | Hub réalisations + filtres |
| `etudes-de-cas` | page.etudes-de-cas | Hub cas détaillés |
| `ressources` | page.ressources | Hub guides + liens |
| `hub-villes` | page.hub-villes | Hub des villes SEO |
| `ville-seo` (12 pages Consultant SEO) | page.ville-seo | **Piloté par vos métachamps `seo_ville`** |
| `ville-paris` … `ville-toulon` (9 pages Agence SEO) | page.ville-paris … page.ville-toulon | Gabarits A/B/C en rotation (§9.5) |
| `simple` (audits, à-propos, mentions, politique…) | page.simple | Hero + contenu de la page + CTA |
| `sitemap` | page.sitemap | Plan du site par silos (menus réels) |

Le manifest d'origine de la spec (page.service-*, page.ville-a/b/c, page.audit,
page.projets, page.plan-du-site, page.legal) reste livré : gabarits optionnels
réutilisables, leurs liens internes pointent déjà vers vos handles réels.

## 3. Pages villes SEO : vos métachamps `seo_ville` sont branchés

Le template `page.ville-seo` lit les métachamps que vous avez déjà remplis :
- `seo_ville.hero_subtitle` → sous-titre du hero,
- `seo_ville.ville` + `seo_ville.region` → sur-titre local,
- `seo_ville.intro` et `seo_ville.contexte_local` (texte enrichi) → corps local,
- `seo_ville.faq` (JSON) → accordéon + schema FAQPage automatique.

Un seul template, un contenu unique par ville (règle SELMA §9.5 respectée par les données, pas par du texte cloné).

## 4. Metaobjects (repli A7 appliqué)

Votre boutique n'a aucune définition de metaobject : les sections Réalisations
(`cs-projets`, `cs-resultats`) restent masquées tant que les metaobjects
`projet` n'existent pas — rien ne casse. Le jour où vous créez la définition
`projet` (champs listés en annexe du guide précédent, clés `titre`, `client`,
`cover`, `chiffre_1_valeur`…), les pages Résultats et Études de cas se peuplent seules.

## 5. Menus (uniquement vers des handles existants — anti-404)

Navigation → créer/vérifier :
- `main-menu` : Services (avec vos pages services en sous-items), Résultats, Ressources, Contact.
- `menu-villes` : vos pages villes publiées (rangée du mega menu).
- Menus footer : services, villes, ressources, légal.
Puis les brancher dans l'éditeur : Header (menu + menu villes), Footer (3 colonnes + légal),
page Plan du site et page Ressources (blocks « Liste de liens »).

## 6. Réglages du thème

- **Identité** : logo, favicon, nom légal, NAP, zones servies, fiche Google, réseaux, image OG.
- **Cookies** : ID GA4 (chargé uniquement après consentement, Consent Mode v2), lien politique.
- **Conversion** : mode du popup (audit + devis), barre sticky (active sur services, villes, hubs ; jamais sur simple/légal/contact).

## 7. Données réelles (§15 — rien n'est inventé)

Chiffres, logos, avis et note moyenne sont livrés **vides et masqués** (§0.2).
Logos : la case « autorisation écrite obtenue » doit être cochée pour publier (§2.3).

## 8. QA avant publication (§10.9)

1. Crawl préproduction (`npx linkinator <url> --recurse`) : zéro 404, zéro 301 interne.
2. Rich Results Test : home, un service, une ville SEO (FAQPage métachamps), contact.
3. Test sans JavaScript, deux thèmes (sombre/clair), contrastes AA, 320 px.
4. Formulaire de bout en bout : email reçu, tags `lead-audit`/`lead-devis`, events dataLayer.
5. Refus cookies réellement respecté : aucun hit GA4.

## 9. Écarts documentés

1. `sections/cs-stub.liquid` + `templates/gift_card.liquid` : stubs exigés par la plateforme.
2. `sections/cs-ville-seo.liquid` : repli metaobjects → métachamps `seo_ville` (décision A7, votre modèle de données réel fait foi).
3. Plan du site rendu par `cs-richtext` (blocks liste de menus réels).
4. Labels de l'éditeur en français directement dans les schemas.
5. Textes par défaut : propositions à valider (§12.4), limites §12.2, zéro donnée inventée.
