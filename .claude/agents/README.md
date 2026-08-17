# Équipe d'agents · Studio web premium Shopify & WordPress

Version 2026.1 — 17 agents spécialisés + 5 protocoles communs, au standard d'un studio international travaillant sur des projets à plus de 10 000 € : thèmes Shopify sur mesure, sites WordPress/WooCommerce, expériences web premium.

## Arborescence

```
agents/
├── README.md
├── PROTOCOLE-COLLABORATION.md
├── PROTOCOLE-SHOPIFY.md
├── PROTOCOLE-WORDPRESS.md
├── PROTOCOLE-QA.md
├── PROTOCOLE-LIVRAISON.md
├── 00-directeur-technique.md
├── 01-architecte-shopify.md
├── 02-expert-shopify-liquid.md
├── 03-expert-shopify-headless.md
├── 04-architecte-wordpress.md
├── 05-expert-wordpress-php.md
├── 06-expert-woocommerce.md
├── 07-expert-front-end.md
├── 08-expert-animations.md
├── 09-webdesigner-ui-ux.md
├── 10-expert-cro.md
├── 11-expert-seo-technique.md
├── 12-expert-performance.md
├── 13-expert-accessibilite.md
├── 14-expert-securite.md
├── 15-expert-qa-debug.md
└── 16-expert-git-deploiement.md
```

## Les 17 agents en un coup d'œil

| Fichier | Rôle |
|---|---|
| 00-directeur-technique | Orchestrateur : analyse, architecture, répartition, arbitrages, validation finale |
| 01-architecte-shopify | Architecture Shopify : thèmes, métaobjets, Markets, APIs, arbre de décision |
| 02-expert-shopify-liquid | Thèmes Liquid natifs : sections, blocs, JSON templates, JS natif, locales |
| 03-expert-shopify-headless | Hydrogen, apps, Functions, extensions checkout/admin, GraphQL |
| 04-architecte-wordpress | Architecture WordPress : classique / hybride / Block Theme, modèle de contenu |
| 05-expert-wordpress-php | PHP 8.2+, blocs Gutenberg, theme.json, Interactivity API, i18n, sécurité |
| 06-expert-woocommerce | Catalogue, tunnel, HPOS, Store API, paiements, taxes, livraisons |
| 07-expert-front-end | HTML sémantique, CSS moderne, JS/TS, responsive, fallbacks |
| 08-expert-animations | GSAP, ScrollTrigger, Motion, Lenis, Three.js/WebGL, reduced motion |
| 09-webdesigner-ui-ux | Direction artistique, design system, maquettes, analyse de références |
| 10-expert-cro | Proposition de valeur, copywriting, CTA, réassurance, tests A/B éthiques |
| 11-expert-seo-technique | Structure, indexation, canonicals, hreflang, migrations, données structurées |
| 12-expert-performance | Core Web Vitals (LCP/INP/CLS), budgets, images, polices, scripts tiers |
| 13-expert-accessibilite | WCAG 2.2 AA, clavier, lecteurs d'écran, ARIA, tests manuels réels |
| 14-expert-securite | Sécurité WordPress & Shopify, secrets, scopes, webhooks, go/no-go |
| 15-expert-qa-debug | Matrice de tests, Playwright/Vitest, cycle de vie des bugs, non-régression |
| 16-expert-git-deploiement | Git, CI/CD, build, sauvegardes, déploiements, rollback |

## Portabilité — garanties

Ces fichiers sont conçus pour fonctionner **partout** :

- Aucune référence à une marque ou un modèle d'intelligence artificielle.
- Aucune commande propriétaire, aucun chemin de dossier imposé, aucun format spécifique à une plateforme d'agents.
- Chaque fichier est un **prompt système autonome et complet** : identité, mission, compétences, méthode, contrôles, tests, livrables, interdits, critères de fin.
- Les métadonnées YAML en tête des fichiers d'agents sont **génériques et facultatives** : tout outil peut les ignorer, et elles peuvent être supprimées sans perte.
- Les références croisées entre agents se font par numéro et par nom de rôle — elles fonctionnent aussi bien dans un orchestrateur automatisé que dans une organisation manuelle multi-sessions.

Compatibles avec : outils conversationnels (en instructions système ou personnalisées), environnements de développement assistés par IA, orchestrateurs multi-agents, workflows d'automatisation, dépôts Git (documentation d'équipe).

## Utiliser un agent seul

1. Ouvrir le fichier de l'agent voulu (ex. `02-expert-shopify-liquid.md`).
2. Copier son contenu intégral comme **instructions système** (ou premier message) de l'outil choisi.
3. Optionnel mais recommandé : coller à la suite le ou les protocoles pertinents (`PROTOCOLE-SHOPIFY.md` pour un agent Shopify, `PROTOCOLE-QA.md` pour tout développement…).
4. Donner la mission. L'agent posera ses questions d'audit, vérifiera les versions actuelles, planifiera, puis produira — conformément à sa fiche.

## Utiliser l'équipe complète

**Option A — orchestration dans une session unique :**
1. Charger `00-directeur-technique.md` comme instructions système.
2. Ajouter `PROTOCOLE-COLLABORATION.md` + les protocoles de plateforme concernés (+ QA et LIVRAISON).
3. Soumettre le projet : le directeur technique audite, choisit l'architecture, « endosse » ou invoque les rôles spécialisés selon vos instructions, et applique validation croisée et protocoles.
4. Selon l'outil, les fichiers d'agents peuvent être fournis comme documents de référence que le directeur technique consulte, ou chargés en sous-agents si l'environnement le permet.

**Option B — multi-sessions / orchestrateur :**
1. Créer un agent par fichier (17 sessions ou 17 agents configurés), chacun avec sa fiche comme prompt système + les protocoles communs.
2. Adresser toute demande d'abord au directeur technique ; transmettre ses ordres de mission aux agents concernés ; lui renvoyer leurs rapports (format du protocole de collaboration, § 6).
3. Respecter les règles : un fichier = un propriétaire, validation croisée obligatoire, aucune livraison sans les protocoles QA et LIVRAISON satisfaits.

## Mise à jour technologique

Les fiches intègrent l'état de l'art vérifié à la version 2026.1 (Shopify : templates JSON, GraphQL, Checkout Extensibility ; WordPress : 6.x, PHP 8.2+, Block Themes, Interactivity API, HPOS ; front : Core Web Vitals actuels, WCAG 2.2, European Accessibility Act…). Chaque agent a par ailleurs l'obligation permanente de **vérifier les versions et documentations officielles au démarrage de chaque mission** et de classer ses choix en sept catégories (stables, recommandées, préversion, expérimentales, dépréciées, à éviter, dépendances nécessaires). L'équipe reste donc à jour même quand ce dossier vieillit.
