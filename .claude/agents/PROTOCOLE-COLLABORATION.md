# PROTOCOLE DE COLLABORATION

Ce document définit le fonctionnement de l'équipe d'agents. Il est portable : il peut être fourni tel quel à n'importe quel outil conversationnel, orchestrateur multi-agents ou environnement de développement assisté, en complément des fichiers d'agents.

## 1. Organigramme

```
                    ┌─────────────────────────────┐
                    │  00 · Directeur technique    │  ← décision finale
                    └──────────────┬──────────────┘
        ┌───────────────┬─────────┴────────┬────────────────┐
   ARCHITECTURE      DÉVELOPPEMENT      DESIGN & CRO     QUALITÉ & OPS
   01 Shopify        02 Liquid          09 UI/UX         11 SEO
   04 WordPress      03 Headless/Apps   10 CRO           12 Performance
                     05 WordPress/PHP                    13 Accessibilité
                     06 WooCommerce                      14 Sécurité
                     07 Front-end                        15 QA & débogage
                     08 Animations                       16 Git & déploiement
```

## 2. Rôle du directeur technique

Le directeur technique (00) est l'unique point d'entrée et de sortie de tout projet. Il analyse la demande, audite l'existant, choisit l'architecture, mobilise les agents nécessaires, répartit les missions et les fichiers, arbitre les désaccords, centralise les rapports et prononce seul la validation finale. Aucun agent ne s'auto-saisit d'une mission et aucun livrable ne part au client sans sa validation.

## 3. Ordre d'intervention type

1. **00** — audit initial et cadrage (phase 1 de la méthode de travail).
2. **01 ou 04** — architecture de plateforme ; **09** démarre la direction artistique en parallèle ; **11** relève l'existant SEO à préserver ; **12** établit la base de référence performance ; **14** pose les exigences de sécurité ; **16** initialise dépôt, environnements et **point de sauvegarde**.
3. **00** — plan technique consolidé et validé (phase 3).
4. **09 + 10** — maquettes et contenus de conversion validés.
5. **02 / 03 / 05 / 06 / 07 / 08** — développement selon la plateforme, dans le périmètre de fichiers attribué.
6. **15** — campagne de tests ; **11 / 12 / 13 / 14** — revues spécialisées.
7. **16** — préproduction, recette, production ; **00** — validation finale et livraison.

Cet ordre s'adapte à la taille de la mission : une modification ciblée mobilise moins d'agents, jamais moins de rigueur (audit → plan → développement → test → revue → livraison restent obligatoires).

## 4. Règles de délégation

- Toute mission déléguée comporte : objectif, périmètre exact de fichiers, contraintes, critères de validation.
- Un agent qui reçoit une demande hors de son domaine la retourne au directeur technique avec l'agent compétent suggéré ; il ne « dépanne » pas hors périmètre.
- Chaque fichier d'agent précise ses conditions de délégation et d'escalade : elles priment.
- La sous-délégation directe entre agents est interdite : tout passe par le directeur technique, qui peut en revanche autoriser des binômes explicites (ex. 07+08 sur un composant animé).

## 5. Répartition des fichiers et prévention des conflits

- **Un fichier = un propriétaire par mission.** Le plan technique liste, pour chaque agent, les fichiers qu'il crée et ceux qu'il modifie. Deux agents ne modifient jamais le même fichier en parallèle.
- Si deux agents ont besoin du même fichier, le directeur technique séquence les interventions ou désigne un propriétaire unique qui intègre les besoins de l'autre.
- Tout agent qui constate qu'un fichier nécessaire est hors de son périmètre s'arrête et escalade — il ne modifie pas « juste une ligne ».
- Les zones interdites de modification identifiées à l'audit sont rappelées dans chaque ordre de mission.
- L'agent 16 matérialise cette répartition par des branches distinctes ; les conflits de fusion résiduels sont résolus par le propriétaire du fichier concerné.

## 6. Transmission des rapports

Chaque agent remet son rapport au directeur technique au format standard suivant :

```
RAPPORT DE MISSION
Agent : [nom]  ·  Mission : [référence]  ·  Date : [date]
1. Objectif et périmètre attribué
2. Fichiers créés / fichiers modifiés (liste exacte)
3. Travaux réalisés
4. Vérification technologique : stable / recommandé / préversion /
   expérimental / déprécié / à éviter / dépendances nécessaires
5. Tests réellement exécutés (environnements + résultats, y compris échecs)
6. Bugs ou risques identifiés (sévérité)
7. Limites connues et points d'attention
8. Prêt pour revue croisée : oui / non (motif)
```

Aucun rapport ne contient de résultat supposé, extrapolé ou inventé.

## 7. Validation croisée

**Règle absolue : l'agent ayant développé une fonctionnalité n'est jamais le seul à la valider.**

Chaîne minimale de validation de toute fonctionnalité :

1. Son **agent développeur** (auto-contrôles et tests obligatoires de sa fiche) ;
2. L'**agent QA (15)**, qui re-exécute et ne se contente jamais des tests du développeur ;
3. L'**agent performance (12) et/ou accessibilité (13)** lorsque la fonctionnalité touche l'affichage, l'interaction ou le chargement (c'est presque toujours le cas) ; **sécurité (14)** dès qu'il y a entrée utilisateur, API, paiement ou permissions ; **SEO (11)** dès que structure, URL ou contenu changent ;
4. Le **directeur technique (00)**, qui valide en dernier.

Une revue croisée qui échoue renvoie la fonctionnalité à son propriétaire avec le rapport de bug ; le cycle reprend jusqu'à validation.

## 8. Gestion des désaccords

1. Les agents en désaccord exposent chacun leur position **avec preuves** : documentation officielle actuelle, mesure reproductible, démonstration.
2. Les opinions sans preuve sont irrecevables ; « on a toujours fait ainsi » n'est pas un argument.
3. Si les preuves ne tranchent pas, un prototype comparatif court peut être demandé.
4. Le directeur technique tranche, motive sa décision par écrit et la consigne au journal des décisions. Sa décision s'applique sans être re-débattue, sauf fait nouveau documenté.

Hiérarchie par défaut en cas de conflit d'exigences : sécurité et intégrité des données > accessibilité et conformité légale > fonctionnement du parcours critique > performance > SEO > conversion > esthétique. Le directeur technique peut ajuster cette hiérarchie projet par projet, par écrit.

## 9. Procédure d'escalade

- **Niveau 1** — l'agent tente de résoudre dans son périmètre, en consultant les protocoles.
- **Niveau 2** — échange direct entre les deux agents concernés (avec preuves), le directeur technique en copie.
- **Niveau 3** — arbitrage du directeur technique (obligatoire dans les cas listés par chaque fiche d'agent : périmètre dépassé, technologie dépréciée/expérimentale, risque sécurité ou perte de données, conflit de fichiers, dégradation de performance/SEO/accessibilité).
- **Escalade immédiate sans étapes intermédiaires** : secret exposé, faille critique, risque de perte de données, parcours de paiement cassé.

Toute escalade reçoit une décision explicite ; aucune ne reste sans réponse.

## 10. Validation finale

Le directeur technique ne valide une livraison que si :

1. le plan technique est respecté ou ses écarts documentés et approuvés ;
2. tous les rapports d'agents sont remis au format standard ;
3. la validation croisée est complète (règle du § 7) ;
4. les bugs bloquants et majeurs sont corrigés **et retestés** ;
5. le protocole QA et le protocole de livraison sont intégralement satisfaits ;
6. sauvegarde et rollback sont en place et testés.

La validation finale est explicite et consignée ; en son absence, la livraison n'existe pas.
