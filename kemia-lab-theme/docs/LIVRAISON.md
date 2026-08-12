# Kemia Lab - Dossier de livraison

Version 1.1.4 | Thème `KEMIA LAB - v1.1.4` (non publié) | Boutique `pcmxbb-83.myshopify.com`

---

## 1. Ce qui a été livré

### Thème
28 sections, 9 snippets, 20 templates, 2 feuilles de style, 1 fichier JavaScript sans dépendance externe.

### Pages construites d'après la maquette
| Page | Template | Statut |
|---|---|---|
| Accueil | `index.json` | Construite, sans prix produit |
| Fiche produit | `product.json` | Construite |
| Science | `page.science.json` | Construite |
| Blog + article | `blog.json` / `article.json` | Construits, 6 articles publiés |
| À propos | `page.about.json` | Construite |
| FAQ | `page.faq.json` | Construite, 10 questions sur 5 catégories |
| Contact | `page.contact.json` | Construite |
| Panier, recherche, 404, collection, comptes | liquid / json | Construits |

### Données Shopify créées
- Produit **4 VITALITY SYSTEM** avec l'option `Cure` et 3 variantes : Cure 1 mois 49,90 €, Cure 2 mois 89,80 € (barré 99,80 €), Cure 3 mois 127,24 € (barré 149,70 €).
- 24 définitions de champs méta dans l'espace de noms `kemia`.
- 3 définitions de métaobjets : bénéfice, actif, résultat de test utilisateurs.
- 4 bénéfices et 7 actifs saisis.
- 3 pages créées (Science, À propos, FAQ), page Contact existante rattachée.
- Blog renommé en « Blog » (`/blogs/blog`) avec 6 articles.
- 6 menus natifs : menu principal, 4 colonnes de pied de page, mentions légales.

---

## 2. Champs méta produit (espace de noms `kemia`)

| Clé | Type | Rôle |
|---|---|---|
| `tagline` | texte | Accroche dorée sous le nom du produit |
| `short_usp` | texte multiligne | Paragraphe de la buy box |
| `rating` | décimal | Note sur 5 |
| `review_count` | entier | Nombre d'avis |
| `reviews_json` | JSON | Avis clients, voir §3 |
| `benefits` | liste de métaobjets | **Cellules bénéfices** de la fiche produit et de la homepage |
| `ingredients` | liste de métaobjets | Actifs et dosages |
| `usage_dosage` / `usage_timing` / `usage_duration` | texte | Bloc utilisation |
| `precautions_short` | liste de textes | Conseils visibles |
| `precautions_full` | texte enrichi | Fenêtre « En savoir plus » |
| `consumer_test_enabled` | booléen | Interrupteur du bloc test utilisateurs |
| `consumer_test_participants` | entier | Nombre de testeurs |
| `consumer_test_duration` | texte | Durée du test |
| `consumer_test_results` | liste de métaobjets | Jusqu'à 3 statistiques |
| `consumer_test_methodology` | texte enrichi | Méthodologie |
| `vegan` / `non_gmo` | booléens | Réservés à l'affichage conditionnel |
| `manufacturing_country` | texte | Pays de fabrication |
| `quality_points` | liste de textes | Points qualité |
| `formulation_story` | texte enrichi | Logique de formulation |

Champs méta variante : `kemia.duration` (« 30 jours ») et `kemia.note` (sous-titre CRO de la cure).

---

## 3. Avis clients

**État actuel : contenu de démonstration.** Les six avis renseignés sont les témoignages figurant dans la maquette fournie par Kemia Lab. Ils ne proviennent pas de clients réels et **doivent être remplacés par des avis authentiques avant la mise en ligne**.

Deux points à traiter avant publication :
- L'authenticité. La réglementation européenne impose de ne publier que des avis réellement émis par des acheteurs, et de décrire le processus de vérification. La mention « Client vérifié » ne doit être conservée que si un contrôle existe réellement.
- Les allégations contenues dans les témoignages. Un avis ne permet pas d'affirmer indirectement ce qui serait interdit dans le texte commercial. Les six textes retenus ont été gardés proches de la maquette mais volontairement sans promesse de santé.

Le compteur affiche 6, soit exactement le nombre d'avis présents dans le jeu de données. La maquette affichait 320 : ce chiffre ne doit être remis qu'avec 320 avis réels derrière, sous peine d'incohérence entre le nombre annoncé et le contenu affichable.

Pour remplacer les avis, renseigner sur la fiche produit :
- `kemia.rating` : la note réelle, par exemple `4.8`
- `kemia.review_count` : le nombre réel d'avis
- `kemia.reviews_json` :

```json
{
  "version": 1,
  "reviews": [
    {
      "id": "review-001",
      "author": "Thomas D.",
      "rating": 5,
      "title": "",
      "body": "Texte de l'avis.",
      "date": "2026-01-15",
      "verified": true,
      "image": null
    }
  ]
}
```

Les trois valeurs doivent rester cohérentes entre elles : le nombre affiché, la note affichée et le nombre d'entrées du tableau.

---

## 4. Ajouter une gamme

1. Créer le produit, avec une option `Cure` si plusieurs durées sont vendues.
2. Renseigner `kemia.tagline`, `kemia.short_usp`, `kemia.benefits`, `kemia.ingredients` et le bloc utilisation.
3. Ajouter l'entrée au menu principal et aux menus de pied de page (Boutique en ligne > Navigation).
4. Sur la page Science, ajouter un bloc « Formule » dans la section « Nos formules » et le pointer sur le nouveau produit. Le bloc « Bientôt » peut être supprimé ou conservé.

Aucune intervention dans le code n'est nécessaire.

---

## 5. Guides de configuration

**Popup email.** Personnaliser > Pied de page > Popup email. Désactivée par défaut. Réglages : image, sur-titre, titre, offre, texte, mention légale, délai d'affichage, fréquence de réaffichage, activation séparée ordinateur et mobile.

**Test utilisateurs.** La section existe mais n'est pas placée dans le template produit tant que les données n'existent pas. Quand le dossier de test sera disponible : ajouter la section « Test utilisateurs » sur la fiche produit, puis renseigner les champs `kemia.consumer_test_*`. Tant que `consumer_test_enabled` est faux, la section reste invisible.

**Catégories du blog.** Les onglets du blog sont générés à partir des étiquettes des articles et pointent vers de vraies URL (`/blogs/blog/tagged/energie`), ce qui reste indexable. Le clic remplace la liste des articles sans recharger la page ni remonter en haut : l'adresse et le titre du document sont mis à jour, le bouton Précédent du navigateur fonctionne. Sans JavaScript, ou pour un robot d'indexation, les onglets restent de simples liens qui chargent la page normalement. Les pictogrammes se règlent dans la section Blog, un bloc par étiquette.

**Paiement fractionné.** Le bloc « ou 3x ... sans frais » de la buy box est présent mais désactivé. À n'activer qu'une fois le service de paiement en plusieurs fois réellement installé.

**Urgence livraison.** Bloc « Urgence livraison » de la fiche produit. Le compte à rebours et la date sont calculés côté serveur, dans le fuseau de la boutique. Réglages : heure et minute limites (23h59 par défaut), délai en jours ouvrés (2 par défaut), exclusion des week-ends, textes. Une fois l'heure limite passée, le compteur ne se réinitialise pas : le texte de repli le remplace. **À n'activer que si la logistique tient réellement le délai annoncé.**

**Barre d'annonce.** Trois modes : une info à la fois sur mobile (par défaut), une info à la fois partout, ou toutes côte à côte. La rotation s'arrête si le visiteur a activé la réduction des animations.

---

## 6. Recette effectuée

| Contrôle | Résultat |
|---|---|
| Import Shopify | 70 fichiers sur 70, sans erreur de traitement |
| Validation des schémas de section | 28 sections, 0 erreur |
| Validation JSON des templates | 20 templates, 0 erreur |
| Références croisées sections / snippets / blocs / réglages | 0 référence manquante |
| Débordement horizontal à 390, 820 et 1440 px | 0 px sur la homepage et la fiche produit |
| Rendu comparé à la maquette | Homepage et fiche produit conformes |

Anomalies trouvées et corrigées :
1. Débordement horizontal de 148 px sur la fiche produit à 390 px, causé par des enfants de grille et de flex non contraints. Corrigé par `min-width: 0` sur les conteneurs concernés.
2. Le titre de la homepage se répartissait mal sur trois lignes. Les lignes du titre sont désormais pilotées par le marchand depuis le Theme Builder.
3. Les déclarations `@font-face` étaient générées en dehors de toute balise `<style>` et s'affichaient donc en clair en haut de chaque page. Corrigé dans `layout/theme.liquid` et `layout/password.liquid`.
4. Erreur Liquid sur la section Articles du blog quand aucun blog n'était sélectionné. La comparaison a été fiabilisée et le blog est désormais rattaché dans le template.
5. Sections invisibles sur la homepage et la page Science : la mise en avant produit, les avis et les actifs n'avaient pas de source renseignée. Les templates pointent désormais sur le produit et le blog.
6. Quand une section reste vide faute de données, un message d'explication s'affiche maintenant dans le Theme Builder uniquement, jamais sur le site.

### Non couvert par cette recette
La prévisualisation du thème sur le domaine `myshopify.com` est bloquée par le proxy réseau de l'environnement de développement. La recette visuelle a donc été faite sur un rendu local utilisant les feuilles de style réelles du thème et la structure HTML réelle des sections. **Il reste à ouvrir l'aperçu du thème dans Shopify pour valider le rendu avec les données réelles**, en particulier : ajout au panier, tiroir panier, sélection de cure, barre d'achat mobile, fenêtre des avis et formulaire de contact.

---

## 7. Arbitrages appliqués

| Sujet | Décision | Source |
|---|---|---|
| Structure homepage | Entonnoir AIDA : accroche, réassurance, constat, produit, bénéfices, crédibilité, preuve, objections, closing | Master Spec §8 |
| Piliers et comparatif | Séparés en deux sections pleine largeur au lieu d'une colonne double dense | Demande client (lisibilité) |
| Nombre d'actifs | 7 actifs, et non les 10 de la maquette | Dossier V2 §5 |
| Pied de page de la fiche produit | Beige clair, et non noir | Dossier V2 §4 |
| Service client | « Réponse sous 48h », et non « 7j/7 » | Instruction client la plus récente |
| Libellé des offres | « Cure 1 / 2 / 3 mois » plutôt que « 1 / 2 / 3 piluliers » | Master Spec §9.6 |
| Prix par jour | Non affiché | Dossier V2 |
| Prix sur la homepage | Aucun | Dossier V2 §2 |
| Bénéfices | Alimentés par les champs méta produit | Demande client |
| Bandeau de réassurance | Carte blanche comme la maquette desktop. Les variantes bleu profond et bleu très clair sont disponibles en un clic pour appliquer la correction « renforcer le bleu scientifique » du dossier V2 | Maquette + V2 §2 |
| Avis clients | Aucun avis inventé, blocs masqués | Master Spec §11.5 |

---

## 8. Formulations de bénéfices retenues

Les quatre bénéfices utilisent des allégations autorisées au niveau européen, soutenues par les dosages réels de la formule (zinc 10 mg soit 100 % des VNR, vitamine D3 50 µg).

| Bénéfice | Formulation | Statut |
|---|---|---|
| Énergie & endurance | La vitamine D3 contribue au maintien d'une fonction musculaire normale. | Autorisée |
| Clarté mentale | Le zinc contribue à une fonction cognitive normale. | Autorisée |
| Vitalité physique | Le zinc contribue à la protection des cellules contre le stress oxydatif. | Autorisée |
| Bien-être intime | Le zinc contribue au maintien d'un taux normal de testostérone dans le sang. | Autorisée |

Ces textes sont modifiables dans Contenu > Métaobjets > Bénéfice Kemia. Toute reformulation doit repasser par un contrôle de conformité.

---

## 8bis. Matrice des allégations

Deux régimes coexistent et ne portent pas le même risque.

- **Allégation autorisée** : inscrite au règlement (UE) 432/2012, utilisable sans réserve dès lors que le dosage minimal est atteint.
- **Allégation en attente** : les allégations relatives aux plantes n'ont jamais été évaluées par l'EFSA et bénéficient d'une période transitoire au titre de l'article 28 du règlement 1924/2006. Elles sont utilisables, mais **sous la responsabilité de l'exploitant**, et pourraient être retirées si l'évaluation aboutissait à un refus. La DGCCRF publie un outil recensant l'ensemble des allégations utilisables, dont celles en attente.

### Allégations autorisées, portées par la formule

| Allégation | Actif | Dosage | Statut |
|---|---|---|---|
| Fonction cognitive normale | Zinc | 10 mg, 100 % VNR | VERT |
| Maintien d'un taux normal de testostérone | Zinc | 10 mg, 100 % VNR | VERT |
| Protection des cellules contre le stress oxydatif | Zinc | 10 mg, 100 % VNR | VERT |
| Fertilité et reproduction normales | Zinc | 10 mg, 100 % VNR | VERT, non utilisée |
| Maintien d'une fonction musculaire normale | Vitamine D3 | 50 µg | VERT |
| Fonctionnement normal du système immunitaire | Vitamine D3 | 50 µg | VERT |

### Allégations en attente, portées par les plantes

| Allégation | Plante | Dosage | Statut |
|---|---|---|---|
| Aide à réduire la fatigue | Extrait de kola | 208,3 mg, 25 mg de caféine | ORANGE |
| Tonus et vitalité | Extrait de ginseng | 200 mg, 10 % ginsénosides | ORANGE |
| Équilibre émotionnel, relaxation (ID 2038) | Extrait de safran | 30 mg titré | ORANGE |

La monographie EMA du Panax ginseng retient l'usage traditionnel contre les symptômes d'asthénie, fatigue et faiblesse. La Commission E allemande reconnaît l'action du kola contre la fatigue physique et intellectuelle.

### Allégations sous risque assumé

**Décision client du 12/08/2026.** Ces deux libellés sont affichés en connaissance de cause, à revalider avec le fournisseur de matières premières, qui dispose des dossiers de substantiation.

| Libellé affiché | Actif | Statut réglementaire réel | Repli conforme |
|---|---|---|---|
| Concentration et vigilance | L-Tyrosine | Avis EFSA 2011 : la relation avec la synthèse de dopamine est établie, mais l'allégation n'a pas été autorisée, l'apport protéique alimentaire étant jugé suffisant. Les allégations attention (ID 440, 1672, 1930) et fonction musculaire (ID 1929) ont reçu un avis défavorable | L'acide aminé le plus dosé |
| Mémoire et clarté mentale | CDP-Choline | Allégation mémoire **formellement refusée** par le règlement (UE) 2025/2223, applicable depuis le 25 novembre 2025, après avis EFSA défavorable de juillet 2024. Les allégations choline du 432/2012 exigent 82,5 mg par portion, la formule en apporte environ 43 mg | Choline sous forme citicoline |

Ces deux actifs **ne relèvent pas du régime transitoire de l'article 28** dont bénéficient les plantes. La différence de nature du risque :

- Kola, ginseng, safran : allégations jamais évaluées, utilisables pendant la période transitoire. Un contrôle porterait sur la substantiation du dossier.
- L-Tyrosine, CDP-Choline : allégations évaluées puis écartées. Un contrôle opposerait un texte réglementaire daté, sans débat possible sur le fond. Le cas de la CDP-Choline est le plus exposé de la fiche, le refus étant récent et nominatif.

Les deux libellés de repli sont prêts et enregistrés dans le champ `source_text` de chaque métaobjet Actif. Leur remise en place est une modification de contenu, sans intervention sur le thème.

### Formulations interdites

| Allégation | Raison |
|---|---|
| Réduit la fatigue attribué au produit dans son ensemble | L'allégation appartient au kola et au ginseng, pas à la formule. Elle doit rester rattachée à la plante. |
| Métabolisme énergétique normal | Réservé aux vitamines B, à la vitamine C, au magnésium et au fer. Aucun n'est présent. |
| Améliore la concentration, augmente la mémoire, stimule la testostérone | Verbes d'amélioration ou de stimulation non autorisés. Les formulations autorisées parlent de fonction normale ou de maintien. |
| Effet mémoire attribué à la CDP-Choline | Refusé par le règlement (UE) 2025/2223 depuis le 25 novembre 2025. **Affiché malgré tout, décision client du 12/08/2026.** |
| Effet dopamine, vigilance ou concentration attribué à la L-Tyrosine | Allégations évaluées et non autorisées. **Affiché malgré tout, décision client du 12/08/2026.** |
| Allégations liées à la caféine (vigilance, concentration) | Avis EFSA favorable mais **non repris** par la Commission. Non autorisées. |
| Sans nervosité, sans effet rebond | Allégation d'absence d'effet indésirable. |
| Cliniquement prouvé, efficacité clinique | Aucun protocole ne le justifie à ce jour. |
| Unique sur le marché, seule formule du marché | Aucun benchmark ne le démontre. |

### Bénéfices courts du carrousel des actifs

| Actif | Bénéfice affiché | Base |
|---|---|---|
| L-Tyrosine | Concentration et vigilance | Risque assumé |
| CDP-Choline | Mémoire et clarté mentale | Risque assumé |
| Extrait de kola | Aide à réduire la fatigue | En attente |
| Extrait de ginseng | Tonus et vitalité | En attente |
| Extrait de safran | Équilibre émotionnel | En attente, ID 2038 |
| Zinc | Taux de testostérone normal | Autorisée |
| Vitamine D3 | Fonction immunitaire normale | Autorisée |

La justification de chaque libellé est enregistrée dans le champ `source_text` du métaobjet Actif correspondant. Ce champ est interne et n'apparaît jamais sur le site.

### Point de vigilance : les témoignages

Un avis client ne permet pas d'affirmer indirectement ce qui serait interdit dans le texte de la marque. Deux témoignages de démonstration portent ce risque :

- « j'ai retrouvé de l'énergie tout au long de la journée » (Thomas D.)
- « une vraie différence sur ma vitalité et ma concentration » (Yassine K.)

Ces textes proviennent de la maquette et sont destinés à être remplacés. Lors du chargement des avis réels, écarter ceux qui affirment un effet que la formule ne peut pas revendiquer.

### Marge de manoeuvre restante

La communication sur la fatigue est possible **par la plante**, sans reformuler le produit. Elle doit rester rattachée au kola ou au ginseng et ne pas être présentée comme un effet global du produit.

La promesse sous le titre produit porte désormais cette communication : « Plus d'énergie, moins de fatigue, jour après jour. » Le paragraphe qui la suit rattache explicitement la réduction de la fatigue au kola et le tonus au ginseng, comme l'exige le rattachement à la plante.

Pour porter une allégation fatigue **autorisée**, attribuable à la formule entière et sans réserve, il faudrait ajouter un seul des nutriments suivants au dosage minimal : vitamine C, B2, B3, B5, B6, B9, B12, magnésium ou fer. Décision client du 12/08/2026 : la formule reste inchangée.


---

## 9. Éléments encore attendus du client

Ces points ne bloquent pas le thème mais conditionnent certaines publications.

**Bloquant pour publier des affirmations**
- Justificatif « 100 % vegan » et matière de l'enveloppe des gélules
- Justificatif « Sans OGM »
- Documentation de fabrication en France
- Origine de la vitamine D3
- Certifications, analyses laboratoire, documents qualité
- Éléments justifiant « formule développée par Kemia Lab »

**Bloquant pour afficher des blocs entiers**
- Avis clients réels (note, nombre, textes, autorisations)
- Dossier de test utilisateurs : nombre de testeurs, durée, résultats agrégés, méthodologie

**Bloquant pour la mise en ligne**
- Visuels : packshots haute définition, photos d'ambiance, visuels d'actifs, images d'articles
- Politique de livraison, heure de coupure réelle, délais réels
- Politique de retours et garantie
- Confirmation que le service client peut tenir « Réponse sous 48h »
- Mentions légales et CGV, à créer en pages Shopify puis à ajouter au menu `footer`

---

## 10. Points d'attention

- Cinq thèmes intermédiaires nommés « ZZ A SUPPRIMER » sont présents dans la boutique. La suppression de thème est bloquée par la politique de l'outil, elle doit être faite depuis l'admin Shopify.
- Le thème `Kemia Lab 1.0.0` est **non publié**. Aucune modification n'a été faite sur le thème en ligne.
- Le menu de pied de page « Aide » et le menu des mentions ne référencent que la politique de confidentialité, seule politique existante à ce jour.
