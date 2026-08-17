# Charte rédactionnelle — Clickscreation

Ce document a une seule fonction : permettre de refuser un texte pour une
raison nommable. Un refus sans règle écrite n'est qu'un avis, et un avis se
discute indéfiniment. Ici, la règle est enfreinte ou elle ne l'est pas.

Il s'applique aux pages, aux articles, aux balises, aux libellés de bouton et
aux réponses de FAQ. Il n'y a pas de zone dispensée.

---

## 1. Ce qui trahit un texte écrit par une machine

Le lecteur ne se dit pas « c'est de l'IA ». Il se dit « c'est creux », et il
part. Les tournures ci-dessous produisent cet effet. Elles sont refusées, sans
discussion, y compris quand la phrase est par ailleurs juste.

### Les ouvertures de dissertation

- « Dans un monde où… », « À l'ère du numérique… », « Aujourd'hui plus que
  jamais… », « De nos jours… »
- « Le référencement naturel est un levier incontournable pour… »
- Toute phrase d'ouverture qui pourrait commencer n'importe quel autre texte
  sur le même sujet.

Une page commence par le fait le plus dur dont elle dispose. Pas par un
préambule.

### Les béquilles de liaison

- « Il est important de noter que », « Il convient de », « Il faut savoir que »
- « En effet », « Par ailleurs » et « De plus » employés en tête de paragraphe
  par réflexe
- « En résumé », « Pour conclure », « En définitive »
- « N'hésitez pas à »

Ces formules ne relient rien : elles remplissent le silence entre deux idées.
Si le lien logique existe, il se voit sans être annoncé.

### Le rythme ternaire systématique

Trois adjectifs, trois avantages, trois étapes, à chaque paragraphe. Le
procédé se remarque à la troisième occurrence et discrédite tout le reste.
Deux éléments valent souvent mieux que trois, et un seul, souvent mieux que
deux. On écrit le nombre d'éléments qu'on a, pas le nombre qui sonne bien.

### La structure « ce n'est pas X, c'est Y »

Excellente une fois par page. Devenue tic quand elle revient trois fois, et
c'est la signature stylistique la plus reconnaissable des textes générés.
Même verdict pour l'usage décoratif du tiret cadratin en incise à répétition.

### Le verbe de brochure

- « révolutionner », « propulser », « booster », « décupler », « transformer
  radicalement »
- « plonger dans », « découvrez comment », « libérez le potentiel »
- « solution sur-mesure clé en main », « accompagnement à 360° »

### La question rhétorique en série

Une question posée au lecteur qui n'attend pas de réponse est un artifice.
Deux dans la même page, c'est un procédé. Les questions du site vivent dans
la FAQ, où elles sont réelles.

### Le paragraphe qui redit son titre

Le H2 annonce, le premier paragraphe reformule, le second commence enfin. Le
premier paragraphe doit apporter le fait, pas confirmer l'intitulé.

---

## 2. Ce que le site s'interdit sur le fond

Ces règles-là ne sont pas stylistiques. Les enfreindre expose l'agence.

**Aucune implantation locale hors Paris.** L'agence est à Paris. Aucun texte
ne peut laisser croire à un bureau, un interlocuteur ou une équipe ailleurs.
« Un seul interlocuteur à Marseille » a déjà été refusé pour cette raison.

**Deux cas clients documentés, pas trois.** Noza & Co et Maison Ayla. Tout
chiffre de performance publié porte le nom du client, la période et la source.
Un chiffre qui voyage sans son contexte redevient un argument publicitaire et
détruit la crédibilité des chiffres voisins.

**Aucune promesse de résultat.** Ni « des demandes chaque semaine », ni « deux
fois plus », ni un délai de positionnement. La formulation admise est celle de
la conception : « conçu pour », « construit pour ».

**Aucune rareté fabriquée.** Pas de compteur de places, pas de décompte, pas
de « plus que quelques créneaux ».

**Ne jamais restreindre le marché dans un titre générique.** Une page
« création de site internet à Lyon » est lue par un maçon comme par un cabinet
comptable. Nommer un cas d'usage — la réservation en ligne, les avis clients —
écarte la majorité des visiteurs dès la page de résultats. L'angle sectoriel
vit dans le corps de la page, jamais dans le title ni dans le H1.

**Ne pas vendre les conditions normales du métier.** « Accès à votre nom »,
« vous restez propriétaire », « pas un thème acheté », « aucune revente de vos
données » : personne ne choisit une agence parce qu'elle lui laisse ses mots de
passe ou qu'elle respecte le RGPD. Ces mentions sont des livrables, pas des
arguments.

---

## 3. Ce qu'une phrase doit contenir

La règle du client, mot pour mot : **chaque phrase porte une promesse, un
changement ou un bénéfice.** Une phrase qui ne fait aucun des trois est un
remplissage, quelle que soit son élégance.

Test applicable à n'importe quelle phrase du site : si on peut la déplacer sur
le site d'un concurrent sans la modifier, elle ne dit rien. On la réécrit ou on
la supprime.

---

## 4. Les contraintes de format

| Élément | Contrainte |
|---|---|
| Balise title | 60 caractères maximum, contient la requête cible, second segment porteur d'un bénéfice ou d'une requête secondaire — jamais un slogan, jamais le nom de l'agence seul |
| Méta-description | 138 à 158 caractères, annonce ce que le lecteur obtient |
| H1 | 75 caractères maximum, contient la requête cible de la page |
| H2 | Lisible seul, fait avancer l'argument. « Trois guides sur le sujet. » ne qualifie pas |
| Réponse de FAQ | Répond à la question posée dès la première phrase |

---

## 5. La typographie française

Apostrophe typographique `’`, jamais l'apostrophe droite. Espace fine
insécable devant `?` `!` `;` et à l'intérieur des guillemets français. Espace
insécable devant `:`. Guillemets français `« »` pour les citations.

Ces règles sont appliquées automatiquement par `build/typographie.py`, qui
refuse de rendre la main s'il reste une occurrence fautive.

---

## 6. Comment se fait le contrôle

Un texte proposé est relu contre les sections 1 à 4. Il est refusé dès la
première infraction, avec la citation exacte et le numéro de règle. Le refus
n'est pas négociable : le texte revient corrigé.

Deux scripts portent une partie du contrôle et refusent de produire leur
charge utile en cas d'infraction :

- `build/metas_site.py` — longueurs, vocabulaire proscrit, description qui
  recopie son titre, deux pages partageant le même segment de titre
- `build/typographie.py` — apostrophes et espaces insécables

Le reste est de la relecture humaine, et elle ne se délègue pas à un outil.

---

## 7. Les règles de métier, d'après Lucie Rondelet

*« Le guide du rédacteur web SEO freelance », chapitres 4, 5 et 7.*

La section 1 dit ce qu'on refuse. Celle-ci dit comment on écrit. La différence
compte : on peut éviter tous les tics de l'IA et produire un texte illisible.

### La longueur de phrase : 23 mots

Le seuil n'est pas esthétique, il est physiologique. Le lecteur d'écran est mal
assis, éclairé par une lumière bleue, interrompu par ses notifications, souvent
debout dans un transport. Une phrase de 40 mots lui demande un effort qu'il ne
fournira pas : il revient en arrière, ou il part.

Le livre en fait la démonstration en coupant une dépêche de 43 mots en deux
phrases de 23, sans rien perdre. C'est presque toujours possible.

`build/redaction_controle.py` mesure chaque phrase du site. Au-delà de 30 mots,
la phrase est à couper ; entre 24 et 30, elle est à relire.

### La voix active

« La bombe atomique a touché Nagasaki » plutôt que « Nagasaki a été touchée par
la bombe atomique ». Le passif éloigne l'acteur de son action et ajoute des
mots. Il reste légitime quand l'acteur n'a pas d'importance — « le devis
détaille ce qui est inclus » — mais c'est l'exception, pas le réglage par
défaut.

### Le mot le plus précis disponible

Le livre distingue l'hyperonyme du terme spécifique : dès qu'un mot plus précis
existe, on l'emploie. « Berline » plutôt que « voiture ». Un mot générique ne
permet pas au lecteur de se représenter la chose ; il l'oublie aussitôt.

Le test du livre, applicable en dix secondes : si un mot compte beaucoup de
synonymes, il est trop vague. « Avoir » en a soixante-dix, « détenir » vingt et
un. Le second dit quelque chose.

Sont proscrits les mots sans signification propre — « truc », « machin », « des
choses », « certains éléments », « divers aspects », « un certain nombre de ».

### Les expressions toutes faites

Le livre en donne la liste : « pour petits et grands », « qui a su se
démarquer », « ravira toute la famille », « notre objectif est de vous
satisfaire », « la qualité est notre priorité ». S'y ajoutent celles de notre
secteur : « à votre écoute », « au service de votre réussite », « fort de notre
expérience », « à la pointe de », « acteur incontournable », « équipe de
passionnés ».

Elles n'apportent aucune information. Elles se déplacent d'un site à l'autre
sans être modifiées — c'est exactement le test de la section 3.

### Les formules de doute

« Il est possible que », « il se pourrait », « il semblerait », « peut-être
que », « en quelque sorte ». Le rédacteur transmet son hésitation au lecteur.
La bonne réponse au doute n'est pas de l'écrire, c'est de vérifier sa source.

### Les temps

Le présent domine. L'impératif pour les appels à l'action — c'est sa fonction.
Le passé composé et l'imparfait pour raconter. **Le passé simple et le
subjonctif passé sont écartés** : « bien qu'elles fussent fraîchement
diplômées, nous préférâmes » n'a pas sa place sur un écran.

### L'introduction, écrite en dernier

Le lecteur lit l'introduction en diagonale, puis balaie les sous-titres avant
de décider. L'introduction doit donc : aller droit au but, montrer qu'on a
compris son problème, annoncer ce qu'il obtient. Pas de préambule.

Et elle se rédige **après** le reste : on ne peut pas annoncer proprement un
texte qu'on n'a pas encore écrit.

### La pyramide inversée

L'essentiel d'abord, le détail ensuite, le contexte en dernier. C'est l'inverse
de la dissertation scolaire, et c'est la seule structure qui survit à une
lecture interrompue.

### Le vocabulaire du client

Le livre insiste sur un point que nous avons déjà appris à nos dépens : le
vocabulaire d'une agence n'est pas celui de son client. Un dirigeant de PME ne
dit pas « leads qualifiés », ni « acquisition organique », ni « CRO ». Il dit
des appels, des devis, des clients. On écrit dans ses mots, pas dans les
nôtres.

### Ce que le contrôle a donné

Premier passage sur les 1 802 phrases des gabarits : zéro expression toute
faite, zéro formule de doute, zéro pantonyme, zéro temps lourd. Cinq phrases
dépassaient 30 mots — trois sur des pages publiées, corrigées ; les deux autres
sont dans un gabarit orphelin. Soixante-neuf phrases restent entre 24 et 30
mots : à relire au fil des prochaines passes, sans urgence.

Le corpus passe donc le test du livre. C'était à vérifier plutôt qu'à supposer.
