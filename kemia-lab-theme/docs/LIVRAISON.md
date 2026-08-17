# Kemia Lab - Dossier de livraison

Version 1.6.0 | Thème `KEMIA LAB - v1.6.0` (non publié) | Boutique `pcmxbb-83.myshopify.com`

---

## 1. Ce qui a été livré

### Thème
35 sections, 17 snippets, 20 templates, 2 feuilles de style, 1 fichier JavaScript sans dépendance externe.

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

**Panier tiroir.** Personnaliser > Panier tiroir. Trois leviers réglables.

- *Barre de livraison offerte.* Le seuil est un réglage en euros, **à tenir aligné manuellement avec Paramètres > Expédition**. Le thème ne lit pas la configuration de livraison de Shopify : si le seuil réel change, il faut le reporter ici, sinon la barre annonce un avantage qui ne sera pas appliqué au paiement. Le repère `[montant]` du texte est remplacé par la somme restante.
- *Urgence.* Reprend exactement le calcul de la fiche produit, via le snippet partagé `delivery-eta` : heure limite, jours ouvrés, exclusion des week-ends. Une seule implémentation pour les deux emplacements.
- *Proposition de cure supérieure.* Un bouton qui remplace la cure du panier par la cure immédiatement supérieure. Il n'apparaît que si ce remplacement fait réellement franchir le seuil de livraison offerte, et jamais si le seuil est déjà atteint ou si la cure la plus longue est déjà au panier. La variante proposée est toujours la moins chère parmi les supérieures disponibles : le pas le plus court possible. Aucune référence produit n'est codée en dur, le mécanisme fonctionnera tel quel pour les futures gammes.
- *Message avant paiement.* Texte libre affiché au-dessus du bouton Commander.

**Barre d'annonce.** Trois modes : une info à la fois sur mobile (par défaut), une info à la fois partout, ou toutes côte à côte. La rotation s'arrête si le visiteur a activé la réduction des animations.

---

## 6. Recette effectuée

| Contrôle | Résultat |
|---|---|
| Import Shopify | 70 fichiers sur 70, sans erreur de traitement |
| Validation des schémas de section | 35 sections, 0 erreur |
| Validation JSON des templates | 20 templates, 0 erreur |
| Références croisées sections / snippets / blocs / réglages | 0 référence manquante |
| Débordement horizontal à 390, 820 et 1440 px | 0 px sur la homepage et la fiche produit |
| Rendu comparé à la maquette | Homepage et fiche produit conformes |
| Rendu des champs texte enrichi | Testé sur moteur Liquid local : contenu réel, gras, italique, liens, listes, titres, injection HTML, champ vide |
| Comparaisons numériques sur données optionnelles | 0 comparaison non gardée sur l'ensemble du thème |
| Panier tiroir | Testé sur moteur Liquid : panier vide, sous le seuil, seuil exact, au-dessus du seuil |
| Proposition de cure supérieure | Testée sur moteur Liquid : cure 1 mois, cure 2 mois, cure 3 mois, quantité multiple |
| Blocs déclarés au schéma sans rendu | 0 sur les 35 sections, contrôle ajouté à la recette |
| Position des blocs de la buy box | Mesurée sous Chromium à 390, 820 et 1440 px |

Anomalies trouvées et corrigées :
1. Débordement horizontal de 148 px sur la fiche produit à 390 px, causé par des enfants de grille et de flex non contraints. Corrigé par `min-width: 0` sur les conteneurs concernés.
2. Le titre de la homepage se répartissait mal sur trois lignes. Les lignes du titre sont désormais pilotées par le marchand depuis le Theme Builder.
3. Les déclarations `@font-face` étaient générées en dehors de toute balise `<style>` et s'affichaient donc en clair en haut de chaque page. Corrigé dans `layout/theme.liquid` et `layout/password.liquid`.
4. Erreur Liquid sur la section Articles du blog quand aucun blog n'était sélectionné. La comparaison a été fiabilisée et le blog est désormais rattaché dans le template.
5. Sections invisibles sur la homepage et la page Science : la mise en avant produit, les avis et les actifs n'avaient pas de source renseignée. Les templates pointent désormais sur le produit et le blog.
6. Quand une section reste vide faute de données, un message d'explication s'affiche maintenant dans le Theme Builder uniquement, jamais sur le site.
7. Les champs méta de type texte enrichi s'affichaient en JSON brut au lieu du texte. Trois emplacements étaient concernés : l'accordéon Précautions d'emploi, la fenêtre Précautions de la section Ingrédients et la fenêtre Méthodologie du test utilisateurs. Le rendu passe désormais par le snippet `rich-text-field`, qui parcourt la structure et produit du HTML sémantique. Le texte est échappé au passage.
8. Une comparaison numérique sur un champ méta non renseigné provoque une erreur Liquid visible sur la page (« comparison of Nil with 0 failed »). Le cas se produit dès qu'une section est ajoutée sans sélectionner de produit source. Onze occurrences corrigées dans neuf sections et un snippet, par normalisation avec `| plus: 0`.
9. Le sélecteur de cure avait disparu de la fiche produit. En factorisant le calcul de livraison dans un snippet partagé, la plage de code remplacée débordait sur le bloc voisin et emportait tout le rendu du sélecteur de variantes. Le bloc restait déclaré au schéma et présent dans le gabarit, donc toutes les validations passaient : seul le rendu manquait. Restauré depuis l'historique. **Un contrôle a été ajouté à la recette : tout type de bloc déclaré dans un schéma doit avoir un cas de rendu correspondant.**

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
- **Avis de professionnels sur le produit** : la section « Citations et références » affiche aujourd'hui deux références réglementaires portant sur les actifs. Pour la transformer en véritables avis de professionnels, il faut, pour chaque avis : les mots exacts du professionnel, son nom, sa fonction, son autorisation écrite d'être cité à des fins commerciales, et l'indication d'une éventuelle contrepartie (le champ « Mention sous les avis » est prévu pour ça, obligatoire dès qu'il existe une rémunération). Voir §13.

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

---

## 10bis. Structure des pages

Chaque section porte une seule idée. C'est la règle qui a présidé au découpage, pour éviter les blocs trop denses sur ordinateur et tablette.

### Fiche produit

Cet ordre a été revu, voir le paragraphe 16. Le tableau à jour s'y trouve.

Deux sections ont été retirées du gabarit parce qu'elles faisaient doublon : « Le pouvoir du 4 » (les 4 piliers, redondant avec le bandeau bénéfices) et « Ingrédients & utilisation » (la composition est désormais accessible depuis la section Actifs, les conseils d'utilisation depuis l'accordéon de la buy box). Les deux sections restent disponibles dans le Theme Builder si besoin.

### Accueil

Ordre en entonnoir, une étape par section.

| Ordre | Section | Étape |
|---|---|---|
| 1 | Hero | Attention : la promesse et le premier appel à l'action. |
| 2 | Réassurance | Lever le doute logistique immédiatement sous le pli. |
| 3 | Storytelling | Intérêt : le constat, fatigue physique et mentale. |
| 4 | Bandeau bénéfices | Intérêt : ce que la formule apporte. |
| 5 | Actifs autour du produit | Désir : ce qu'il y a réellement dedans, dosages affichés. |
| 6 | Produit à la une | Désir : le produit, le prix, l'appel à l'action. |
| 7 | Comparatif | Lever l'objection concurrentielle. |
| 8 | Mode d'emploi | Lever l'objection de contrainte : la routine tient en trois gestes. |
| 9 | Avis clients | Preuve sociale avant la décision. |
| 10 | Pourquoi Kemia Lab | Crédibilité de la marque. |
| 11 | Questions fréquentes | Dernières objections, balisées FAQPage. |
| 12 | Appel à l'action final | Action. |
| 13 | Blog | Contenu et référencement. |
| 14 | Newsletter | Récupérer les visiteurs qui n'achètent pas aujourd'hui. |

Trois sections ont été ajoutées par rapport à la version précédente : les actifs, le comparatif et le mode d'emploi. Les trois répondent à une objection que la page ne traitait pas : ce qu'il y a dans le produit, pourquoi lui plutôt qu'un autre, et ce que ça change au quotidien.

### Point non traité

Le hero ne porte aucune preuve sociale. C'est l'ajout qui a le plus d'effet sur ce type de page, mais il suppose d'afficher une note et un nombre d'avis. Les six avis actuels étant des textes de maquette, l'afficher aujourd'hui reviendrait à mettre en avant un chiffre non authentique. À faire dès que les avis réels seront chargés.

---

## 11. Panier tiroir : arbitrages

### Urgence : pourquoi pas « panier réservé 5 minutes »

Le compte à rebours retenu est celui de la **livraison**, pas celui d'une réservation de panier.

Un compteur « votre panier est réservé pendant 5 minutes » annonce une contrainte qui n'existe pas : Shopify ne bloque aucun stock tant que la commande n'est pas passée, et rien ne se produit à l'expiration. C'est une pratique commerciale trompeuse au sens des articles L.121-1 et suivants du code de la consommation, et les faux comptes à rebours font partie des motifs de sanction identifiés par la DGCCRF. Le risque est plus direct que celui des allégations : il se constate d'un simple rechargement de page.

Le compte à rebours de livraison remplit la même fonction — créer une échéance — mais il est vrai, vérifiable, et il porte une information utile : la date à laquelle le client sera livré. C'est aussi le seul des deux qui reste crédible quand le client revient sur le site le lendemain.

Si la décision est prise d'afficher malgré tout une réservation de panier, elle doit s'appuyer sur un mécanisme réel de mise en réserve, pas sur un simple compteur d'affichage.

### Barre de livraison offerte : le seuil crée un palier inatteignable

Seuil actuel 60 €, cure 1 mois à 49,90 €. Un client qui ajoute une cure d'un mois voit « Plus que 10,10 € », **mais aucun produit du catalogue ne coûte 10,10 €**. Les seules issues sont une seconde boîte (+49,90 €) ou la cure 2 mois (+39,90 €).

Trois options, à trancher côté client :

1. **Garder 60 €.** La barre devient un argument d'upgrade vers la cure 2 mois, qui est déjà la meilleure offre et qui débloque la livraison. C'est le choix actuel, et le bouton de passage à la cure supérieure rend ce palier franchissable en un clic au lieu de laisser le client chercher quoi ajouter.
2. **Descendre le seuil à 49,90 €** ou moins. La cure 1 mois part alors en livraison offerte : moins de friction, mais le levier de panier moyen disparaît.
3. **Créer un produit d'appoint** entre 10 et 15 € (pilulier, format découverte). C'est ce qui rend la barre réellement actionnable, mais cela suppose une référence que Kemia Lab n'a pas encore.

### Message avant paiement

Message retenu : **« Plus qu'une étape pour retrouver votre énergie au quotidien. »**

Il combine la mécanique de progression, qui rassure à l'étape du panier, et le bénéfice attendu, qui rappelle pourquoi le visiteur est là. Le verbe « retrouver » suppose un état antérieur à reconquérir plutôt qu'une transformation, ce qui correspond à la cible : des personnes qui savent ce que c'est que d'avoir de l'énergie et qui constatent qu'elle manque. « Au quotidien » ancre la promesse dans la durée d'usage réelle, un programme de 30 jours, au lieu de laisser croire à un effet immédiat.

Formulations écartées et raisons :

| Formulation | Écartée parce que |
|---|---|
| Plus qu'une étape avant de commencer votre programme de 30 jours | Décrit la logistique, pas le bénéfice. Ne donne aucune raison d'aller au bout. |
| Plus qu'une étape pour dire adieu à la fatigue | « Dire adieu » est une promesse d'éradication. Aucune formulation disponible ne le permet, et cela promet plus que ce que le produit peut tenir. |
| Plus qu'une étape avant d'en finir avec les coups de barre de 15h | La plus incarnée, mais elle réduit la promesse à un seul moment de la journée alors que la formule est positionnée sur le physique **et** le mental. |
| Plus qu'une étape vers la meilleure version de vous-même | Formulation creuse, interchangeable avec n'importe quelle marque. |

Ce message porte une allégation de bénéfice. Il reprend la promesse déjà affichée sous le titre produit et n'introduit donc pas de risque nouveau, mais il relève du même arbitrage assumé le 12/08/2026. Le champ est libre depuis le Theme Builder.

---

## 12. Ordre des blocs de la fiche produit

Question posée : faut-il remonter le prix et la note sous le titre ?

### Mesures

Position du haut de chaque bloc, en pixels depuis le haut du document, mesurée sous Chromium sur le rendu réel.

| Bloc | Ordre initial | Ordre retenu | Pli mobile (844 px) |
|---|---|---|---|
| Titre | 573 | 573 | visible dans les deux cas |
| Note et avis | 1026 | 634 | passait 182 px sous le pli, désormais visible |
| Prix | 1087 | 763 | passait 243 px sous le pli, désormais visible |
| Sélecteur de cure | 1146 | 1025 | reste sous le pli, remonté de 121 px |
| Bouton d'ajout | 1557 | 1436 | reste sous le pli, remonté de 121 px |

Sur tablette (820 × 1180) le constat est identique : la note passait 7 px sous le pli, le prix 68 px. Sur ordinateur (1440 × 900) les deux étaient déjà visibles : **la question ne se posait que sur mobile et tablette**.

### Ordre retenu

`sur-titre > titre > note > accroche > prix > paiement fractionné > paragraphe > sélecteur de cure > urgence > quantité > ajout au panier > réassurance > repères qualité > accordéons`

Trois déplacements :

- **La note remonte sous le titre.** C'est la convention de la quasi-totalité des sites marchands, et la preuve sociale se lit mieux collée à l'identité du produit qu'isolée au-dessus du prix.
- **Le prix remonte sous l'accroche.** Il pose le point de référence avant que le sélecteur n'affiche les cures 2 et 3 mois, qui apparaissent alors comme des économies plutôt que comme des prix plus élevés.
- **Le paragraphe descriptif et les repères qualité descendent.** Ce sont eux qui repoussaient le prix hors de l'écran. Les repères qualité passent sous le bouton d'achat, où ils soutiennent la décision au moment de l'hésitation.

### Limite de l'analyse

Ce qui est mesuré, c'est une **position**, pas un taux de conversion. Le fait d'être au-dessus du pli est un indicateur solide et documenté, pas une preuve. Cet ordre est le meilleur pari par défaut ; il devra être confirmé par un test A/B quand le trafic le permettra.

### Effet de bord à traiter

Remonter la note augmente l'exposition d'une moyenne calculée sur **six avis de démonstration**. Le remplacement par des avis réels devient d'autant plus prioritaire, voir §3.

---

## 13. Références par actif, sur la fiche produit

La section porte sur **les actifs pris isolément**, jamais sur 4 Vitality System. C'est ce qui la rend publiable : personne n'a évalué le produit fini, mais les plantes et les nutriments qui le composent sont documentés.

### Ce qui est affiché

| Actif | Énoncé | Source |
|---|---|---|
| Extrait de ginseng | Usage traditionnel contre la fatigue et la sensation de faiblesse, indication des symptômes d'asthénie | Agence européenne des médicaments, monographie Panax ginseng |
| Extrait de kola | Usage traditionnel contre la fatigue physique et intellectuelle, soulagement des symptômes de fatigue et de sensation de faiblesse | Agence européenne des médicaments, monographie Colae semen |
| Extrait de safran | Action étudiée sur l'humeur et la gestion du stress, avec le protocole de l'essai | Frontiers in Nutrition, 2021, Kell G. et coll. |
| Zinc et vitamine D3 | Libellés officiels des allégations autorisées | Commission européenne, règlement (UE) n° 432/2012 |

### Statut exact de ces textes

**Aucun de ces énoncés n'est une citation littérale, à l'exception du règlement 432/2012.** Ce sont des restitutions en français de la position de chaque source, chacune assortie de son lien de vérification.

La raison est matérielle : le proxy réseau de l'environnement de développement bloque `ema.europa.eu`, `anses.fr`, `ncbi.nlm.nih.gov`, `frontiersin.org`, `fitoterapia.net` et `vidal.fr`. Aucun texte d'origine n'a pu être ouvert et relu. Publier entre guillemets des phrases reconstituées de mémoire ou d'après un résumé de moteur de recherche reviendrait à attribuer à l'EMA ou à une revue des mots qu'elles n'ont peut-être pas écrits.

### Ce qu'il reste à faire pour de vraies citations

Le travail est court et ne demande aucune intervention sur le thème : ouvrir chaque lien, copier la phrase exacte, la coller dans le champ « Texte affiché » du bloc correspondant, et remplacer « restituée » par des guillemets dans la mention sous la section.

| Bloc | Document à ouvrir | Ce qu'il faut y copier |
|---|---|---|
| Ginseng | Monographie EMA Panax ginseng, section Therapeutic indication | La phrase d'indication, traduite ou laissée en anglais |
| Kola | Monographie EMA Colae semen, section Therapeutic indication | La phrase d'indication |
| Safran | Résumé de l'article Frontiers in Nutrition 2021 | La phrase de conclusion, à condition qu'elle ne porte pas sur une pathologie |
| Zinc et vitamine D3 | Déjà littéral, rien à faire | — |

### Ce qui est volontairement écarté

Les méta-analyses du safran portant sur le trouble dépressif caractérisé : un complément alimentaire ne peut pas se prévaloir d'un effet sur une maladie, et afficher une telle étude sur une fiche produit reviendrait à le suggérer. L'essai retenu porte sur des adultes en bonne santé.

La L-Tyrosine et la CDP-Choline : les avis européens qui les concernent sont défavorables, les citer desservirait le produit.

### Avis de professionnels nommés

Le bloc accepte jusqu'à six entrées et dispose des champs de source. Pour un professionnel nommé, réunir : la citation exacte, le nom, la fonction, l'autorisation écrite d'utilisation commerciale, le lien vers la publication d'origine, et la mention d'une éventuelle contrepartie.

---

## 14. Revue de la page d'accueil

Analyse faite sur la version réellement en ligne dans le thème v1.4.3, récupérée depuis Shopify, et non sur la version du dépôt : les modifications faites dans le Theme Builder y avaient été apportées.

### Trois points bloquants relevés

**1. Photo générée attribuée à une personne réelle.** Le bloc citant Julia Zumpano, diététicienne à la Cleveland Clinic, portait une image nommée `une-experte-en-nutrion-dans-son-bureau-qui-pose-pour-sa-photo-dans-un-magazine.png`. C'est une image générée, et le visage affiché n'est pas celui de la personne nommée. Publier le portrait fabriqué d'une professionnelle identifiable revient à usurper son identité : atteinte au droit à l'image et au nom, et risque de qualification de pratique commerciale trompeuse. **L'image a été retirée.** La citation et son lien vers l'article de la Cleveland Clinic sont conservés : la citation est vérifiable, la photo ne l'était pas. Pour afficher un portrait, il faut la photo réelle et l'autorisation écrite de la personne.

**2. Allégation « n°1 ».** Le titre H1 annonçait « Complément alimentaire n°1 contre la fatigue physique et mentale ». Une allégation de premier rang doit pouvoir être étayée par une donnée objective et vérifiable, faute de quoi elle constitue une pratique commerciale trompeuse au sens de l'article L.121-2 du code de la consommation. Le produit n'est pas encore commercialisé. **La mention a été retirée**, le reste du titre est conservé à l'identique : la couverture du mot-clé est intacte.

**3. Citation sans source.** Le bloc ginseng attribué à Maxime Mességué ne porte ni lien ni référence. Le champ existe et reste vide. Sans source vérifiable, cette citation est à documenter ou à retirer avant publication.

### Corrections rédactionnelles

- « 1 complément Alimentaire » : majuscule parasite corrigée.
- « Gellule animale, produits transformé » : corrigé en « Gélules d'origine animale, ingrédients transformés ».
- « Certifié Végan & sans OGM » : le mot « certifié » suppose un organisme certificateur et un numéro de certificat. Ramené à « Vegan et sans OGM » tant que le justificatif attendu au §9 n'est pas fourni.

### Entonnoir : le constat était placé après la solution

Ordre constaté : accueil, réassurance, **actifs**, bénéfices, mode d'emploi, citations, **constat**, produit, comparatif, avis…

Le problème arrivait en septième position, après le détail des actifs, la liste des bénéfices et le mode d'emploi. Le visiteur recevait la réponse avant d'avoir vu la question, ce qui prive les sections de leur raison d'être. Le premier prix n'apparaissait qu'en huitième position.

Ordre retenu :

| # | Section | Rôle |
|---|---|---|
| 1 | Accueil | La promesse et le premier appel à l'action |
| 2 | Réassurance | Lever le doute logistique sous le pli |
| 3 | **Le constat** | Le problème, remonté de la 7e à la 3e place |
| 4 | Bandeau bénéfices | Ce que la formule apporte |
| 5 | Actifs | Ce qu'il y a dedans |
| 6 | Paroles de professionnels | Caution externe |
| 7 | Produit à la une | Le produit, le prix, l'appel à l'action |
| 8 | Comparatif | Lever l'objection concurrentielle |
| 9 | Mode d'emploi | Lever l'objection de contrainte |
| 10 | Avis clients | Preuve sociale |
| 11 | Pourquoi Kemia Lab | Crédibilité de la marque |
| 12 | Questions fréquentes | Dernières objections, balisées FAQPage |
| 13 | Appel à l'action final | Action |
| 14 | Blog | Contenu et référencement |
| 15 | Newsletter | Récupérer les visiteurs qui n'achètent pas |

### Référencement sur « complément alimentaire fatigue »

**Ce qui bloque tout, avant toute optimisation :**

- La boutique est **protégée par mot de passe**. Aucune page n'est accessible aux robots : aucun positionnement n'est possible tant que la protection n'est pas levée.
- Le nom de la boutique est resté **« My Store »**. Il apparaît dans la balise titre de chaque page et dans le balisage Organization. À corriger dans Paramètres > Détails de la boutique.
- Aucune **balise titre ni méta description** n'est définie pour la page d'accueil. C'est le premier levier de la requête visée, et il est vide. Proposition : titre « Complément alimentaire fatigue physique et mentale | Kemia Lab » (59 caractères) ; méta description « 7 actifs en 2 gélules par jour contre la fatigue physique et mentale. Fabriqué en France, vegan et sans OGM. Livraison offerte dès 60 €. » (137 caractères). À saisir dans Boutique en ligne > Préférences.

**Ce qui a été corrigé sur la page :**

Le mot-clé était répété presque à l'identique dans le H1, dans le H2 du constat et dans celui des actifs. Une répétition littérale n'apporte rien et dégrade la lecture. Le H2 du constat couvre désormais les deux facettes de la requête avec une formulation différente : « Fatigue physique, fatigue mentale : deux fronts, une seule routine ».

Deux questions de la FAQ ont été reformulées sur des requêtes réelles, ce qui alimente le balisage FAQPage déjà en place : « Quel complément alimentaire prendre contre la fatigue ? » et « Au bout de combien de temps un complément contre la fatigue fait-il effet ? ».

**Ce qui reste à faire, et qui pèse plus que la page elle-même :**

La requête est commerciale et concurrentielle. Aucune optimisation de page d'accueil ne suffit à la gagner sur un domaine neuf sans historique ni lien entrant. Les leviers réels, par ordre d'impact : des articles de fond sur le blog couvrant le champ sémantique (causes de la fatigue, plantes adaptogènes, carences fréquentes, différence fatigue physique et mentale), le maillage interne de ces articles vers la fiche produit, et l'acquisition de liens entrants. Le blog compte 6 articles ; c'est le chantier à prioriser après la mise en ligne.

### Section constat : trois dispositions au choix

Un réglage « Disposition » a été ajouté à la section Storytelling.

| Mode | Rendu |
|---|---|
| Colonne centrée | Comportement d'origine, texte et liste empilés |
| Deux colonnes | Récit à gauche, constats en cartes à droite ; s'empile sous 990 px |
| **Bulles animées** | Tout centré, constats en pastilles décalées qui apparaissent au défilement |

Le mode retenu sur l'accueil est **Bulles animées**. Les pastilles ont un rayon plein, une ombre portée douce et un décalage horizontal alterné sur ordinateur. Elles apparaissent l'une après l'autre à 120 ms d'intervalle quand la section entre dans l'écran, puis flottent en boucle très lentement. Sur mobile elles s'empilent sans décalage.

L'apparition repose sur un `IntersectionObserver` et l'attribut `data-k-reveal`, réutilisable sur n'importe quel élément. Sans `IntersectionObserver`, le contenu s'affiche directement. Si le visiteur a activé la réduction des animations dans son système, ni l'apparition ni le flottement ne se déclenchent : le contenu est visible d'emblée.

Le texte a été réduit de deux paragraphes à une phrase, et les trois constats de phrases complètes à des fragments de quatre à six mots. Le mode deux colonnes reste disponible dans le builder si le format long est préféré.

---

## 15. Structure de la page d'accueil

### Ce que l'audit a montré

Mesure faite sur le contenu réel, pas à l'œil : 911 mots répartis sur 15 sections, et les mêmes faits produit répétés d'une section à l'autre.

| Expression | Sections concernées, avant |
|---|---|
| 2 gélules par jour | 5 |
| 7 actifs | 4 |
| une seule formule | 3 |
| 30 jours | 3 |

L'argument « ne pas empiler plusieurs pots » était développé trois fois : dans le constat, dans l'introduction du bandeau bénéfices, et dans le comparatif. La section « Pourquoi choisir Kemia Lab » reprenait par ailleurs, en phrases longues, trois des quatre repères déjà affichés en pictogrammes dans le hero.

### Règle appliquée

**Un fait, une section propriétaire.** Chaque information n'est développée qu'à un seul endroit ; les autres sections y renvoient sans la redire.

| Fait | Section propriétaire |
|---|---|
| 7 actifs, 2 gélules, 30 jours | Bandeau bénéfices, sous forme de chiffres |
| Le rituel quotidien | Mode d'emploi |
| Les noms d'actifs et leurs rôles | Composition |
| L'argument contre l'empilement de produits | Comparatif |
| Les réponses détaillées | FAQ |

### Ordre retenu, par étape AIDA

| # | Section | Étape | Rôle unique |
|---|---|---|---|
| 1 | Hero | Attention | La promesse, le mot-clé, le premier appel à l'action |
| 2 | Réassurance | Attention | Lever le doute logistique sous le pli |
| 3 | Le constat | Intérêt | Nommer le problème, sans encore parler du produit |
| 4 | Bandeau bénéfices | Désir | Ce que la cure apporte, et les trois chiffres |
| 5 | Composition | Désir | Ce qu'il y a dedans, la preuve |
| 6 | Paroles de professionnels | Désir | Caution externe |
| 7 | Comparatif | Désir | Pourquoi celle-ci plutôt qu'une autre |
| 8 | Produit à la une | Désir vers Action | Le produit, le prix, l'appel à l'action |
| 9 | Mode d'emploi | Action | Lever l'objection de contrainte |
| 10 | Avis clients | Action | Preuve sociale |
| 11 | Questions fréquentes | Action | Dernières objections et longue traîne |
| 12 | Appel à l'action final | Action | Conclure |
| 13 | Blog | — | Contenu et référencement |
| 14 | Newsletter | — | Récupérer les visiteurs qui n'achètent pas |

Deux corrections de fond par rapport à l'ordre précédent : le constat passe de la 7e à la 3e position, et le comparatif remonte avant le produit à la une, pour que le visiteur arrive sur le prix en ayant déjà écarté les alternatives.

**Section supprimée : « Pourquoi choisir Kemia Lab ».** Quatre-vingt-deux mots qui reformulaient les pictogrammes du hero, placés après le comparatif, à un endroit du parcours où le visiteur cherche à décider et non à découvrir la marque. Le discours de marque reste accessible par la page À propos, présente au menu. La section reste disponible dans le Theme Builder.

### Répartition du texte

| | Avant | Après |
|---|---|---|
| Argumentaire commercial | 679 mots | 561 mots |
| FAQ, contenu de référencement | 232 mots | 355 mots |

L'argumentaire perd 118 mots, la FAQ en gagne 123. Le volume total est stable, mais il a changé de nature : moins de phrases qui redisent, plus de réponses qui couvrent des requêtes réelles.

### Mot-clé et champ sémantique

Le mot-clé principal apparaît dans cinq titres, chaque fois avec une formulation différente, jamais deux fois à l'identique.

| Section | Titre | Angle |
|---|---|---|
| Hero | Le complément alimentaire contre la fatigue physique et mentale | Requête exacte, H1 |
| Le constat | La fatigue attaque sur deux fronts | Problème |
| Composition | Ce que contient une cure contre la fatigue | Composition |
| Comparatif | Quel complément alimentaire choisir contre la fatigue ? | Requête d'intention commerciale |
| FAQ | Complément alimentaire et fatigue : ce qu'il faut savoir | Informationnel |

Le champ sémantique est réparti plutôt que concentré : *coup de barre*, *baisse d'énergie* et *réveil* dans le constat ; *énergie*, *concentration*, *vitalité*, *immunité* dans les bénéfices ; *ginseng*, *safran*, *kola*, *zinc*, *vitamine D3* dans la composition ; *cure*, *gélules*, *prise quotidienne* dans le mode d'emploi ; *fatigue passagère*, *fatigue installée*, *anti-fatigue* dans la FAQ.

Deux questions ont été ajoutées à la FAQ sur des intentions de recherche réelles : la distinction entre fatigue passagère et fatigue installée, et la prise au long cours. La première précise qu'une fatigue persistante relève d'un avis médical, ce qui est à la fois exact et protecteur.


---

## 16. Structure de la fiche produit

### Le problème constaté

Sept sections de la fiche produit reprenaient la page d'accueil : storytelling, bandeau bénéfices, actifs, comparatif, avis de professionnels, avis clients, FAQ. Un visiteur qui arrivait par l'accueil lisait deux fois le même argumentaire, avec les mêmes phrases. La fiche produit ne faisait pas avancer la décision, elle la répétait.

### Le principe retenu

Les deux pages ne s'adressent pas au même moment de la décision.

- **L'accueil** parle au marché : il explique ce qu'est la fatigue physique et mentale, et pourquoi une cure peut y répondre. Registre général, vocabulaire de recherche.
- **La fiche produit** parle à quelqu'un qui a déjà cliqué : il n'a plus besoin qu'on lui explique la fatigue, il a besoin de savoir si *ce* produit est pour *lui*, ce qu'il y a dedans, en quoi il diffère, et ce qui se passe s'il commande. Registre personnel, deuxième personne, détail vérifiable.

La fiche produit ne réexplique donc jamais le problème : elle le nomme en une phrase pour créer la reconnaissance, puis passe immédiatement à la qualification et à la preuve.

### Ordre appliqué

| Ordre | Section | Étape AIDA | Ce qu'elle fait, et que l'accueil ne fait pas |
|---|---|---|---|
| 1 | Fiche produit | — | Bloc d'achat. Non modifié. |
| 2 | Storytelling | Attention | Décrit les conséquences sur la journée du lecteur, pas les symptômes de la fatigue. Mise en page en deux colonnes, là où l'accueil utilise des bulles. |
| 3 | Bandeau bénéfices | Intérêt | Porte la promesse de cure : sept actifs, une prise, trente jours, aucune reconduction. |
| 4 | Fait pour vous | Désir | Nouvelle section. Met en face de chaque situation du lecteur la réponse de la formule. |
| 5 | Actifs autour du produit | Désir | **Dosages affichés**, ce que l'accueil masque volontairement. C'est le premier vrai différenciateur de la page. |
| 6 | Références | Désir | Monographies européennes et étude clinique. L'accueil cite des praticiens : registre différent, sources différentes. |
| 7 | Comparatif | Désir | Cinq axes inédits, aucun repris de l'accueil. |
| 8 | Avis clients | Désir | Après la cure, là où l'accueil parle du démarrage. |
| 9 | Questions pratiques | Action | Objections d'avant-commande, pas de requêtes de recherche. |
| 10 | Appel à l'action | Action | Ancre vers le bloc d'achat. |
| 11 | Réassurance | Action | Livraison, paiement, qualité. |

### « Fait pour vous » : pourquoi cette section

C'est la section qui travaille le plus la décision. Cinq lignes, chacune en deux temps : à gauche une situation que le lecteur reconnaît, à droite ce que la formule y apporte. Rien d'autre.

1. **Elle affirme au lieu de demander.** La page ne demande pas au lecteur s'il est le bon client, elle lui dit que le produit a été construit pour ses journées. Un titre en question laisse une porte de sortie ; un titre affirmatif n'en laisse pas.
2. **Elle fait le lien problème-solution ligne à ligne.** Le lecteur n'a pas à faire le raisonnement lui-même : sa situation et la réponse sont côte à côte, sur la même ligne, séparées seulement par un changement de fond.
3. **Elle reste vérifiable.** Chaque réponse est un fait contrôlable — une formule, un dosage affiché, deux gélules, trente jours sans reconduction — ou un libellé d'allégation autorisée pour le zinc. Aucune ligne ne promet un résultat.

Visuellement, la situation est posée sur fond blanc en caractères gras, la réponse sur fond beige avec une coche dorée. Sur mobile les deux se superposent, la réponse toujours sous la situation : l'ordre de lecture porte le sens.

**Version précédente écartée.** Une première version qualifiait le lecteur en deux colonnes, « oui c'est pour vous » et « non, dans ces cas ». Elle a été abandonnée : dire à un prospect que le produit pourrait ne pas lui convenir introduit un doute au moment exact où la page doit lever les doutes. Les mentions qui figuraient dans la colonne « non » — âge, grossesse, allaitement, traitement médical, sensibilité à la caféine — sont toutes présentes, en intégralité, dans l'accordéon « Précautions d'emploi » du bloc d'achat, alimenté par le champ méta `kemia.precautions_full`. Rien n'a été perdu en les retirant de cette section.

### Comparatif : les axes retenus

Aucun axe de l'accueil n'est repris. L'accueil compare une cure à une étagère de pots ; la fiche produit compare deux étiquettes.

| 4 Vitality System | La plupart des compléments anti-fatigue |
|---|---|
| 25 mg de caféine annoncés | Des plantes stimulantes rarement quantifiées |
| 7 actifs à des quantités utiles | Une liste à rallonge, quelques milligrammes chacun |
| Fabriqué en France, contrôlé lot par lot | Lieu de fabrication rarement précisé |
| Une boîte = 30 jours, sans reconduction | Abonnement reconduit par défaut |
| Chaque énoncé renvoie à sa source | Des promesses fortes sans référence vérifiable |

Le dernier axe est le seul qui se vérifie sur la page elle-même : la section Références placée juste au-dessus lui sert de preuve. C'est aussi le seul qui ne peut pas être copié par un concurrent sans qu'il fasse réellement le travail.

### Contrôle anti-doublon

Un contrôle automatique compare chaque phrase de la fiche produit à chaque phrase de l'accueil, à la fois en identité exacte et en proximité lexicale.

- **0 phrase de vente identique.** Les treize chaînes communes restantes sont des libellés qui *doivent* l'être : le nom du produit, « Client vérifié », le bandeau de réassurance, les noms d'actifs, les libellés de boutons.
- **0 titre de section commun.** Les dix titres diffèrent deux à deux.
- Les rapprochements résiduels portent tous sur des faits qui ne peuvent pas varier d'une page à l'autre : la posologie, les 25 mg de caféine, le seuil de livraison offerte, les mentions vegan et sans OGM. Les faire diverger reviendrait à écrire deux vérités différentes sur le même produit.

### Champ sémantique

La section « Fait pour vous » place le vocabulaire de l'avatar (*travail*, *trajets*, *entraînement*, *attention*, *après-midi*) au contact direct du vocabulaire produit (*formule*, *fatigue physique*, *fatigue mentale*, *zinc*, *ginseng*, *kola*, *dosage*, *cure de 30 jours*). C'est la seule section de la page où les deux registres se touchent sur la même ligne.

L'accueil capte les requêtes larges. La fiche produit prend les requêtes en aval, celles qui se posent une fois le produit trouvé : *dosage*, *quantité par actif*, *caféine*, *à jeun ou pendant le repas*, *oubli de prise*, *association avec d'autres compléments*, *durée de cure*, *sans abonnement*, *fabriqué en France*, *délai de livraison*. Les sept questions de la FAQ sont toutes distinctes de celles de l'accueil et restent balisées FAQPage.

---

## 17. Le thème fait autorité sur les textes

À partir de la v1.7.1, les textes ont été modifiés directement dans le Theme Builder. `templates/index.json` et `templates/product.json` du dépôt sont donc **en retard** sur le thème : notes vidées, réassurance en carte, avis limités à 6, image ajoutée sur l'appel à l'action, tirets remplacés par des virgules.

**Règle à tenir :** avant tout déploiement complet, récupérer les deux gabarits depuis le thème et les réintégrer au dépôt. Un envoi de thème complet écraserait sinon les modifications faites dans le Builder.

Les mises à jour de code seules (sections, extraits, CSS, JS) se poussent fichier par fichier avec `themeFilesUpsert` sur le thème non publié : les gabarits ne sont pas dans la charge utile, donc rien ne peut être écrasé. C'est la méthode retenue pour la v1.7.1.

### Quatre corrections livrées sur la v1.7.1

| Demande | Traitement |
|---|---|
| Images des actifs modifiables | 8 champs d'image dans les réglages de la section « Ce qu'il y a dans la gélule », un par actif dans l'ordre d'affichage. Vide, l'image de la fiche actif sert de repli. Cadre carré fixe, image entière, donc rendu identique quelle que soit la source. |
| Vide autour du visuel produit | Mesuré : au-delà de 990 px le bandeau faisait 1355 px de haut pour une image de 576 px, soit 386 px de vide au-dessus et 394 px en dessous, parce que la colonne image se centrait sur la hauteur du bloc d'achat. Le visuel et le rail des bénéfices sont désormais collants à 108 px, sous l'en-tête fixe de 88 px : ils suivent le défilement au lieu de flotter. En dessous de 990 px il n'y avait que 24 et 30 px, rien n'a été touché. |
| Accroche modifiable | Le bloc « Accroche dorée » n'avait aucun réglage. Il a un champ texte, qui l'emporte sur le champ méta `kemia.tagline` quand il est rempli. |
| Blog en slider | La section utilise le carrousel déjà en place sur les avis : flèches à partir de 990 px, points, défilement tactile. Le réglage a changé d'identifiant (`count` devient `slides_count`) parce qu'il a changé de sens, ce qui écarte l'ancienne valeur de 3 au profit de 6 : les 6 articles du blog défilent 3 par 3. |

---

## 18. Galerie produit, avis et suivi

### Le champ « Nom d'événement analytics » a été retiré

Il était présent sur six sections et servait à nommer le clic du bouton pour Google Tag Manager. Aucun tag manager n'étant installé, il ne produisait aucune donnée. Le champ a été supprimé des réglages.

Les événements internes restent en place et se déclenchent seuls : `cure_selected`, `product_added_to_cart`, `cart_upgraded`, `email_submitted`, `checkout_started`. Ils partent dans `window.dataLayer` et seront exploitables le jour où un tag manager sera branché, sans rien avoir à recâbler.

### Galerie de la fiche produit

Elle basculait d'une image à l'autre en masquant les autres, et les flèches faisaient défiler la bande de vignettes au lieu de changer l'image.

Elle est désormais construite sur une piste défilable avec accrochage : le glissement tactile, la molette horizontale et les flèches passent tous par le même défilement, qui fait autorité sur l'état affiché. Les flèches sont posées sur l'image principale et se désactivent en butée. Les vignettes restent cliquables et la vignette active suit l'image visible, quelle que soit la manière dont on a navigué.

### Nombre d'avis et note calculés depuis le JSON

Le nombre d'avis et la note étaient trois champs indépendants : coller un nouveau JSON n'actualisait ni l'un ni l'autre, et les trois pouvaient se contredire.

Désormais, dès que `kemia.reviews_json` contient au moins un avis, le nombre affiché est le nombre réel d'entrées et la note est leur moyenne. Les champs `kemia.review_count` et `kemia.rating` ne servent plus que de repli quand le JSON est vide. Le calcul s'applique partout : bloc d'achat, fenêtre des avis, section avis, fiche de collection et données structurées.

La moyenne est tronquée à la décimale inférieure, jamais arrondie au-dessus : une note affichée ne peut pas être supérieure à la réalité.

Les trois champs méta sont maintenant épinglés, ils apparaissent donc directement sur la fiche produit dans l'admin.

### Logos de paiement

L'application qui les injecte pose son bloc dans le formulaire d'achat, où tous les éléments sont alignés à gauche. Une règle centre les éléments du formulaire qui ne portent pas de classe du thème, c'est-à-dire uniquement ceux venant d'une application. Le bloc d'urgence, seul élément du thème sans classe, en a reçu une pour rester à l'écart de cette règle.
