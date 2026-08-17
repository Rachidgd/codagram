# Direction artistique v2 — Clickscreation

## Le diagnostic, avant les décisions

Le client dit : « le site est trop chargé et trop compliqué, on s'y perd ».
La tentation serait d'enlever du texte. Ce serait une erreur : le contenu est
le seul actif du site qui fonctionne (zéro phrase recopiée d'une page à
l'autre, 118 questions de FAQ uniques sur 120). Le problème est ailleurs.

Deux références ont été fournies. Elles n'ont pas la même palette, mais elles
partagent quatre choses que Signal n'a pas :

**1. L'alternance.** Les deux font succéder des zones sombres pleine largeur
et des zones presque blanches. Signal est sombre du premier au dernier pixel.
Aucune frontière ne sépare une idée de la suivante : toutes les sections se
ressemblent, donc le lecteur ne sait jamais où il en est. C'est la cause
première du « on s'y perd », et elle n'a rien à voir avec le volume de texte.

**2. L'air.** `--spacing-section` plafonne aujourd'hui à 5 rem (80 px). Les
deux références respirent entre 120 et 180 px. Le commentaire de notre propre
feuille de style dit : « rythme vertical serré, aucun vide décoratif ».
C'était un parti pris assumé. C'est celui qui échoue.

**3. Les grands rayons.** Nos rayons plafonnent à 22 px, avec ce commentaire :
« anguleux, jamais friendly ». Les deux références posent 24 à 40 px sur les
grandes surfaces. Un grand rayon ne rend pas un site puéril, il le rend calme.

**4. Un seul accent.** Signal en a deux : le vert `--color-volt` et l'orange
`--color-ember`. Deux accents, c'est un accent de trop.

## Ce que les références ne peuvent pas nous donner

Les deux ancrent leur premier écran sur une **capture de tableau de bord** :
graphiques, indicateurs, courbes. C'est cohérent pour un logiciel.
Clickscreation vend un service. Reprendre ce procédé revient à inventer un
produit qui n'existe pas — et le site actuel le fait déjà, avec une console
animée dont la courbe est une sinusoïde calculée en JavaScript, présentée
sous un libellé « trafic organique » et une période réelle.

**Ce faux instrument disparaît.** Le premier écran doit tenir par la
typographie et par une preuve vraie : deux chiffres, avec le nom du client et
la période. C'est moins spectaculaire et c'est infiniment plus solide.

## Les décisions

**On garde l'encre et le vert.** L'indigo `#4648ff` de la première référence
et le `#6366f1` de la seconde sont l'accent SaaS le plus répandu de 2026 :
l'adopter ferait ressembler l'agence au gabarit qu'elle prétend dépasser. Le
vert est l'identité existante, et il fonctionne aussi bien sur fond clair.

**On inverse le rapport clair/sombre.** Le fond de page devient clair. Le noir
`#0b0e0d` reste, mais comme couleur de zones choisies : le hero, une section
de preuve, le pied de page. Trois zones sombres sur une page, pas quinze.

**On garde Jost.** Les références utilisent Inter et Syne. Jost est de la même
famille de sensation — géométrique, large, à faible contraste de trait — et
elle est déjà chargée. Ajouter une police, c'est 30 Ko pour un gain nul.

## Les jetons

Ce qui suit remplace le bloc `:root` de `src/css/signal.css`. Les valeurs
d'encre et de papier reprennent volontairement celles qui existent : la
palette n'est pas jetée, elle est réordonnée.

```css
:root {
  /* --- Fond de page : clair, légèrement chaud -------------------------- */
  --ground:        #f7f8f4;   /* le fond du site                          */
  --ground-2:      #eef1ea;   /* bandes alternées sur fond clair          */
  --ground-line:   #dfe3da;   /* bordures sur clair                       */

  /* --- Zones sombres : trois par page, pas plus ------------------------ */
  --ink:           #0b0e0d;   /* hero, preuve, pied de page               */
  --ink-2:         #101412;   /* cartes posées sur une zone sombre        */
  --ink-line:      rgb(255 255 255 / 0.10);

  /* --- Texte ---------------------------------------------------------- */
  --on-ground:     #161c1a;   /* 14,8:1 sur --ground                      */
  --on-ground-mut: #4b5651;   /*  7,1:1 sur --ground                      */
  --on-ink:        #eef2ef;   /* 15,4:1 sur --ink                         */
  --on-ink-mut:    #98a39e;   /*  7,3:1 sur --ink                         */

  /* --- L'accent, unique ----------------------------------------------- */
  --volt:          #d6fb51;
  --volt-deep:     #6f8a17;   /* le seul vert lisible en TEXTE sur clair  */
  /* Règle : sur fond clair, le vert est une surface, jamais du texte.
     Un texte sur pastille verte est encré, pas blanc. Sur fond sombre,
     --volt peut être du texte (15,1:1). L'orange --color-ember est
     supprimé : deux accents, c'est un accent de trop.                    */

  /* --- Rayons : calmes sur les grandes surfaces ----------------------- */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-2xl: 40px;   /* hero, grandes cartes                           */
  --radius-pill: 999px; /* boutons                                        */

  /* --- Rythme vertical : c'est ici que se joue la lisibilité ---------- */
  --section-y:     clamp(4rem, 3rem + 4.5vw, 7.5rem);
  --section-y-sm:  clamp(2.75rem, 2.2rem + 2.2vw, 4.5rem);
  --shell-x:       clamp(1.25rem, 0.9rem + 1.4vw, 2.25rem);
  --stack:         clamp(1.25rem, 1rem + 1vw, 2rem);  /* entre blocs      */

  /* --- Ombres : portées longues et douces, jamais de halo ------------- */
  --shadow-card:  0 1px 2px rgb(11 14 13 / 0.04), 0 12px 32px -16px rgb(11 14 13 / 0.12);
  --shadow-lift:  0 2px 4px rgb(11 14 13 / 0.05), 0 28px 60px -28px rgb(11 14 13 / 0.20);

  /* --- Largeurs ------------------------------------------------------- */
  --shell:        1200px;
  --shell-narrow: 920px;
  --prose:        66ch;
}
```

## Les composants qui changent

**L'en-tête.** Fond clair, translucide au défilement, une bordure d'un pixel
en bas. Nav centrée, deux menus déroulants (Prestations, Audits), bouton
pilule vert à droite avec texte encré. On supprime la barre d'annonce des
références : nous n'avons rien à annoncer, et une barre vide est un bandeau
publicitaire pour rien.

**Le hero d'accueil.** Une carte sombre à `--radius-2xl`, posée sur le fond
clair, marges latérales visibles. Dedans : un sur-titre discret, le titre en
`clamp(2.25rem, 1.6rem + 3.2vw, 4.25rem)` avec `letter-spacing: -0.03em`, une
phrase de chapô, deux boutons pilule (vert plein, puis contour clair). Sous la
carte, débordant sur le fond clair : **deux chiffres avec le nom du client et
la période**, là où les références mettent une capture de logiciel.

Ce qui disparaît du premier écran : la console animée, les cinq pastilles de
canaux, les trois mentions de réassurance. Il reste un sur-titre, un titre,
une phrase, deux boutons, deux preuves nommées.

**Les heros de page intérieure.** Pas de carte sombre — sinon l'effet ne veut
plus rien dire. Fond clair, fil d'Ariane, H1, chapô, un bouton. Les pages
villes gardent leurs deux chiffres de preuve, qu'elles n'ont pas aujourd'hui.

**Les sections.** Une règle simple et suffisante : `--ground` par défaut,
`--ground-2` pour une section sur trois, `--ink` réservé à deux moments — la
preuve et l'appel à l'action final. Le pied de page est sombre. Toute page qui
compte plus de trois zones sombres est mal découpée.

**Les FAQ.** Accordéon fermé par défaut, question en `--text-h4`, chevron à
droite. Le contenu reste dans le HTML, donc lisible par Google : replier n'est
pas cacher. C'est le premier levier d'allègement des pages villes, qui portent
six à huit questions chacune.

**La barre d'action mobile.** Elle n'existe pas aujourd'hui : sous 640 px le
bouton d'en-tête est masqué et la seule action se trouve au fond du menu
burger. Sur des requêtes majoritairement mobiles, c'est la correction au
meilleur rendement du chantier. Barre fixe en bas, révélée après 40 % de
défilement, un bouton et une ligne de réassurance.

## Ce qui est supprimé

| Élément | Motif |
|---|---|
| Console animée du hero | Une sinusoïde en JavaScript présentée comme une mesure |
| Compteurs qui s'enroulent | Un chiffre qui s'anime évoque le compteur marketing ; imprimé, il évoque le relevé |
| Accent orange `--color-ember` | Deux accents valent moins qu'un |
| Compteur « 2 places ce mois-ci » | Rareté fabriquée, affichée sur 85 pages |
| Pastilles de canaux du hero | Cinq étiquettes qui n'apportent aucune information nouvelle |

**Ce qui reste malgré la simplification :** la palette de commandes ⌘K. Elle
est le seul moyen d'atteindre 40 guides et 45 pages en deux frappes, et elle
ne coûte rien à qui l'ignore. Son plafond de 12 articles doit être relevé à 40.

## L'ordre d'exécution

1. Le bloc de jetons, et la bascule du fond de page en clair. Rien d'autre ne
   peut être jugé avant.
2. En-tête et pied de page — ils sont sur toutes les pages.
3. Le hero d'accueil, console supprimée, preuves nommées.
4. Le système de sections alternées, appliqué gabarit par gabarit.
5. La barre d'action mobile.
6. Les FAQ en accordéon fermé.

Les points 1 à 3 suffisent à juger si la direction est la bonne. Il ne faut
pas engager les points 4 à 6 avant cet arbitrage.
