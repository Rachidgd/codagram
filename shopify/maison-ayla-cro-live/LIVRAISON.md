# Livraison — Reprise Trustpilot du cart drawer

**Projet** Maison Ayla · **Date** 2026-07-24 · **Version** 1.0.0
**Boutique** maison-ayla.com (`gid://shopify/Shop/103718420817`)

---

## 1. Résumé de la mission

Remplacer intégralement le faux bloc Trustpilot du cart drawer par une intégration
officielle, conforme à l'identité et aux conditions d'utilisation Trustpilot, sans
toucher au thème principal.

**Statut : livré sur staging, avec un blocage formel sur l'activation visuelle.**
Le connecteur est complet et testé. Le rendu de marque ne peut pas être activé tant
que les identifiants du compte Trustpilot Business de Maison Ayla n'ont pas été
fournis — conformément au §4 du brief, aucune approximation n'a été fabriquée.

---

## 2. Environnement

| | Thème | ID | Rôle | État après intervention |
|---|---|---|---|---|
| Cible | Maison Ayla - CRO LIVE 2026-07-24 | `202893754705` | UNPUBLISHED | modifié ✅ |
| Interdit | Maison Ayla - SEO Fix | `201404973393` | **MAIN** | **non modifié** ✅ |
| Sauvegarde | BACKUP CRO LIVE avant Trustpilot 2026-07-24 | `202934714705` | UNPUBLISHED | créée avant écriture ✅ |

Preuve de non-modification du thème principal : `updatedAt` du thème `201404973393`
inchangé à `2026-06-24T00:13:32Z`, relevé avant et après l'intervention. Aucune
mutation de publication n'a été émise ; le connecteur Shopify utilisé bloque par
conception toute écriture sur un thème publié.

---

## 3. Diagnostic initial

Le bloc refusé était intégralement fabriqué à la main dans `assets/ma-cro-cart-ui.js` :

- `fullStar()` / `partialStar()` — étoiles SVG dessinées à la main, remplies en `#0A0A0A` ;
- `createTrustBlock()` — wordmark « Trustpilot » recréé en HTML, note `4,6/5` codée en dur ;
- `aria-label="Aperçu test Trustpilot, note de maquette 4,6 sur 5"` — la note de test était
  annoncée aux lecteurs d'écran comme une notation ;
- `assets/ma-cro-dev-fixes.css` — 8 classes `.ma-cro-trust__*` reconstruisant la marque
  (cadre du logo, étoiles, wordmark), dont un libellé à **9 px** (sous le plancher de 11 px) ;
- placement : `footer.appendChild(...)`, soit **après** les mentions légales, et non
  immédiatement sous le CTA comme l'exige le §6.

Aucune trace d'accès Trustpilot officiel sur la boutique : ni app installée, ni
métachamp (`shop.metafields` ne contient que `mm_google_shopping_extension` et `weglot`),
ni fichier de thème référençant Trustpilot. Le faux rendu a donc été produit **faute
d'accès** — ce qui rend le blocage du §4 structurel, pas cosmétique.

---

## 4. Architecture retenue

Arbre de décision Shopify, option **2 — modification ciblée du thème**.
Aucune app, aucune extension, aucun headless : le besoin est un composant de
réassurance dans un drawer déjà 100 % Liquid + JS natif.

Principe directeur : **le thème n'affiche jamais la marque Trustpilot lui-même.**
Il réserve un emplacement et délègue tout le rendu au widget officiel.

```
snippets/ma-cro-dev-fixes.liquid
        └── render 'ma-cro-trustpilot'          ← source unique de configuration
                ├── <script id="ma-cro-trustpilot-config">   (JSON lu par le JS)
                ├── <script id="ma-cro-trustpilot-bootstrap"> (officiel, 1 seule fois)
                ├── <template id="maCroTrustpilotTemplate">   (code TrustBox officiel)
                └── assets/ma-cro-trustpilot.js  ← injection dans le drawer
```

---

## 5. Fichiers

### Créés

| Fichier | Rôle |
|---|---|
| `snippets/ma-cro-trustpilot.liquid` | Configuration, script officiel, gabarit TrustBox |
| `assets/ma-cro-trustpilot.js` | Injection, cycle de vie, garde de publication (8 409 o) |

### Modifiés

| Fichier | Avant | Après | Nature |
|---|---|---|---|
| `assets/ma-cro-cart-ui.js` | 10 737 o | 9 098 o | Suppression de `fullStar()`, `partialStar()`, `createTrustBlock()` et de toute référence `#maCroTrust` ; ajout de l'événement `ma:cart-state` |
| `assets/ma-cro-dev-fixes.css` | 3 753 o | 3 864 o | Suppression des 8 règles `.ma-cro-trust__*` ; ajout de l'habillage neutre `.ma-cro-tp*` |
| `snippets/ma-cro-dev-fixes.liquid` | 629 o | ~730 o | Ajout du `render 'ma-cro-trustpilot'` |

Les versions d'origine sont archivées dans `_backup/` pour le diff avant/après.

### Non touchés (vérifié)

Barre de livraison offerte, ajout au panier (`ma-cro-atc-safe.js`), code promotionnel,
recommandations produits (upsell), consentement newsletter, moyens de paiement dynamiques
(`maCroPaymentTemplate`), garde de tailles (`ma-cro-size-guard.js`).

---

## 6. Fonctionnement

### Trois états, un seul comportement sûr

| Identifiants | Thème | Rendu |
|---|---|---|
| fournis | quelconque | **TrustBox officielle** |
| absents | non publié + `test_mode = true` | Emplacement réservé, étiqueté « valeur de test 4,6/5 non vérifiée » |
| absents | publié (`role = main`) | **Rien du tout** |

### Gestion de la note 4,6/5 (§5 du brief)

- La valeur n'est **jamais** codée dans le composant : elle vit dans le seul
  `assign trustpilot_test_score` du snippet de configuration.
- Elle n'est jamais présentée comme une note réelle : le texte affiché porte
  explicitement « valeur de test … non vérifiée ».
- **Double verrou de publication.** Le drapeau Liquid `trustpilot_test_mode` ne suffit
  pas : le JS lit `window.Shopify.theme.role` et neutralise le mode maquette dès que le
  thème est publié, **même si le drapeau a été laissé à `true` par erreur**. Publier le
  thème ne peut donc pas mettre 4,6/5 en ligne.
- Aucune donnée structurée SEO n'est générée à partir de cette valeur.

### Comportement dynamique (§9)

- Insertion via `.cd-cta` → `insertAdjacentElement('afterend', …)` : le bloc atterrit
  entre le bouton de paiement et les mentions légales, jamais ailleurs.
- Anti-doublon : identifiant unique `#maCroTrustpilot`, contrôle d'appartenance au footer
  courant, purge d'un éventuel `#maCroTrust` hérité.
- Nombre d'articles : lu depuis l'événement `ma:cart-state` émis par `ma-cro-cart-ui.js`,
  qui interroge déjà `/cart.js` — **aucune requête réseau supplémentaire n'a été ajoutée**.
- Repli sans requête : `#cdFooter` est masqué par le drawer tant que le panier est vide.
- Observateurs : un observateur d'amorçage qui **se déconnecte dès la première
  initialisation réussie**, puis deux observateurs **d'attributs uniquement**
  (`style` sur `#cdFooter`, `class` sur `#cdPanel`). Aucun `childList`, aucun `subtree` :
  le module ne peut pas déclencher ses propres observateurs — boucle structurellement
  impossible.
- `data-trustpilot-ready="true"` posé uniquement quand l'iframe officielle est rendue.

### Performance et robustesse (§12)

Script officiel en `async`, chargé une seule fois par un `<script>` à identifiant unique
émis par le seul snippet qui a le droit de le faire. Aucune bibliothèque ajoutée, aucun
jQuery, aucun polling. Si Trustpilot ne répond pas, `loadFromElement` n'est jamais appelé,
l'erreur est absorbée, et le panier ainsi que le checkout restent intacts.

---

## 7. Tests réellement exécutés

**Banc** Chromium 1194 via Playwright 1.56.1, exécutant **les fichiers réellement poussés
sur le thème** contre une reproduction fidèle du DOM de `sections/cart-drawer.liquid`.
Suite reproductible : `qa/run.mjs` + `qa/drawer.html`.

**Résultat : 60 / 60 contrôles réussis.** Captures dans `qa/screenshots/`.

| Domaine | Contrôles | Résultat |
|---|---|---|
| Panier vide → aucun widget | 2 | ✅ |
| 1 produit → widget visible et bien placé (après CTA, avant mentions) | 6 | ✅ |
| Mutations 1→2→3→2→1→3, fermeture/réouverture → 1 seule instance | 4 | ✅ |
| Suppression du dernier produit → masqué | 1 | ✅ |
| Absence de boucle MutationObserver (DOM stable 1,2 s au repos) | 2 | ✅ |
| Garde de publication `role=main` → maquette non rendue | 2 | ✅ |
| Aucun vestige du faux Trustpilot, aucun SVG maison | 3 | ✅ |
| Responsive 320/360/390/430/768/1440 : pas de scroll horizontal, CTA visible, aucun texte < 11 px, marge 14 px + séparateur 1 px #E8E8E8 | 36 | ✅ |
| Mode officiel simulé : TrustBox clonée, lien de repli, repli silencieux sans script | 5 | ✅ |
| Erreurs console | sur chaque scénario | 0 |

### Non exécuté — et pourquoi

Le brief demande des **screenshots et une vidéo sur la vitrine réelle**, ainsi qu'une
matrice navigateurs (Safari iOS, Chrome Android, Safari macOS, Firefox). Ces tests
**n'ont pas pu être exécutés** : la politique réseau de l'environnement d'exécution
refuse `maison-ayla.com` (`CONNECT 403` au proxy). Les captures fournies proviennent du
banc local, pas de la vitrine. **Ces éléments restent dus** et doivent être produits par
l'équipe QA sur l'URL de prévisualisation avant validation :

```
https://maison-ayla.com/?preview_theme_id=202893754705
```

Le banc couvre la logique du module ; il ne remplace pas la validation du rendu réel du
widget officiel (impossible tant que les identifiants manquent, voir §8).

---

## 8. Blocage formel — accès Trustpilot Business

Conformément au §4 du brief (« l'équipe doit bloquer la livraison du composant et
demander les accès. Elle ne doit pas fabriquer une approximation »), **l'activation
visuelle est bloquée** en attente de cinq informations, à récupérer dans le compte
Trustpilot Business de Maison Ayla (Integrations → TrustBox) :

1. `businessunit-id` officiel ;
2. `template-id` du widget retenu (format compact recommandé pour tenir en 52–72 px) ;
3. URL du profil public Maison Ayla ;
4. confirmation que le widget est inclus dans le plan Trustpilot souscrit ;
5. confirmation que Maison Ayla contrôle bien ce profil Business.

Aucune de ces valeurs n'a été devinée, et aucun asset Trustpilot n'a été téléchargé
depuis une source non officielle.

### Activation, une fois les accès obtenus

Une seule modification, dans `snippets/ma-cro-trustpilot.liquid` :

```liquid
assign trustpilot_businessunit_id = 'LA_VALEUR_OFFICIELLE'
assign trustpilot_template_id     = 'LA_VALEUR_OFFICIELLE'
assign trustpilot_profile_url     = 'https://fr.trustpilot.com/review/maison-ayla.com'
```

Le composant bascule alors seul sur la TrustBox officielle. Aucun autre fichier à toucher.

### Avant publication en production

```liquid
assign trustpilot_test_mode = false
```

Puis vérifier que la note affichée est bien celle du widget officiel.

---

## 9. Conformité aux 15 critères d'acceptation

| # | Critère | Statut |
|---|---|---|
| 1 | Le faux logo a entièrement disparu | ✅ vérifié (0 nœud, 0 SVG maison) |
| 2 | Widget/asset officiel Trustpilot | ✅ connecteur livré — ⛔ activation bloquée §8 |
| 3 | Vert et étoiles de Trustpilot | ⛔ bloqué §8 — aucune couleur de marque approximée |
| 4 | Score de test limité au staging | ✅ double verrou (Liquid + `theme.role`) |
| 5 | Production sur note officielle | ✅ par construction |
| 6 | Pas d'affichage dans un panier vide | ✅ testé |
| 7 | Jamais de doublon | ✅ testé sur 6 mutations + réouverture |
| 8 | CTA prioritaire et visible | ✅ testé sur 6 résolutions |
| 9 | Drawer fonctionnel sans Trustpilot | ✅ repli silencieux testé |
| 10 | Rendu mobile validé sur screenshots réels | ⚠️ banc local uniquement — voir §7 |
| 11 | Aucun changement sur le thème principal | ✅ `updatedAt` inchangé |
| 12 | Procédure de rollback fournie | ✅ `ROLLBACK.md` |

---

## 10. Limites connues et dette relevée

- **Hors périmètre, non corrigé** : `patchPaymentDisplay()` dans `ma-cro-cart-ui.js` cible
  `.cd-acc-body`, alors que la classe réelle du drawer est `.cd-acc__body`. Ce sélecteur ne
  correspond donc à rien — code mort préexistant, sans effet visible. Laissé tel quel pour
  ne rien changer au comportement des accordéons ; à arbitrer séparément.
- L'observateur global de `ma-cro-cart-ui.js` (`document.documentElement`, `subtree: true`)
  est préexistant et hors périmètre. Le nouveau module n'en ajoute pas d'équivalent.
- Le titre accessible de l'iframe officielle est fixé par Trustpilot ; il devra être
  contrôlé visuellement lors de la recette avec les identifiants réels.

---

## 11. Changelog

### 1.0.0 — 2026-07-24

**Ajouté**
- `snippets/ma-cro-trustpilot.liquid` : configuration unique, script officiel chargé une
  seule fois, gabarit TrustBox officiel.
- `assets/ma-cro-trustpilot.js` : injection sous le CTA de paiement, anti-doublon,
  masquage sur panier vide, garde de publication, repli silencieux.
- Événement `ma:cart-state` diffusant le nombre d'articles sans requête supplémentaire.
- Suite de tests reproductible `qa/` (60 contrôles).

**Supprimé**
- `fullStar()`, `partialStar()`, `createTrustBlock()` et le bloc `#maCroTrust`.
- Les 8 règles CSS `.ma-cro-trust__*` reconstruisant la marque Trustpilot.
- La note `4,6/5` codée en dur dans le composant et son `aria-label` trompeur.

**Corrigé**
- Placement du bloc de réassurance : désormais entre le CTA de paiement et les mentions
  légales, au lieu de la fin du footer.
- Libellé de staging passé de 9 px à 11 px (plancher du §8).
