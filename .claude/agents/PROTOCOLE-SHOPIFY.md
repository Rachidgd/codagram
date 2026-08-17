# PROTOCOLE SHOPIFY

Règles communes à toute mission Shopify. Agents concernés : 00, 01, 02, 03, et transversalement 07–16. Ce protocole complète les fiches d'agents ; en cas de doute, la documentation officielle Shopify **actuelle** fait foi et doit être vérifiée au démarrage de chaque projet.

## 1. Vérification technologique préalable (obligatoire)

Avant tout développement, l'architecte Shopify (01) — ou l'agent mobilisé — vérifie et consigne :

- la version d'API stable courante (versionnement trimestriel AAAA-MM) et la version cible du projet ;
- les dépréciations annoncées touchant le périmètre (rappels structurants : l'API REST Admin est en statut hérité — GraphQL obligatoire pour tout nouveau code ; `checkout.liquid` est supprimé — Checkout Extensibility est la seule voie ; `{% include %}` est déprécié au profit de `{% render %}`) ;
- les fonctionnalités stables vs en préversion (developer preview) — une préversion n'entre jamais en production sans validation écrite du directeur technique ;
- les capacités liées au plan Shopify du marchand (Functions, extensions checkout, marchés étendus, B2B) ;
- l'état des apps installées (maintenance, impact performance, conflits).

Le rapport suit les sept catégories : stables / recommandées / préversion / expérimentales / dépréciées / à éviter / dépendances réellement nécessaires.

## 2. Arbre de décision d'architecture

Dans l'ordre, retenir la première option qui couvre le besoin :

1. **Réglage natif ou app existante fiable** — aucun code.
2. **Modification ciblée du thème** — sections/snippets précis, sans refonte.
3. **Refonte du thème natif** — dette majeure ou nouveau design global.
4. **Extension de thème / app** — besoin fonctionnel isolé (logique serveur, checkout, admin).
5. **Architecture headless (Hydrogen)** — uniquement sur critère fort démontré (contraintes front impossibles en natif, multi-canal réel, équipe cliente capable de maintenir), validé par le directeur technique.

Interdits absolus : choisir le headless « parce que c'est moderne » ; imposer React dans un thème Liquid quand le JavaScript natif suffit.

## 3. Standards de thème

- **Structure** : templates JSON systématiques ; toute zone de contenu est une section ; blocs (y compris blocs de thème réutilisables et imbriqués) pour la granularité ; groupes de sections pour en-tête et pied de page ; snippets pour la réutilisation (`{% render %}` uniquement).
- **Administrabilité** : chaque section pertinente est configurable dans l'éditeur — libellés clairs, valeurs par défaut sensées, presets, limites raisonnables. **Le marchand modifie les contenus sans toucher au code.** Un contenu codé en dur qui devrait être un réglage, un métachamp ou un métaobjet est un défaut.
- **Données** : contenus structurés en métachamps/métaobjets avec définitions propres et sources dynamiques ; conventions de nommage documentées (espace de noms du projet).
- **Internationalisation** : aucune chaîne en dur — tout passe par les fichiers de locales ; compatibilité Markets (langues, devises, sélecteurs) vérifiée.
- **JavaScript** : natif (modules, custom elements), chargé en `defer`/module, par section et seulement où nécessaire ; panier via Cart API + Section Rendering API ; recherche via Predictive Search API ; recommandations via l'API dédiée.
- **CSS** : custom properties alimentées par les réglages du thème ; pas de styles inline évitables ; budget de poids respecté (protocole performance de l'agent 12).
- **Qualité** : `shopify theme check` sans erreur sur les fichiers livrés ; console propre.

## 4. Apps, extensions et Functions (agent 03)

- Scopes minimaux justifiés un par un ; authentification moderne (jetons de session / échange de jetons) ; secrets uniquement en variables d'environnement.
- Webhooks : HMAC vérifié, idempotence, webhooks de confidentialité implémentés.
- Checkout : uniquement les surfaces officielles de Checkout Extensibility ; aucune manipulation non supportée.
- GraphQL : requêtes minimales (champs utilisés uniquement), pagination par curseurs, gestion du coût et des limites de débit, version d'API épinglée et documentée.

## 5. Environnements, Git et déploiement (agent 16)

- Développement : boutique de développement ou thème de développement via Shopify CLI (`shopify theme dev`) ; jamais de modification directe du thème de production publié.
- **Sauvegarde avant tout** : duplication du thème de production (et export) avant toute intervention majeure — règle non négociable.
- Réglages du marchand : `settings_data.json` et les templates JSON de contenu sont modifiés par le marchand en production ; la stratégie de synchronisation (pull avant push, exclusions) est définie et vérifiée pour ne **jamais** écraser son travail.
- Bascule : thème candidat testé et validé (QA, SEO, performance, accessibilité) en préproduction/non publié, puis publication contrôlée ; rollback = republication immédiate du thème dupliqué.

## 6. Points de vigilance SEO, performance, sécurité (agents 11, 12, 14)

- Structure d'URL Shopify imposée (`/products/`, `/collections/`…) : les canonicals natifs et la gestion des collections dupliquant les produits sont vérifiés ; redirections gérées nativement lors des changements de handle.
- Apps : chaque app injectant des scripts est auditée (poids, blocage du rendu) ; les apps inutilisées sont désinstallées, pas seulement désactivées.
- Aucune clé Admin côté client ; aucune donnée sensible dans les métachamps exposés au storefront.

## 7. Tests minimaux spécifiques Shopify

Toute livraison Shopify inclut, en plus du protocole QA :

- éditeur de thème : ajout, configuration, réordonnancement, suppression des sections/blocs livrés, presets ;
- fiche produit : variantes (dont épuisées), prix, médias, ajout au panier ;
- panier/tiroir : quantités, suppression, remises, messages d'erreur ;
- recherche prédictive et filtres de collection ;
- multi-marché si actif : changement de langue et de devise ;
- `shopify theme check` et console sans erreur.
