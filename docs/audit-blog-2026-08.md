# Audit éditorial et SEO du blog — 4 août 2026

Quarante articles, mesurés plutôt qu'estimés. Trois sources : l'analyse du
texte lui-même (`build/audit_articles.py`), les volumes de recherche réels du
marché français (Semrush), et une vérification des faits datés contre l'état
de Google en 2026.

---

## 1. Longueur et densité — correct, sans plus

| Mesure | Valeur |
|---|---|
| Volume médian | 946 mots |
| Le plus court | 840 mots |
| Le plus long | 1 290 mots |
| Titres de niveau 2 par article | 8,9 |
| Titres de niveau 3 par article | 4,4 |
| Tableau de données | 1 par article |
| Repères chiffrés | 14,2 par article |
| Gestes concrets (« ouvrez », « comptez »…) | 4,5 par article |

**Le verdict.** Aucun article n'est mince au sens de Google. Mais 946 mots est
un format d'article, pas de guide de référence. Sur les requêtes disputées —
« agence seo », « audit seo », « avis google » — les pages qui occupent le top
5 font couramment le double. Le blog est propre ; il n'est pas encore
dominant.

**Sept articles restent légers en repères chiffrés** (moins de 8) : ai-overviews,
apps-shopify, données-structurées, eeat, pixel-meta, refonte-site,
seo-ou-meta-ads. Ce sont ceux où le lecteur repart avec le moins de concret.

---

## 2. Lisibilité — le point fort

| Mesure | Valeur | Lecture |
|---|---|---|
| Indice Kandel-Moles | 68,5 | accessible (60-70 = bon grand public) |
| Mots par phrase | 17,8 | confortable |
| Phrases au-dessus de 25 mots | 15,8 % | acceptable |

Aucun article sous 40 (seuil de lecture ardue). Le plus dense reste
`combien-coute-une-boutique-shopify` à 56,2, ce qui est encore lisible.

Une seule formule creuse relevée sur l'ensemble du blog (« à l'ère des »,
dans ai-overviews). Le ton est direct, sans jargon.

---

## 3. E-E-A-T — le vrai point faible

| Signal | État |
|---|---|
| Auteur nommé | ✅ « Mathieu · Clickscreation » sur 38 articles |
| Cohérence de signature | ⚠️ 2 articles signés « Équipe Clickscreation » |
| Page auteur avec parcours | ❌ absente |
| Photo de l'auteur | ❌ absente |
| Schéma `Person` relié | ❌ l'auteur est un texte, pas une entité |
| Image d'illustration | ❌ **34 articles sur 40 n'en ont aucune** |
| Marqueur d'expérience vécue | ❌ **22 articles sur 40 à zéro** |

**Le problème central.** Vingt-deux articles ne contiennent aucune trace du
fait que vous avez réellement pratiqué ce que vous décrivez : pas un « ce que
nous voyons chez nos clients », pas un cas rencontré, pas un chiffre issu de
vos propres projets. Le texte est juste, mais il pourrait avoir été écrit par
n'importe qui ayant lu la documentation.

C'est précisément ce que le premier E de E-E-A-T mesure — *Experience* — et
c'est ce qui distingue votre blog de celui d'une agence qui recopie.

**L'absence d'illustration** sur 34 articles a trois effets : le nœud `image`
de l'Article schema reste vide, le partage social retombe sur l'image
générique du site, et la page du blog affiche quarante cartes identiques.

---

## 4. Actualité 2026 — vérifiée, une seule correction

Faits recoupés contre l'état réel de Google en août 2026 :

| Affirmation du blog | Réalité 2026 | Verdict |
|---|---|---|
| LCP ≤ 2,5 s / INP ≤ 200 ms / CLS ≤ 0,1 | seuils inchangés | ✅ exact |
| INP a remplacé FID | confirmé, et l'INP est passé signal de classement à part entière | ✅ exact |
| Les AI Overviews captent les clics informationnels | confirmé : 48 % des requêtes en mars 2026, contre 34,5 % en décembre 2025 | ✅ exact mais sous-documenté |
| L'e-commerce est moins touché | confirmé : 4 % des requêtes e-commerce seulement | ✅ exact |
| Un contenu « de 2019 » comme exemple de page datée | l'exemple a sept ans | ⚠️ à rafraîchir |

**Ce qui manque plutôt que ce qui est faux.** L'article sur les AI Overviews
décrit correctement le phénomène mais ne cite aucun chiffre 2026, alors qu'ils
existent et sont frappants : les pages citées dans une réponse IA reçoivent
120 % de clics en plus par impression que les non citées. C'est exactement le
type de donnée qui fait citer un article.

---

## 5. Impact SEO réel — nul aujourd'hui, et une raison précise

### L'état du domaine

Relevé Semrush sur `clickscreation.com`, base France :

- **9 mots-clés positionnés**, tous entre la position 45 et 100 — soit page 5 à 10.
- Tous sur des pages villes (`/pages/agence-seo-strasbourg`, `-grenoble`, `-toulouse`…).
- **Aucun article de blog ne se positionne sur quoi que ce soit.**
- Trafic organique estimé : proche de zéro.

Ce n'est pas un défaut de qualité : c'est un domaine jeune sur son nouveau
contenu. Mais cela signifie que le blog n'a, à cette heure, aucun effet
mesurable — et que sa valeur dépend entièrement de ce qui suit.

### Le décalage de ciblage

Plusieurs articles visent une formulation que personne ne tape, alors qu'une
variante à fort volume existe :

| Article | Formulation visée | Volume | Meilleure cible | Volume |
|---|---|---|---|---|
| combien-coute-audit-seo | « combien coûte audit seo » | ~0 | **prix audit seo** | 880 |
| | | | tarif audit seo | 480 |
| combien-coute-le-seo-en-2026 | « combien coûte le seo » | 10 | **tarif seo** | 720 |
| | | | prix seo | 210 |
| balises-title-formules-ctr | « taux de clic seo » | 0 | **balise title** | 590 |
| seo-ou-google-ads | « seo ou google ads » | **0** | à repositionner | — |
| collections-shopify-architecture-seo | « collections shopify » | 10 | boutique shopify | 1 600 |
| combien-coute-une-boutique-shopify | « prix boutique shopify » | 30 | boutique shopify | 1 600 |
| agence-seo-ou-consultant-seo | « agence seo ou freelance » | 40 | prix agence seo | 140 |
| refonte-site-sans-perdre-seo | « refonte site seo » | 30 | — faible partout |
| migrer-vers-shopify-sans-perdre-seo | « migrer vers shopify » | 10 | — faible partout |

### Les sujets bien visés

À l'inverse, quinze articles couvrent des requêtes à vrai volume :

| Sujet | Volume mensuel France | CPC |
|---|---|---|
| avis google | 33 100 | 1,64 € |
| google business profile | 14 800 | 2,08 € |
| ab testing | 9 900 | 7,82 € |
| meta ads | 9 900 | 10,44 € |
| audit seo | 6 600 | 2,67 € |
| roas | 5 400 | 1,89 € |
| fiche produit | 2 900 | 2,35 € |
| seo local | 2 900 | 2,43 € |
| maillage interne | 1 900 | 1,49 € |
| microsoft clarity | 1 900 | 3,73 € |
| ai overviews | 1 600 | 0,73 € |
| e-e-a-t | 1 600 | — |
| core web vitals | 1 300 | 1,47 € |
| analyse concurrentielle | 1 300 | 1,86 € |
| cahier des charges site internet | 1 000 | 1,19 € |

Le CPC est la mesure la plus honnête de la valeur commerciale : « meta ads » à
10,44 € le clic signifie que des annonceurs paient ce prix parce que ça
rapporte.

### Une paire qui se cannibalise

`agence-seo-ou-consultant-seo` et
`comment-choisir-votre-agence-seo-sans-vous-faire-avoir` partagent 40 % de leur
vocabulaire de titres et visent la même intention : choisir un prestataire SEO.
Deux pages sur une intention se privent mutuellement de positions.

---

## 6. Ce qu'il faut faire, par ordre de rentabilité

1. **Injecter du vécu dans les 22 articles concernés.** Un paragraphe par
   article : un cas rencontré, un chiffre issu de vos projets, une erreur que
   vous voyez revenir. C'est le levier E-E-A-T le plus fort et le seul que vos
   concurrents ne peuvent pas copier.
2. **Retitrer les six articles mal ciblés.** Changer « Combien coûte un audit
   SEO » en « Prix d'un audit SEO » déplace la cible de zéro à 880 recherches
   mensuelles, sans réécrire une ligne de fond.
3. **Trancher la paire cannibale.** Soit fusionner les deux articles, soit
   spécialiser nettement le second sur les signaux d'alarme uniquement.
4. **Donner une image à chaque article.** 34 en manquent : effet immédiat sur
   le partage, la page du blog et le balisage.
5. **Créer la page auteur.** Parcours, photo, certifications, schéma `Person`
   relié aux articles. C'est le pilier *Autorité* qui manque entièrement.
6. **Ajouter les chiffres 2026 aux articles qui les appellent** — AI Overviews
   en premier.
7. **Étoffer les sept articles pauvres en repères chiffrés.**

Les points 2, 3 et 4 se font en une session. Le point 1 demande votre matière
première : les cas clients, on ne les invente pas.

---

## Note de méthode

Les mesures de texte proviennent de `build/audit_articles.py`, relançable à
tout moment. Trois alertes du premier passage étaient des faux positifs — une
mention de FID correctement présentée comme obsolète, une tournure idiomatique,
un comptage de chiffres aveugle aux nombres écrits en lettres. Les règles ont
été corrigées avant de produire ce document.
