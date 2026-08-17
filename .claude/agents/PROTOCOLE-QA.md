# PROTOCOLE QA

Règles de test communes à toutes les missions, pilotées par l'agent 15 et opposables à tous les agents. Principe fondateur : **un résultat de test ne s'invente jamais ; un test non exécuté est un test qui a échoué.**

## 1. Matrice de test minimale

Toute livraison est testée sur :

| Dimension | Couverture minimale |
|---|---|
| Appareils | mobile, tablette, desktop |
| Navigateurs | Chrome, Safari, Firefox (dernières versions stables) |
| Largeurs | points de rupture du projet + 320 px + zoom 200 % |
| Entrées | tactile réel + clavier complet (tab, entrée, échap, flèches) |
| Préférences | `prefers-reduced-motion` activé |

La matrice ne peut être réduite que par arbitrage écrit du directeur technique.

## 2. Types de tests

- **Fonctionnels** : menus (dont méga menus et navigation mobile), liens et ancres, boutons et états, formulaires (validation, erreurs, soumission), popups et modales, sliders et carrousels, animations, recherche.
- **E-commerce** (si applicable) : fiches produits, variantes (dont épuisées), prix et promotions, panier, checkout complet en environnement de test, e-mails, comptes clients, collections et filtres.
- **Éditeurs CMS** : éditeur de thème Shopify et/ou éditeur WordPress / Site Editor — insertion, configuration, réordonnancement, suppression, rendu front fidèle.
- **Techniques** : console JavaScript (zéro erreur), onglet réseau (zéro échec inexpliqué), journaux serveur propres.
- **Transverses** : relevé performance de premier niveau et passe accessibilité automatisée (alerte précoce — validations officielles par les agents 12 et 13).
- **Automatisés** : unitaires (Vitest), end-to-end (Playwright multi-navigateurs), régression visuelle sur gabarits sensibles, accessibilité (axe) intégrée aux parcours ; exécution en CI (agent 16).

## 3. Cycle de vie d'un bug

1. **Reproduire** — étape préalable à tout ; sans reproduction, pas de correction possible. Un bug irreproductible est documenté (tentatives, environnements) et reste ouvert, jamais fermé en silence.
2. **Isoler** — réduire au cas minimal (bissection, désactivation ciblée, `git bisect`).
3. **Documenter** — rapport au format du § 4.
4. **Corriger** — par l'agent **propriétaire du code**, jamais par un tiers.
5. **Retester** — l'agent 15 rejoue **exactement le scénario d'origine** dans le même environnement.
6. **Vérifier la non-régression** — parcours adjacents et parcours critiques du projet.
7. **Clore** — avec preuve du retest (avant/après). 

**Règle absolue : jamais « corrigé » sans reproduction initiale + retest réel. Aucune exception, aucune pression de délai ne la lève.**

## 4. Format de rapport de bug

```
BUG-[numéro] · [titre court et précis]
Sévérité : bloquant / majeur / mineur / cosmétique
Environnement : appareil, OS, navigateur + version, URL, compte utilisé
Étapes de reproduction :
  1. …
  2. …
  3. …
Résultat attendu : …
Résultat obtenu : …
Preuves : captures / vidéo / journaux / trace
Fréquence : systématique / intermittent (taux constaté)
Agent propriétaire : [numéro]
```

## 5. Échelle de sévérité et règle de livraison

- **Bloquant** : parcours critique impossible (achat, contact), perte de données, faille visible, site cassé.
- **Majeur** : fonctionnalité importante dégradée sans contournement simple, erreur console récurrente, casse visuelle majeure.
- **Mineur** : dégradation avec contournement raisonnable, défaut localisé.
- **Cosmétique** : détail sans impact fonctionnel.

**Aucune livraison avec un bug bloquant ou majeur ouvert.** Les mineurs et cosmétiques restants sont arbitrés par le directeur technique et consignés dans le dossier de livraison.

## 6. Validation croisée

L'auteur d'une fonctionnalité n'est jamais son seul validateur (protocole de collaboration, § 7) : auto-tests du développeur → re-exécution par l'agent 15 → revues spécialisées concernées (12, 13, 14, 11) → validation du directeur technique. Les auto-tests du développeur ne dispensent d'aucun test de l'agent 15.

## 7. Outillage

- **Playwright** : parcours critiques end-to-end sur les trois moteurs, traces et captures activées.
- **Vitest** : logique JS/TS isolable.
- **Régression visuelle** : captures de référence par gabarit, seuils maîtrisés, mise à jour des références justifiée.
- **axe** (ou équivalent) : intégré aux parcours automatisés.
- Les suites tournent en CI (agent 16) ; une suite rouge bloque la fusion.

## 8. Traçabilité

Chaque campagne produit : plan de test, résultats cas par cas (réussi/échoué + preuve), liste des bugs par sévérité et statut, recommandation finale (livrer / corriger d'abord). Ces éléments alimentent le dossier de livraison (protocole de livraison).
