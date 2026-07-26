# Relance des paniers abandonnés

## Pourquoi c'est la priorité du mailing

Sur les 30 derniers jours, la France produit 10 ajouts au panier et 4 arrivées au
checkout. Deux paniers abandonnés portent le nom, le prénom et l'adresse de
facturation d'une cliente réelle — Lobna et Yasmine, toutes deux sur l'Abaya Dalya
Noir et Blanc à 29,90 €.

Ce sont des contacts déjà acquis, déjà convaincus, déjà à un clic de payer. Aucun
autre levier n'a ce rendement.

## Ce qui n'est pas faisable par l'API

Shopify ne permet pas de créer ni de configurer une automatisation marketing via
l'Admin API. Les étapes ci-dessous se font dans l'interface, une seule fois.

## Configuration

### 1. Activer la capture des e-mails au checkout

**Paramètres → Paiement → Coordonnées client**

- Choisir **« E-mail »** et non « E-mail ou numéro de téléphone ». Un panier
  abandonné avec un numéro de téléphone n'est pas relançable par e-mail.
- Activer **« Afficher une case à cocher d'acceptation marketing »**, cochée par
  défaut si votre politique le permet.

### 2. Remplacer l'e-mail unique par une séquence

**Marketing → Automatisations → Créer une automatisation → « Panier abandonné »**

L'e-mail natif de Shopify (Paramètres → Notifications) part une seule fois et ne
se mesure pas. L'automatisation Shopify Email est gratuite jusqu'à 10 000 envois
par mois — largement au-dessus de vos volumes — et permet une séquence.

Séquence à construire :

| Envoi | Délai | Objectif |
|---|---|---|
| 1 | 1 heure | Lever l'obstacle technique. Beaucoup d'abandons sont un paiement qui a échoué, pas un renoncement. |
| 2 | 24 heures | Lever le doute sur la taille et le retour. |
| 3 | 72 heures | Dernier rappel, sobre, sans pression. |

Condition de sortie sur les trois : **commande passée**.

---

## E-mail 1 — à 1 heure

**Objet :** Votre panier vous attend chez Maison Ayla
**Préheader :** Il reste une étape, et nous sommes là si quelque chose a bloqué.

> Bonjour {{ customer.first_name }},
>
> Vous avez laissé une pièce dans votre panier. Elle vous attend, nous ne l'avons
> pas remise en rayon.
>
> {{ contenu du panier }}
>
> **[Reprendre ma commande]**
>
> Si le paiement n'a pas abouti, ce n'est pas vous : dites-le-nous simplement en
> répondant à ce message et nous réglons ça avec vous.
>
> Livraison offerte · Expédiée sous 24 à 72 h · Livraison sous 8 à 12 jours ouvrés

---

## E-mail 2 — à 24 heures

**Objet :** Une hésitation sur la taille ?
**Préheader :** Notre grille, et une réponse personnelle si vous préférez.

> Bonjour {{ customer.first_name }},
>
> La taille est la question qu'on nous pose le plus. Nos abayas sont coupées
> amples : dans la grande majorité des cas, votre taille habituelle est la bonne.
>
> Le point qui compte vraiment, c'est la longueur — et elle se choisit d'après
> votre stature.
>
> **[Voir le guide des tailles]** → /pages/guide-des-tailles
>
> Si vous préférez une réponse humaine, répondez à ce message avec votre stature
> et votre tour de poitrine. Nous mesurons la pièce et nous vous répondons.
> Nous préférons vous dire qu'un modèle ne vous ira pas plutôt que de vous
> laisser commander à l'aveugle.
>
> {{ contenu du panier }}
>
> **[Reprendre ma commande]**

---

## E-mail 3 — à 72 heures

**Objet :** On garde votre panier encore un peu
**Préheader :** Sans pression. Un mot sur ce que votre commande rend possible.

> Bonjour {{ customer.first_name }},
>
> Votre panier est toujours là. Si ce n'est pas le bon moment, ce n'est pas grave
> — nous ne vous relancerons plus.
>
> {{ contenu du panier }}
>
> **[Reprendre ma commande]**
>
> Une chose, avant de vous laisser : Maison Ayla reverse une part de ses bénéfices
> à MATW Project, association humanitaire active dans 24 pays. Puits d'eau
> potable, prise en charge d'orphelins, aide d'urgence. Votre commande prolonge un
> travail de terrain mené toute l'année.
>
> Livraison offerte · Retours selon nos conditions

---

## Règles d'écriture appliquées

- **Aucun compte à rebours, aucun stock fictif, aucune fausse urgence.** Vous avez
  500 unités par taille sur la Dalya : écrire « plus que 2 en stock » serait faux
  et sanctionnable.
- **Aucune remise dans les trois e-mails.** Offrir 10 % à la première hésitation
  apprend à vos clientes à abandonner leur panier pour obtenir un code. Gardez la
  remise pour une campagne assumée, pas pour la relance.
- **L'invitation à répondre est réelle.** Sur vos volumes, vous pouvez répondre
  personnellement à chaque message. C'est votre avantage face aux gros acteurs.

## Deux vérifications avant d'activer

1. **Le paiement doit fonctionner.** Relancer vers un checkout cassé transforme un
   contact tiède en cliente définitivement perdue. Faites d'abord la commande test
   en navigation privée.
2. **La formulation des retours.** Vos fiches produits annoncent « Retour gratuit
   — étiquette prépayée, 30 jours ». Vérifiez que c'est bien votre politique
   réelle avant de le répéter dans un e-mail : c'est un engagement contractuel.

## Mesure

**Marketing → Automatisations** donne par e-mail : envois, ouvertures, clics,
commandes attribuées. Le chiffre à suivre est **les commandes attribuées**, pas le
taux d'ouverture. Une séquence de relance bien réglée récupère couramment 5 à 15 %
des paniers abandonnés.

Relancez manuellement Lobna et Yasmine dès aujourd'hui : leurs paniers datent et
l'automatisation ne rattrapera pas les abandons passés.
