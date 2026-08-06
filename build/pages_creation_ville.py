#!/usr/bin/env python3
"""
Génère les gabarits « création de site internet + ville ».

Ces requêtes sont commerciales, mesurées entre 390 et 590 recherches
mensuelles, et nettement moins disputées que leurs équivalents SEO :
KD 13 à 23 contre 13 à 29 (Semrush base fr, 6 août 2026). Aucune page du
site ne les visait.

Le piège de ce type de page est la duplication : six pages identiques avec
le nom de la ville permuté ne se positionnent pas. Deux garde-fous ici.

D'abord, chaque ville a son propre angle, tiré de son tissu économique.
Ensuite, cet angle porte sur ce que le SITE doit faire — crédibilité,
objections locales, parcours de contact — là où les pages « agence SEO +
ville » portent sur la visibilité. Deux intentions distinctes, deux pages
qui ne se concurrencent pas.

Le script refuse d'écrire si deux villes partagent une phrase.
"""
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"

VILLES = {
    "strasbourg": {
        "ville": "Strasbourg",
        "requete": "creation site internet strasbourg",
        "volume": 390, "kd": 13,
        "seo_page": "/pages/agence-seo-strasbourg",
        "h1": "Création de site internet à Strasbourg, pour deux publics à la fois",
        "lead": "Beaucoup d'entreprises strasbourgeoises travaillent des deux côtés du Rhin sans que leur site le dise. Un prospect allemand qui arrive sur une page uniquement française referme l'onglet, même quand l'entreprise le sert très bien au téléphone.",
        "eyebrow": "Création de site — Strasbourg",
        "stats": [
            ("Frontalier", "un bassin de vie partagé",
             "Kehl est à quinze minutes. Beaucoup de clients potentiels raisonnent en euros mais lisent en allemand."),
            ("Institutions", "un tissu B2B particulier",
             "Parlement, agences, cabinets : un public qui juge le sérieux d'une structure sur son site avant tout contact."),
            ("Artisanat", "une tradition installée",
             "Des métiers où la réputation existe déjà localement, mais reste invisible pour qui arrive de l'extérieur."),
        ],
        "analyse_titre": "Traduire son site ne suffit pas, encore faut-il traduire ses preuves.",
        "analyse_texte": "<p>La version allemande d'un site strasbourgeois s'arrête souvent aux pages de présentation. Les mentions légales, les conditions, les témoignages et le formulaire restent en français — c'est-à-dire précisément ce que lit un prospect au moment de s'engager.</p><p>Nous traitons donc la seconde langue comme un parcours complet, pas comme une page d'accueil traduite.</p>",
        "points": [
            ("Un parcours entier", "De la première page au message envoyé, sans retour au français au moment de décider."),
            ("Les mentions qui rassurent", "Statut, TVA, conditions : ce qu'un client d'outre-Rhin vérifie avant d'appeler."),
            ("Vérifier avant de tout traduire", "Sur certains métiers la demande allemande est nulle. On mesure d'abord, on traduit ensuite."),
        ],
        "faq": [
            ("Faut-il vraiment un site en allemand à Strasbourg ?",
             "<p>Cela dépend entièrement de votre métier, et cela se mesure. Sur l'hôtellerie, la santé ou les services aux entreprises, la demande germanophone est réelle. Sur beaucoup d'activités de proximité, elle est marginale — et traduire coûterait plus qu'elle ne rapporte.</p>"),
            ("Une traduction automatique peut-elle suffire pour démarrer ?",
             "<p>Non, et c'est contre-productif sur ce marché précis. Un public habitué à la langue repère immédiatement une traduction machine, et en tire une conclusion sur le sérieux de l'entreprise. Mieux vaut trois pages traduites correctement que trente approximatives.</p>"),
        ],
        "cta_titre": "Regardons si votre site parle à vos clients d'outre-Rhin.",
        "cta_texte": "Dites-nous votre métier et votre zone réelle. Nous estimons la part de demande germanophone avant de vous proposer quoi que ce soit.",
    },
    "marseille": {
        "ville": "Marseille",
        "requete": "creation site internet marseille",
        "volume": 480, "kd": 17,
        "seo_page": "/pages/agence-seo-marseille",
        "h1": "Création de site internet à Marseille, quartier par quartier",
        "lead": "À Marseille, la première question d'un client n'est pas ce que vous faites, mais si vous vous déplacez chez lui. Un site qui ne nomme pas ses zones d'intervention laisse cette question sans réponse, et le prospect appelle le suivant.",
        "eyebrow": "Création de site — Marseille",
        "stats": [
            ("Étendue", "une ville de villages",
             "Du 8e au 15e, les distances et les habitudes changent. Un client du sud ne suppose pas qu'on monte au nord."),
            ("Indépendants", "un tissu très dense",
             "Beaucoup de petites structures dont le bouche-à-oreille est solide mais la présence en ligne inexistante."),
            ("Port", "une économie tournée vers l'extérieur",
             "Logistique, import, maritime : un B2B qui cherche des compétences précises, pas des prestataires génériques."),
        ],
        "analyse_titre": "La question qu'on vous pose au téléphone doit déjà être réglée sur le site.",
        "analyse_texte": "<p>« Vous intervenez dans le 11e ? » Cette question revient à chaque appel, ce qui veut dire qu'elle a fait renoncer tous ceux qui n'ont pas appelé. Elle se règle avec une liste de quartiers visible, pas avec une carte décorative.</p><p>Nous construisons donc le site autour de la zone réellement servie, en l'écrivant noir sur blanc plutôt qu'en la suggérant.</p>",
        "points": [
            ("Les zones écrites en clair", "Les arrondissements et communes servis, nommés, pas déduits d'une carte."),
            ("Les délais assumés", "Combien de temps pour venir, à quel tarif de déplacement. Le silence coûte des appels."),
            ("Des preuves situées", "Un chantier daté et localisé rassure plus que dix témoignages anonymes."),
        ],
        "faq": [
            ("Faut-il une page par arrondissement ?",
             "<p>Rarement au démarrage. Une page qui liste clairement les zones servies règle l'essentiel. Les pages par quartier ne se justifient que si vous y avez de vraies références à montrer — sinon elles se ressemblent toutes et aucune ne se positionne.</p>"),
            ("Mon activité marche au bouche-à-oreille, à quoi sert un site ?",
             "<p>À convertir ce bouche-à-oreille. Aujourd'hui, la personne à qui l'on vous a recommandé cherche votre nom avant d'appeler. Ce qu'elle trouve — ou ne trouve pas — décide si la recommandation aboutit.</p>"),
        ],
        "cta_titre": "Voyons ce que trouve un Marseillais à qui l'on vous a recommandé.",
        "cta_texte": "Donnez-nous votre métier et vos secteurs. Nous regardons ce qui apparaît à votre nom et ce qui manque pour déclencher l'appel.",
    },
    "lille": {
        "ville": "Lille",
        "requete": "creation site internet lille",
        "volume": 590, "kd": 18,
        "seo_page": "/pages/agence-seo-lille",
        "h1": "Création de site internet à Lille, sans perdre la clientèle belge",
        "lead": "La frontière est à vingt minutes et une partie réelle de la demande vient de Belgique. Un site qui raisonne en réflexes strictement français perd ces prospects sur des détails — un numéro non international, une TVA qui n'est pas la leur, un vocabulaire qui n'est pas le même.",
        "eyebrow": "Création de site — Lille",
        "stats": [
            ("Transfrontalier", "une clientèle qui traverse",
             "Tournai, Mouscron, Courtrai : des prospects à moins d'une heure que la plupart des sites lillois ignorent."),
            ("Étudiants", "un renouvellement permanent",
             "Une population nombreuse qui arrive sans réseau et cherche tout en ligne, chaque rentrée."),
            ("Distribution", "des sièges et des centrales",
             "Un B2B structuré dont les acheteurs vérifient systématiquement un fournisseur avant de le consulter."),
        ],
        "analyse_titre": "Les détails qui font renoncer un prospect belge tiennent en trois lignes.",
        "analyse_texte": "<p>Un numéro écrit sans indicatif international, une adresse sans pays, des conditions qui ne mentionnent que la TVA française : chacun de ces détails est un petit doute. Mis bout à bout, ils suffisent à faire préférer un concurrent qui, lui, a levé l'ambiguïté.</p><p>Ce sont des corrections de quelques minutes, à condition d'y avoir pensé à la conception.</p>",
        "points": [
            ("Un numéro appelable de partout", "Écrit au format international, cliquable sur mobile. Le plus simple des correctifs."),
            ("Le pays dans l'adresse", "Une évidence côté français, une information manquante vue de Belgique."),
            ("Le vocabulaire vérifié", "Certains termes métier diffèrent d'un pays à l'autre : le site doit employer les deux."),
        ],
        "faq": [
            ("La clientèle belge vaut-elle l'effort ?",
             "<p>Sur beaucoup de métiers lillois, oui : le bassin est proche, solvable, et la concurrence y pense rarement. Cela dit, si votre activité impose un déplacement long ou une contrainte réglementaire, la question mérite d'être tranchée avant d'investir.</p>"),
            ("Faut-il un site distinct pour la Belgique ?",
             "<p>Presque jamais. Un site unique qui lève les ambiguïtés — indicatif, pays, conditions, zones — suffit dans l'immense majorité des cas. Deux sites doublent le travail et divisent la visibilité.</p>"),
        ],
        "cta_titre": "Regardons ce qui bloque un prospect belge sur votre site.",
        "cta_texte": "Nous relisons votre site avec l'œil d'un client venu de l'autre côté de la frontière et listons ce qui l'empêche de vous contacter.",
    },
    "lyon": {
        "ville": "Lyon",
        "requete": "creation site internet lyon",
        "volume": 480, "kd": 18,
        "seo_page": "/pages/consultant-seo-lyon",
        "h1": "Création de site internet à Lyon, sur un marché où tout le monde en a un",
        "lead": "À Lyon, vos concurrents ont déjà un site correct. La question n'est donc plus d'en avoir un, mais de dire quelque chose que les autres ne disent pas — et c'est précisément là que la plupart des sites lyonnais se ressemblent.",
        "eyebrow": "Création de site — Lyon",
        "stats": [
            ("Densité", "beaucoup de prestataires",
             "Sur la plupart des métiers, le prospect compare trois à cinq sites avant de contacter quelqu'un."),
            ("Santé et chimie", "des filières installées",
             "Un B2B technique où l'approximation se repère immédiatement et disqualifie."),
            ("Deuxième pôle", "des sièges et des cadres",
             "Un public habitué à des standards nationaux, peu indulgent avec un site daté."),
        ],
        "analyse_titre": "Quand tous les sites se valent, c'est le contenu qui départage.",
        "analyse_texte": "<p>Sur un marché saturé, l'esthétique cesse d'être un avantage : tout le monde a fait l'effort. Ce qui reste rare, c'est un site qui annonce ses tarifs, décrit un cas en détail, et dit ce qu'il ne fait pas.</p><p>C'est inconfortable à écrire, et c'est exactement pour cela que peu de concurrents le font.</p>",
        "points": [
            ("Des ordres de prix affichés", "Une fourchette honnête filtre les curieux et rassure ceux qui sont sérieux."),
            ("Un cas raconté en entier", "Contexte, contraintes, résultat, limites. Bien plus convaincant qu'une galerie."),
            ("Ce que vous ne faites pas", "Annoncer ses limites est le signal de sérieux le plus rare et le moins coûteux."),
        ],
        "faq": [
            ("Afficher ses prix ne fait-il pas fuir ?",
             "<p>Cela fait fuir ceux qui ne seraient jamais devenus clients, et c'est un gain de temps. Ceux qui restent arrivent avec un budget en tête et une conversation nettement plus avancée. Une fourchette suffit, il n'est pas nécessaire d'aller au détail.</p>"),
            ("Comment se différencier quand on fait la même chose que les autres ?",
             "<p>Par la façon dont vous travaillez plutôt que par ce que vous vendez. Le déroulé, les délais, l'interlocuteur, ce qui se passe après la livraison : ces éléments varient énormément d'un prestataire à l'autre, et presque personne ne les explique.</p>"),
        ],
        "cta_titre": "Comparons votre site à ceux de vos trois concurrents lyonnais.",
        "cta_texte": "Nous regardons ce qu'ils disent, ce que vous dites, et où se trouve l'écart que vous pouvez creuser sans refaire votre offre.",
    },
    "nice": {
        "ville": "Nice",
        "requete": "creation site internet nice",
        "volume": 480, "kd": 21,
        "seo_page": "/pages/agence-seo-nice",
        "h1": "Création de site internet à Nice, pour des clients qui réservent de loin",
        "lead": "Une partie de votre clientèle décide avant d'arriver sur la Côte d'Azur, parfois depuis un autre pays. Elle ne peut ni passer vous voir ni vous croiser : le site est le seul élément sur lequel elle vous juge.",
        "eyebrow": "Création de site — Nice",
        "stats": [
            ("Saison", "des écarts très marqués",
             "Une activité qui double puis retombe impose un site utile toute l'année, pas seulement l'été."),
            ("Résidents secondaires", "une clientèle à distance",
             "Des clients qui organisent tout avant de venir et ne rencontrent personne au préalable."),
            ("Haut de gamme", "des attentes élevées",
             "Sur l'immobilier et les services premium, un site approximatif élimine avant le premier échange."),
        ],
        "analyse_titre": "Un client qui réserve à distance a besoin de tout savoir avant d'écrire.",
        "analyse_texte": "<p>Sur place, une question se pose au téléphone. À distance, elle reste sans réponse et le prospect passe au concurrent qui, lui, a tout expliqué : ce qui est compris, les délais, les modalités de paiement, ce qui se passe s'il annule.</p><p>Un site pensé pour cette clientèle est plus explicite que la moyenne, et c'est ce qui le fait convertir.</p>",
        "points": [
            ("Tout dire avant la question", "Périmètre, délais, paiement, annulation : chaque zone d'ombre coûte un contact."),
            ("Une réservation sans friction", "Un formulaire ou un créneau, pas un numéro qu'il faudra appeler depuis l'étranger."),
            ("Une preuve datée", "Des réalisations récentes valent mieux qu'une galerie sans repère de temps."),
        ],
        "faq": [
            ("Mon activité est saisonnière, le site sert-il hors saison ?",
             "<p>C'est même sa principale utilité : la haute saison se prépare des mois à l'avance. Les recherches et les réservations arrivent bien avant l'été, et un site actif toute l'année capte cette anticipation.</p>"),
            ("Faut-il une version anglaise ?",
             "<p>Cela se vérifie plutôt que cela ne se suppose. Sur l'hébergement, la conciergerie ou l'immobilier de prestige, la demande anglophone est réelle. Sur beaucoup de services de proximité, elle est négligeable — et trois pages bien traduites suffisent souvent.</p>"),
        ],
        "cta_titre": "Regardons votre site avec l'œil d'un client qui ne peut pas passer.",
        "cta_texte": "Nous listons les questions qu'il se pose et auxquelles votre site ne répond pas encore, dans l'ordre où elles le font renoncer.",
    },
    "nantes": {
        "ville": "Nantes",
        "requete": "creation site internet nantes",
        "volume": 590, "kd": 23,
        "seo_page": "/pages/agence-seo-nantes",
        "h1": "Création de site internet à Nantes, pour des clients qui ne vous connaissent pas",
        "lead": "Nantes accueille chaque année des milliers de nouveaux habitants et de nouvelles entreprises. Ces clients n'ont ni recommandation ni habitude : ils choisissent sur ce qu'ils lisent, et ils lisent avec attention.",
        "eyebrow": "Création de site — Nantes",
        "stats": [
            ("Croissance", "des arrivées continues",
             "Un flux permanent de personnes qui cherchent tous les services de base sans référence préalable."),
            ("Numérique", "un secteur très présent",
             "Des clients qui savent reconnaître un site bâclé et en tirent une conclusion immédiate."),
            ("Industrie", "naval et aéronautique",
             "Une sous-traitance technique dont les acheteurs vérifient un fournisseur avant de le consulter."),
        ],
        "analyse_titre": "Sans bouche-à-oreille, le site porte seul la confiance.",
        "analyse_texte": "<p>Un client installé depuis vingt ans vous choisit sur recommandation, et votre site n'a qu'à ne pas lui faire peur. Un nouvel arrivant, lui, n'a que le site : il y cherche depuis quand vous existez, qui vous êtes, ce que d'autres en ont pensé.</p><p>Ces trois informations manquent sur la majorité des sites que nous auditons.</p>",
        "points": [
            ("Une ancienneté visible", "Depuis quand vous exercez : l'information la plus simple et la plus rassurante."),
            ("Des visages", "Une photo réelle de l'équipe convainc davantage qu'une page « à propos » abstraite."),
            ("Des avis accessibles", "Visibles sur le site, pas seulement sur une fiche qu'il faudra aller chercher."),
        ],
        "faq": [
            ("Comment inspirer confiance quand on vient de s'installer ?",
             "<p>En étant précis plutôt qu'ancien. Décrire exactement ce que vous faites, montrer les premiers travaux même peu nombreux, afficher un vrai visage et un vrai numéro. La transparence compense l'absence d'historique mieux que n'importe quel argument.</p>"),
            ("Les avis sont-ils indispensables au démarrage ?",
             "<p>Quelques avis authentiques changent beaucoup, et cinq suffisent pour lever le doute initial. L'important est qu'ils soient réels et récents : un client nantais habitué au numérique repère les faux immédiatement.</p>"),
        ],
        "cta_titre": "Voyons ce que comprend un Nantais qui découvre votre entreprise.",
        "cta_texte": "Nous regardons votre site comme quelqu'un qui n'a jamais entendu parler de vous et vous disons ce qui manque pour déclencher le contact.",
    },
}

LECTURES = [
    ("target", "Prix d'un site vitrine en 2026", "Les vraies fourchettes, poste par poste",
     "/blogs/ressources/prix-site-vitrine-2026"),
    ("layers", "Modèle de cahier des charges", "Pour rendre les devis comparables",
     "/blogs/ressources/cahier-des-charges-site-vitrine"),
    ("gauge", "Un site vitrine sans demandes", "Les 7 corrections prioritaires",
     "/blogs/ressources/site-vitrine-pas-de-demandes-2026"),
]


def gabarit(cle, v):
    return {
        "sections": {
            "hero": {"type": "page-hero", "settings": {
                "show_breadcrumb": True,
                "eyebrow": v["eyebrow"],
                "title": v["h1"],
                "lead": v["lead"],
                "cta_primary": "Cadrer mon projet",
                "parent_label": "Création de site vitrine",
                "parent_url": "/pages/creation-site-vitrine",
                "cta_secondary": "Voir la prestation complète",
                "cta_secondary_url": "/pages/creation-site-vitrine",
            }},
            "contexte": {"type": "content-stats", "settings": {
                "surface": "dark",
                "eyebrow": "Le marché local",
                "title": "Ce qui distingue ce marché.",
                "source": "Lecture qualitative du tissu économique local. Les volumes réels sont mesurés pendant le diagnostic.",
            }, "blocks": {
                "s%d" % (i + 1): {"type": "stat", "settings": {
                    "value": a, "label": b, "note": c}}
                for i, (a, b, c) in enumerate(v["stats"])
            }, "block_order": ["s1", "s2", "s3"]},
            "analyse": {"type": "content-split", "settings": {
                "surface": "paper", "reverse": False,
                "eyebrow": "Notre lecture",
                "title": v["analyse_titre"],
                "text": v["analyse_texte"],
            }, "blocks": {
                "b%d" % (i + 1): {"type": "point", "settings": {
                    "title": t, "text": x}}
                for i, (t, x) in enumerate(v["points"])
            }, "block_order": ["b1", "b2", "b3"]},
            "deroule": {"type": "content-steps", "settings": {
                "surface": "paper",
                "eyebrow": "Déroulé",
                "title": "Comment se passe un projet, concrètement.",
                "text": "",
            }, "blocks": {
                "s1": {"type": "step", "settings": {
                    "title": "Cadrage",
                    "text": "Vos objectifs, vos clients, ce que le site doit produire. Une heure d'échange, pas un questionnaire.",
                    "duration": "Semaine 1"}},
                "s2": {"type": "step", "settings": {
                    "title": "Structure et contenus",
                    "text": "L'arborescence, les textes, les preuves. Le poste qui décide du résultat, et le plus souvent sous-estimé.",
                    "duration": "Semaines 2-3"}},
                "s3": {"type": "step", "settings": {
                    "title": "Conception et intégration",
                    "text": "Maquettes puis intégration, avec deux tours de corrections prévus au contrat.",
                    "duration": "Semaines 3-5"}},
                "s4": {"type": "step", "settings": {
                    "title": "Mise en ligne et transfert",
                    "text": "Mesure installée, référencement de base posé, et tous les accès à votre nom.",
                    "duration": "Semaine 6"}},
            }, "block_order": ["s1", "s2", "s3", "s4"]},
            "faq": {"type": "content-faq", "settings": {
                "surface": "dark",
                "eyebrow": "Questions fréquentes",
                "title": "Ce qu'on nous demande sur ce marché.",
                "text": "",
                "cta_label": "Poser une autre question",
                "open_first": True, "single_open": False, "emit_schema": True,
            }, "blocks": {
                "q%d" % (i + 1): {"type": "qa", "settings": {
                    "question": q, "answer": r}}
                for i, (q, r) in enumerate(v["faq"])
            }, "block_order": ["q1", "q2"]},
            "lectures": {"type": "content-grid", "settings": {
                "surface": "paper", "density": "dense",
                "eyebrow": "Pour aller plus loin",
                "title": "Trois guides avant de lancer un projet.",
                "text": "",
            }, "blocks": {
                "g%d" % (i + 1): {"type": "item", "settings": {
                    "icon": ic, "title": t, "text": x,
                    "link": u, "link_label": "Lire le guide"}}
                for i, (ic, t, x, u) in enumerate(LECTURES)
            }, "block_order": ["g1", "g2", "g3"]},
            "cta": {"type": "content-cta", "settings": {
                "eyebrow": "Étape suivante",
                "title": v["cta_titre"],
                "text": v["cta_texte"],
                "cta_label": "Demander un diagnostic",
                "note": "Réponse sous 48 h",
                "link_label": "Voir le référencement à %s" % v["ville"],
                "link_url": v["seo_page"],
            }, "blocks": {
                "r1": {"type": "point", "settings": {"text": "Sans engagement"}},
                "r2": {"type": "point", "settings": {"text": "Accès à votre nom"}},
            }, "block_order": ["r1", "r2"]},
        },
        "order": ["hero", "contexte", "analyse", "deroule", "faq",
                  "lectures", "cta"],
    }


def phrases(donnees):
    """Toutes les phrases rédigées d'un gabarit, balises retirées."""
    texte = json.dumps(donnees, ensure_ascii=False)
    texte = re.sub(r"<[^>]+>", " ", texte)
    trouvees = set()
    for p in re.split(r"(?<=[.!?])\s+|\\n", texte):
        p = p.strip(' "\\')
        if len(p) > 55:
            trouvees.add(p)
    return trouvees


def main():
    erreurs, produits = [], {}

    for cle, v in VILLES.items():
        d = gabarit(cle, v)

        # Le H1 doit porter la requête, sinon la page ne sert à rien.
        mots = v["requete"].replace("creation", "création").split()
        titre = v["h1"].lower().replace("à ", "").replace("é", "e")
        manquants = [m for m in mots
                     if m.replace("é", "e") not in titre.replace("é", "e")]
        if manquants:
            erreurs.append("%s : « %s » absent du H1"
                           % (cle, " ".join(manquants)))
        produits[cle] = d

    # Deux villes qui partagent une phrase, c'est le duplicate qu'on veut
    # justement éviter sur ce type de page.
    vues = {}
    for cle, d in produits.items():
        for p in phrases(d):
            vues.setdefault(p, []).append(cle)
    partagees = {p: v for p, v in vues.items() if len(v) > 1}
    # Le déroulé projet et les lectures sont volontairement identiques :
    # ce sont des blocs de service, pas du contenu local.
    communes = phrases(gabarit("x", VILLES["lyon"]))
    specifiques = {p: v for p, v in partagees.items()
                   if p not in phrases({"sections": {
                       k: gabarit("x", VILLES["lyon"])["sections"][k]
                       for k in ("deroule", "lectures")}})}
    if specifiques:
        for p, v in sorted(specifiques.items())[:5]:
            erreurs.append("phrase partagée par %s : « %s… »"
                           % (", ".join(v), p[:60]))

    if erreurs:
        print("REFUS — %d problème(s) :" % len(erreurs))
        for e in erreurs:
            print("   ", e)
        return 1

    for cle, d in sorted(produits.items()):
        chemin = GABARITS / ("page.creation-site-%s.json" % cle)
        chemin.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n",
                          encoding="utf-8")
        v = VILLES[cle]
        print("%-38s %s (%d rech./mois, KD %d)"
              % (chemin.name, v["requete"], v["volume"], v["kd"]))

    print("\n%d gabarits écrits, aucune phrase partagée entre deux villes."
          % len(produits))
    return 0


if __name__ == "__main__":
    sys.exit(main())
