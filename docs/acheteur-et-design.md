# L'acheteur réel, et ce qu'il impose au design

Ce document répond à quatre questions — fond, couleur, rythme, images — en
partant de qui achète. Pas de nos goûts, pas des thèmes à la mode.

La source n'est pas une persona inventée. Ce sont les quatre pages métiers du
site, qui décrivent chacune un acheteur, son problème et ses objections :
`page.site-vitrine-artisan.json`, `page.site-vitrine-restaurant.json`,
`page.site-vitrine-freelance.json`, `page.site-vitrine-pme-tpe.json`.

---

## 1. Qui achète

| | Son problème, tel que la page l'énonce | Ce qu'il demande avant de signer |
|---|---|---|
| **Artisan, BTP** | « Le problème d'un artisan visible n'est pas le nombre d'appels, c'est leur qualité : hors zone, hors métier, hors budget. » | Je n'ai pas le temps de m'occuper d'un site · Faut-il afficher mes prix · Est-ce que ça remplace les plateformes de mise en relation |
| **Restaurant, CHR** | « Les plateformes vous apportent du volume et prélèvent leur part sur chaque couvert. » | Dois-je quitter les plateformes · Puis-je changer le menu moi-même · Faites-vous les photos |
| **Indépendant** | « Quand vous êtes seul face au client, votre site vend une personne en qui on peut avoir confiance avant de l'avoir rencontrée. » | Ai-je vraiment besoin d'un site si j'ai LinkedIn · Combien ça coûte · Puis-je le faire évoluer |
| **PME, TPE** | « Dans une vente à cycle long, le site prépare, rassure et fait circuler l'information entre plusieurs interlocuteurs. » | Combien de temps mes équipes devront-elles y consacrer · Peut-on démarrer par une seule page · Que devient notre référencement existant |

**Quatre traits communs, et ils commandent tout ce qui suit.**

**Il s'est déjà fait avoir, ou il le craint.** Les plateformes de mise en
relation, la commission sur chaque couvert, le site qu'on lui a livré et qu'il
n'a jamais pu modifier. Sa question n'est pas « est-ce beau », c'est « est-ce
que je vais encore me faire prendre ».

**Il compte son temps avant son argent.** « Je n'ai pas le temps de m'occuper
d'un site », « combien de temps mes équipes devront-elles y consacrer »,
« puis-je changer le menu moi-même ». Trois objections sur quatre portent sur
la charge, pas sur le prix.

**Il demande le prix tôt.** Et le site ne lui répond nulle part avant la page
de contact.

**Aucun des quatre n'est technophile.** Sur douze questions posées dans ces
FAQ, **zéro** ne porte sur la technologie, la performance ou l'outil. Ce fait
seul règle la question du langage visuel.

---

## 2. Le fond : clair, et pour une raison plus forte que le rythme

J'avais tranché pour le fond clair dans `direction-artistique-v2.md`, au motif
que l'alternance clair/sombre donne du rythme. L'argument était juste mais
secondaire. Le vrai est celui-ci :

**Le fond sombre est un code de l'industrie du logiciel.** Vercel, Linear,
Framer, et les deux thèmes fournis en référence. Il signale « produit tech,
acheteur technophile ». Un couvreur, un restaurateur ou un dirigeant de PME de
quinze personnes n'appartient pas à cette tribu, et un code visuel qui ne
s'adresse pas à vous produit un effet précis : vous concluez que le service
n'est pas pour vous. C'est exactement la faute que nous avons corrigée dans les
balises — restreindre le marché — commise cette fois par le design.

S'y ajoute un argument matériel que personne n'aime énoncer : cet acheteur a
souvent entre 40 et 60 ans, et l'artisan lit sur son téléphone, dehors, en
plein soleil. Un texte clair sur fond sombre perd en lisibilité dans les deux
cas.

**Décision : fond clair dominant.** Le sombre reste, mais comme surface
choisie — le hero, la preuve, le pied de page. Trois zones par page, pas
quinze.

---

## 3. La couleur : on garde le vert, on change son rôle

Le `#d6fb51` actuel est un vert acide. Sur fond sombre, il produit exactement
l'univers Vercel — c'était le projet du thème Signal, et c'est ce projet-là
qui ne correspond pas à l'acheteur.

Faut-il le jeter ? Non, et pour une raison qui vaut plus que le confort : c'est
la seule chose visuellement identifiable que possède l'agence. Un vert acide
s'imprime dans la mémoire d'un dirigeant qui compare cinq devis. Le remplacer
par un bleu de confiance ou un vert sapin, c'est devenir la sixième agence
interchangeable.

**Ce qui change, c'est sa quantité et sa fonction.**

| | Aujourd'hui | Décision |
|---|---|---|
| Surface | Fond de sections entières, aplats larges | Petites surfaces : remplissage de bouton, soulignement, pastille, trait de séparation |
| Texte | Le vert est du texte sur fond sombre | Sur fond clair, le vert ne porte **jamais** de texte. Sur un bouton vert, le texte est encré, pas blanc |
| Second accent | `--color-ember` orange coexiste | Supprimé. Deux accents valent moins qu'un |

Le vert acide en petite quantité sur une page claire se lit comme une signature.
Le même vert en aplats sur fond noir se lit comme une startup. Même couleur,
deux messages — c'est la dose qui décide, pas la teinte.

---

## 4. Le rythme : large entre les sections, serré à l'intérieur

Le réflexe serait de doubler les espaces partout. C'est une erreur pour cet
acheteur, et voici pourquoi.

**Un site trop aéré signale « agence chère ».** Beaucoup de blanc, peu de mots,
de grandes photos : c'est le code des agences qui facturent 30 000 €. Le
dirigeant qui hésite entre nous et un indépendant à 3 500 € y lit un prix, et
il part avant d'avoir demandé.

**Un site trop dense signale « amateur ».** C'est le défaut actuel : rythme
plafonné à 80 px, tout se ressemble, on se perd — le mot est du client.

**Le point juste tient en une phrase :** on respire entre les sections pour
qu'il puisse **repérer**, on reste dense à l'intérieur pour qu'il puisse
**comparer**. Cet acheteur balaie d'abord, puis lit sérieusement la seule
section qui l'intéresse. Il lui faut des frontières nettes et du contenu plein
derrière chaque frontière.

Concrètement : `--section-y` à 120 px entre sections (contre 80 aujourd'hui),
mais l'interligne et l'espacement interne des blocs restent serrés. Et
l'alternance clair / très clair / sombre fait la moitié du travail de
séparation, gratuitement.

---

## 5. Les images : oui, mais trois familles seulement

C'est la question la plus difficile, parce que l'agence n'a ni photo d'équipe,
ni bureau photogénique, ni capture de produit. Elle vend un service.

**Un site sans aucune image est un mauvais calcul ici.** Cet acheteur a été
déçu ; il veut voir que quelqu'un comme lui a obtenu quelque chose. La
typographie seule convainc un lecteur de Linear, pas un patron de PME qui
compare des devis.

Ce que l'agence possède réellement : **6 logos clients, 7 vignettes de projets
livrés, 2 cas chiffrés documentés.** C'est peu, et c'est suffisant si on
l'emploie bien.

**Les trois familles admises :**

1. **Les sites livrés, en capture.** C'est l'image la plus persuasive dont
   dispose une agence web, et la seule qui prouve l'existence. Les 7 vignettes
   existent — elles sont aujourd'hui en dernière position de l'accueil, après le
   bloc de conversion, et **elles ne sont pas cliquables** : aucun `link` n'est
   renseigné. Un visiteur lit « Sept projets livrés, et toujours en ligne », il
   essaie d'en ouvrir un, rien ne se passe. L'affirmation devient un démenti.

2. **Les logos clients.** Six, déjà en place sur l'accueil. Ils doivent
   apparaître aussi sur les pages de trafic froid, qui n'en portent aucun.

3. **L'avant / après.** L'agence l'écrit elle-même sur la page artisan :
   « Nous vous disons quoi photographier avec votre téléphone. L'avant-après
   vaut tous les arguments. » Elle prêche une méthode qu'elle n'applique pas à
   son propre site. Une capture avant / après d'un site refondu, sur les deux
   cas documentés, vaut plus que n'importe quelle illustration.

**Interdit, et sans exception :** la photo de banque d'images. Personnes en
costume autour d'un ordinateur, poignée de main, équipe qui rit devant un
tableau blanc. Cet acheteur les identifie en une seconde — il en a vu des
centaines sur les sites de ses concurrents — et elles retirent plus de
confiance qu'elles n'en ajoutent. Interdit aussi : l'illustration abstraite,
la 3D décorative, et la fausse capture de tableau de bord, puisque nous ne
vendons pas de logiciel.

---

## 6. Ce que je corrige dans ma propre direction v2

Je m'étais appuyé sur les deux thèmes fournis pour trancher le fond clair. La
conclusion tient, la justification était faible. Deux points que je révise :

**Le hero en carte sombre à grand rayon** venait de Saazy, et Saazy y place une
capture de logiciel. Sans capture, une grande carte sombre vide sur fond clair
est une décoration. Elle ne se justifie que si elle porte quelque chose : le
titre, et les deux chiffres nommés de Maison Ayla et Noza & Co. Si elle n'a que
du texte, une simple zone sombre pleine largeur fait le même travail sans faire
« gabarit ».

**Les grands rayons à 40 px** sont un code SaaS de plus. Je les ramène à 24 px
sur les grandes surfaces. Assez pour paraître calme, pas assez pour paraître
emprunté.

---

## 7. Le tableau de décisions

| Question | Décision | Raison, en une phrase |
|---|---|---|
| Fond | Clair dominant, `#f7f8f4` | Le fond sombre est un code de l'industrie du logiciel et cet acheteur n'en fait pas partie |
| Zones sombres | Trois par page maximum : hero, preuve, pied de page | Elles séparent et hiérarchisent ; multipliées, elles ne séparent plus rien |
| Accent | `#d6fb51` conservé, en petite quantité, jamais en texte sur clair | C'est la seule signature mémorable de l'agence ; c'est la dose qui la sauve du code startup |
| Second accent | Supprimé | Deux accents valent moins qu'un |
| Rythme | 120 px entre sections, densité conservée à l'intérieur | Il balaie pour repérer, puis lit pour comparer : il lui faut des frontières et du contenu plein |
| Images | Captures de sites livrés, logos clients, avant/après | Ce sont les seuls visuels que l'agence possède, et les seuls qui prouvent l'existence |
| Banque d'images | Interdite | Il les reconnaît et elles coûtent plus de confiance qu'elles n'en apportent |
| Rayons | 24 px sur les grandes surfaces, pas 40 | Au-delà, c'est un code emprunté au SaaS |

---

## 8. La conséquence qui dépasse le design

Trois des quatre objections de cet acheteur portent sur la **charge** — son
temps, celui de ses équipes, sa capacité à modifier lui-même. Le site n'y
répond aujourd'hui qu'en FAQ, en bas de page.

Quant au prix, j'avais d'abord écrit qu'il n'était traité nulle part sur les
pages de trafic froid. Vérification faite, c'est faux, et la réalité est plus
gênante.

Sur les six pages « création de site + ville », le mot « prix » n'apparaît
qu'en **libellé du lien** vers l'article « Prix d'un site vitrine en 2026 »
— Lille, Nantes, Nice, Strasbourg. Marseille y ajoute une mention qui parle du
tarif de déplacement **du client**, pas du nôtre.

Et Lyon fait exactement l'inverse de ce qu'on attendrait. Elle consacre un bloc
entier — « Des ordres de prix affichés » — et une question de FAQ — « Afficher
ses prix ne fait-il pas fuir ? » — à convaincre le visiteur d'annoncer **ses**
tarifs, avec cette réponse : « Cela fait fuir ceux qui ne seraient jamais
devenus clients, et c'est un gain de temps. »

Nous conseillons donc à l'artisan d'afficher ses prix, et nous n'affichons pas
les nôtres. Un dirigeant qui lit cette page et repart sans avoir vu un ordre
de grandeur remarque la contradiction, même s'il ne la formule pas. Il lit
580 mots, puis un formulaire lui demande *son* budget : on lui réclame son
chiffre avant de lui donner le nôtre.

Aucun choix de couleur ne rattrapera cela.
