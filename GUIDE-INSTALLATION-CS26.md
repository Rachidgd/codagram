# CS-26 · Guide d'installation du thème Clickscreation

Thème Shopify OS 2.0 construit selon la spécification maître CS-26 v1.0.
Livrable : `clickscreation-cs26-theme-v1.0.0.zip`, prêt à uploader.

## 1. Upload

Admin Shopify → Boutique en ligne → Thèmes → **Ajouter un thème → Téléverser un fichier zip**.
Ne pas publier avant d'avoir déroulé la checklist ci-dessous (règle anti-404 §10.9 : zéro mise en ligne avant zéro erreur).

## 2. Pages à créer (handles EXACTS, manifest §9.1)

Admin → Boutique en ligne → Pages. Créer chaque page puis lui assigner son template (colonne de droite « Thème > Template »).

| Page (handle exact) | Template à assigner |
|---|---|
| `creation-site-internet` | page.service-creation-site |
| `agence-seo` | page.service-seo |
| `agence-google-ads` | page.service-google-ads |
| `agence-social-ads` | page.service-social-ads |
| `optimisation-conversion-cro` | page.service-cro |
| `maintenance-site-web` | page.service-maintenance |
| `agence-web-<ville-1>` | page.ville-a (villes avec ≥ 2 projets locaux) |
| `agence-web-<ville-2>` | page.ville-b (implantation récente) |
| `agence-web-<ville-3>` | page.ville-c (marché concurrentiel) |
| `realisations` | page.projets |
| `audit-gratuit` | page.audit |
| `contact` | page.contact |
| `plan-du-site` | page.plan-du-site |
| `mentions-legales`, `politique-de-confidentialite`, `cgv` | page.legal |

Blog : créer le blog `conseils` (les articles utilisent article.json automatiquement).

## 3. Metaobjects (§5.7) — Paramètres → Données personnalisées → Metaobjects

### Définition `projet` (activer « Pages web » avec le template `projet`)
Champs (clés exactes) : `titre` (texte) · `client` (texte) · `logo_client` (fichier) ·
`autorisation_logo` (vrai/faux) · `cover` (fichier) · `extrait` (texte, ≤ 160) ·
`secteur` (texte) · `ville` (texte) · `services` (liste de textes) ·
`chiffre_1_valeur` / `chiffre_1_label` · `chiffre_2_valeur` / `chiffre_2_label` ·
`chiffre_3_valeur` / `chiffre_3_label` (textes) · `contexte` (texte enrichi) ·
`realisation` (texte enrichi) · `resultats` (texte enrichi) · `temoignage` (texte, ≤ 220) ·
`temoignage_auteur` (texte) · `url_live` (URL) · `date` (date).

### Définition `ville`
`nom` (texte) · `accroche` (texte, ≤ 150) · `zones` (liste de textes) ·
`chiffre_1_valeur`/`chiffre_1_label` (+2, +3) · `gbp_url` (URL) ·
`projets` (références projet) · `avis` (références avis).

### Définition `avis`
`auteur` (texte) · `ville` (texte) · `note` (entier 1-5) · `texte` (texte, ≤ 220) ·
`source` (texte : google / trustpilot / autre) · `date` (date).

## 4. Metafields de page (namespace `cs`)

Paramètres → Données personnalisées → Pages :
- `cs.service_slug` (texte) : posé sur chaque page service ; pré-remplit le popup.
- `cs.ville` (référence metaobject `ville`) : posé sur chaque page ville ; alimente hero, zones et popup.

## 5. Menus (uniquement vers des handles du §2 — anti-404)

Navigation → créer :
- `main-menu` : Services (lien `/pages/creation-site-internet` + les 6 pages services en sous-items), Réalisations, Blog, Contact.
- `menu-villes` : les pages villes publiées (rangée du mega menu).
- `menu-footer-services`, `menu-footer-villes`, `menu-footer-ressources`, `menu-legal`.
Puis les brancher : éditeur de thème → Header (menu + menu villes) et Footer (3 colonnes + légal).

## 6. Réglages du thème à renseigner

- **Identité** : logo, favicon, nom légal, NAP complet, zones servies, fiche Google (`GBP_URL`), réseaux, image OG 1200 × 630.
- **Cookies** : ID GA4 (chargé uniquement après consentement, Consent Mode v2), lien politique.
- **Conversion** : mode du popup (audit + devis par défaut), barre sticky.
- Les palettes et le motion sont livrés préréglés aux valeurs de la spec (§3).

## 7. Données réelles (§15 — rien n'est inventé)

Les emplacements de preuve (chiffres, logos, avis, note moyenne) sont livrés **vides** :
un champ vide = bloc non rendu, jamais rempli au hasard (§0.2). À fournir par le CEO :
chiffres datés et attribuables, logos avec autorisation écrite (case à cocher dans le block logo),
avis sourcés Google/Trustpilot, matière locale par ville (une ville sans matière locale n'est pas publiée, §9.5).

## 8. QA avant publication (§10.9)

1. `shopify theme check` sur le dossier du thème.
2. Crawl préproduction (`npx linkinator <url> --recurse`) : zéro 404, zéro 301 interne.
3. Rich Results Test sur home, service, ville, projet, article, contact, audit.
4. Test sans JavaScript : tout le contenu doit se lire (§10.6).
5. Les deux thèmes (sombre et clair) écran par écran, contrastes AA.
6. Formulaire testé de bout en bout : email reçu, tags `lead-audit`/`lead-devis` posés, events dataLayer.
7. Refus cookies réellement respecté : aucun hit GA4.
8. Budgets §10.8 sur home + 1 service + 1 ville + 1 article (lab mobile 4G lente).

## 9. Écarts documentés (arbitrages, §0 rappel final)

1. **`sections/cs-stub.liquid`** (hors arborescence §5.1) : les templates JSON de la
   plateforme (product, collection, cart, search, customers/*) doivent référencer une
   section ; ce fichier unique porte les stubs exigés « minimaux, noindex, jamais maillés ».
   `templates/gift_card.liquid` ajouté : fichier requis par Shopify à l'upload.
2. **Plan du site** : rendu par `cs-richtext` via des blocks « liste de liens (silo) »
   branchés sur les menus réels (zéro lien inventé), plutôt qu'une section dédiée hors liste.
3. **Labels de l'éditeur** : rédigés en français directement dans les `{% schema %}`
   (le thème est monolingue FR) ; `fr.default.schema.json` reste présent.
4. **`robots.txt.liquid` / `llms.txt`** (§10.5) : non inclus au zip — le robots.txt natif
   Shopify autorise déjà GPTBot/ClaudeBot/PerplexityBot par défaut ; à confirmer côté infra
   comme le prévoit la spec.
5. **Textes par défaut** : propositions à valider (§12.4), dans les limites §12.2,
   sans aucun chiffre, avis ou logo inventé.
