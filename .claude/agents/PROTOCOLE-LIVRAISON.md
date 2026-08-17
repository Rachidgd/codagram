# PROTOCOLE DE LIVRAISON

Règles de clôture de toute mission. Le directeur technique (00) est responsable de son application ; l'agent 16 outille sauvegardes, versions et déploiements. **Sans dossier de livraison complet, la mission n'est pas terminée.**

## 1. Dossier de livraison — 16 éléments obligatoires

Chaque livraison au client comprend :

1. **Résumé de la mission** — demande initiale, objectifs, périmètre convenu.
2. **Diagnostic initial** — état des lieux constaté à l'audit (avec ses preuves).
3. **Architecture retenue** — option choisie et justification (issue de l'arbre de décision).
4. **Agents mobilisés** — qui a fait quoi.
5. **Fichiers créés** — liste exacte et emplacement.
6. **Fichiers modifiés** — liste exacte, nature des modifications.
7. **Fonctionnalités développées** — description utilisateur et technique.
8. **Tests réellement exécutés** — matrice couverte, environnements, qui a testé.
9. **Résultats des tests** — réussites, échecs traités, preuves.
10. **Problèmes restants** — bugs mineurs/cosmétiques arbitrés, avec statut.
11. **Limites connues** — contraintes assumées, cas non couverts.
12. **Instructions d'installation** — depuis zéro, vérifiées sur environnement propre.
13. **Instructions de déploiement** — procédure exacte par environnement.
14. **Procédure de rollback** — étapes, durée mesurée, responsable.
15. **Changelog** — entrées de la version livrée.
16. **Version finale prête** — tag posé, artefact livrable identifié.

## 2. Versions et changelog

- Chaque livraison porte un numéro de version (versionnement sémantique par défaut) et un tag Git correspondant.
- Le changelog suit un format type « Keep a Changelog » : sections **Ajouté / Modifié / Corrigé / Supprimé**, datées, en langage compréhensible par le client.
- Aucune livraison « silencieuse » : toute mise en production correspond à une version tracée.

## 3. Sauvegardes (rappel des règles non négociables)

- **Avant toute modification importante**, une version stable est conservée :
  - **Shopify** : duplication du thème de production + export du thème, datés ;
  - **WordPress** : sauvegarde fichiers + base de données, datée.
- Toute sauvegarde est **testée par une restauration d'essai** au moins une fois par projet — une sauvegarde non testée n'existe pas.
- La procédure de rollback est écrite, chronométrée sur la préproduction et exécutable par une personne n'ayant pas participé au développement.

## 4. Checklist finale (signée par le directeur technique)

La mise en production n'est autorisée que si chaque case est cochée :

- [ ] Les 7 phases de la méthode de travail ont été respectées (audit → veille technologique → plan → développement → tests → revue croisée → livraison).
- [ ] Tous les rapports d'agents sont remis au format standard, sans résultat inventé.
- [ ] La validation croisée est complète : développeur + QA (15) + revues concernées (11/12/13/14) + directeur technique.
- [ ] Zéro bug bloquant ou majeur ouvert (protocole QA, § 5).
- [ ] Les protocoles de plateforme (Shopify et/ou WordPress) sont satisfaits point par point.
- [ ] Console propre, éditeurs CMS fonctionnels, parcours critiques rejoués sur la version candidate.
- [ ] SEO : recette pré-bascule faite ; redirections prêtes à partir **avec** la mise en production (11).
- [ ] Performance : mesures avant/après consignées, budgets tenus ou écarts arbitrés (12).
- [ ] Accessibilité : non-conformités bloquantes/majeures corrigées et retestées (13).
- [ ] Sécurité : go explicite de l'agent 14, aucun secret exposé.
- [ ] Sauvegarde datée + restauration testée + rollback chronométré (16).
- [ ] Dossier de livraison complet (16 éléments) et remis.

## 5. Après la mise en production

- Vérifications post-déploiement immédiates (pages clés, tunnel, formulaires, journaux) — consignées.
- Surveillance rapprochée pendant la période convenue : erreurs, couverture SEO (11), données terrain de performance (12).
- Tout incident déclenche la procédure : rollback d'abord si le parcours critique est touché, diagnostic ensuite, correctif versionné, retest, nouvelle entrée de changelog.
- Clôture définitive : bilan court (ce qui a été livré, ce qui reste en dette, recommandations) archivé avec le dossier de livraison.
