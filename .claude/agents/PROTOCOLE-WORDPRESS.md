# PROTOCOLE WORDPRESS

Règles communes à toute mission WordPress / WooCommerce. Agents concernés : 00, 04, 05, 06, et transversalement 07–16. Ce protocole complète les fiches d'agents ; en cas de doute, la documentation officielle WordPress et WooCommerce **actuelle** fait foi et doit être vérifiée au démarrage de chaque projet.

## 1. Vérification technologique préalable (obligatoire)

Avant tout développement, l'architecte WordPress (04) — ou l'agent mobilisé — vérifie et consigne :

- la version courante de la branche 6.x du cœur et la version du projet ; la version PHP (8.2 minimum exigé par le studio ; vérifier la compatibilité de l'hébergement) ;
- le statut des APIs utilisées : stables (theme.json, block.json, Interactivity API, Block Bindings pour les sources standard) vs expérimentales (certaines APIs de l'éditeur et extensions de Block Bindings — jamais en production sans validation écrite du directeur technique) ;
- côté WooCommerce : version courante, HPOS actif, panier/checkout en blocs ou hérités, statut des points d'extension du checkout ;
- l'état des plugins installés : maintenance active, compatibilité entre eux et avec le cœur, vulnérabilités connues ;
- l'hébergement : versions disponibles, extensions PHP, limites (mémoire, exécution), cache serveur.

Le rapport suit les sept catégories : stables / recommandées / préversion / expérimentales / dépréciées / à éviter / dépendances réellement nécessaires.

## 2. Arbre de décision d'architecture

Dans l'ordre, retenir la première option qui couvre le besoin :

1. **Réglage natif ou plugin maintenu et éprouvé** — aucun code.
2. **Modification ciblée** — hook, pattern, bloc ou template précis, sans refonte.
3. **Thème sur mesure** — classique, hybride ou Block Theme selon le besoin d'édition (choix motivé par l'architecte 04, pas par la mode).
4. **Blocs personnalisés et patterns** — granularité éditoriale spécifique.
5. **Plugin métier sur mesure** — logique fonctionnelle indépendante du thème.
6. **Headless** — uniquement sur critère fort démontré et validé par le directeur technique.

Interdits absolus : imposer Elementor, Divi, WPBakery ou tout constructeur de pages sans justification réelle validée ; recréer en fragile ce que le cœur ou WooCommerce fait nativement.

## 3. Standards de thème et de code

- **theme.json** : source de vérité des tokens (couleurs, typographies, espacements fluides) ; les styles globaux et par bloc y sont définis avant tout CSS additionnel.
- **Structure Block Theme** : templates et template parts HTML, patterns (synchronisés ou non), styles de blocs, variations ; verrouillage là où la liberté casserait le design.
- **Blocs** : `block.json` systématique, rendu dynamique (`render.php`) pour tout contenu évolutif, Interactivity API pour l'interactivité front standard, Block Bindings pour lier les métadonnées.
- **Séparation** : la logique métier (CPT, taxonomies, routes REST, intégrations) vit dans un plugin — jamais dans `functions.php` du thème ; le thème ne fait que présenter.
- **Sécurité (baseline de l'agent 14)** : validation des entrées, échappement des sorties, nonces + capacités sur toute action, `$wpdb->prepare` partout, `permission_callback` sur chaque route REST.
- **i18n** : text domain unique, toutes les chaînes traduisibles (PHP et JS).
- **Qualité** : PHPCS/WPCS sans erreur, PHPStan au niveau convenu, `WP_DEBUG` propre, assets enfilés et versionnés correctement, aucune modification du cœur ou de plugins tiers.

## 4. Standards WooCommerce

- Compatibilité **HPOS** obligatoire pour tout code touchant les commandes ; jamais d'accès direct aux tables héritées.
- Panier et checkout **en blocs** par défaut ; extensions via les points officiels (champs additionnels, Store API) ; shortcodes hérités uniquement en contexte existant justifié.
- Ne jamais recréer une fonctionnalité native (coupons, taxes, stocks, e-mails) ; surcharges de templates minimales et maintenues à jour.
- Parcours de paiement protégé : aucune donnée de carte côté serveur, aucun script non maîtrisé sur le checkout, webhooks signés et idempotents.
- Pages panier / checkout / compte exclues de tout cache.

## 5. Environnements et déploiement (agent 16)

- Développement en local (wp-env, conteneurs ou équivalent) puis préproduction — jamais directement en production.
- **Sauvegarde avant tout** : fichiers + base de données, datée et testée par restauration, avant toute intervention majeure — règle non négociable.
- Déploiement automatisé avec exclusions strictes (`wp-config.php`, uploads, caches) ; migrations d'URL via WP-CLI (search-replace sérialisé) vérifiées sur la préproduction.
- Préproduction non indexable ; production indexable (contrôle croisé avec l'agent 11 à chaque bascule).
- Rollback : restauration fichiers + base documentée, testée et chronométrée.

## 6. Points de vigilance SEO, performance, sécurité (agents 11, 12, 14)

- Permaliens et archives maîtrisés (archives inutiles désactivées ou noindexées, pages jointes redirigées) ; une seule source de balisage SEO (pas de doublon thème/extension).
- Cache page + cache objet configurés ; requêtes lentes traitées côté code (05/06) avant d'empiler du cache.
- Durcissement appliqué : édition de fichiers désactivée, debug hors production, comptes au moindre privilège, mises à jour planifiées.

## 7. Tests minimaux spécifiques WordPress

Toute livraison WordPress inclut, en plus du protocole QA :

- éditeur / Site Editor : insertion, configuration, sauvegarde de chaque bloc, pattern et template livré ; **rendu front strictement identique au rendu éditeur** ;
- rôles : l'éditeur et les rôles prévus peuvent faire leur travail, pas plus ;
- i18n : vérification des chaînes dans les langues actives ;
- WooCommerce le cas échéant : parcours d'achat complet en mode test (produit → variante → panier → checkout → e-mail → commande), taxes et livraison sur cas réels ;
- `debug.log` vierge de toute erreur/notice imputable au code livré ; console et réseau propres ;
- montée de version à blanc (cœur/plugins) sur la préproduction si la livraison touche des zones sensibles.
