#!/usr/bin/env python3
"""
Génère les gabarits des pages service et audit.

Règle absolue : aucune phrase, aucun titre, aucune question de FAQ n'est
réutilisé d'une page à l'autre. Chaque page a aussi son propre enchaînement de
sections — deux pages ne doivent jamais se lire comme la même trame remplie
avec d'autres mots.

Le contenu est écrit ici plutôt que dans 14 fichiers JSON séparés : c'est la
seule façon de garder une vue d'ensemble et de vérifier l'absence de doublon.
"""
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "theme" / "templates"


# --------------------------------------------------------------------------
# Fabriques de sections
# --------------------------------------------------------------------------
def hero(eyebrow, title, lead, cta1, cta2=None, cta2_url=None, parent=None,
         parent_url=None, proofs=None):
    s = {
        "show_breadcrumb": True, "eyebrow": eyebrow, "title": title,
        "lead": lead, "cta_primary": cta1,
    }
    if parent:
        s["parent_label"], s["parent_url"] = parent, parent_url
    if cta2:
        s["cta_secondary"], s["cta_secondary_url"] = cta2, cta2_url
    out = {"type": "page-hero", "settings": s}
    if proofs:
        out["blocks"] = {f"p{i}": {"type": "proof", "settings": {
            "prefix": p[0], "value": p[1], "suffix": p[2], "label": p[3]}}
            for i, p in enumerate(proofs, 1)}
        out["block_order"] = [f"p{i}" for i in range(1, len(proofs) + 1)]
    return out


def split(eyebrow, title, html, points, surface="paper", reverse=False,
          cta=None, cta_url=None):
    s = {"surface": surface, "reverse": reverse, "eyebrow": eyebrow,
         "title": title, "text": html}
    if cta:
        s["cta_label"], s["cta_url"] = cta, cta_url
    return {
        "type": "content-split", "settings": s,
        "blocks": {f"b{i}": {"type": "point", "settings": {"title": p[0], "text": p[1]}}
                   for i, p in enumerate(points, 1)},
        "block_order": [f"b{i}" for i in range(1, len(points) + 1)],
    }


def grid(eyebrow, title, text, items, surface="dark", density="comfortable"):
    return {
        "type": "content-grid",
        "settings": {"surface": surface, "density": density, "eyebrow": eyebrow,
                     "title": title, "text": text},
        "blocks": {f"g{i}": {"type": "item", "settings": dict(
            {"icon": it[0], "title": it[1], "text": it[2]},
            # Un cinquième élément transforme la carte en lien : c'est ce qui
            # permet à une page pivot de distribuer son autorité.
            **({"link": it[3], "link_label": it[4]} if len(it) > 4 else {}))}
            for i, it in enumerate(items, 1)},
        "block_order": [f"g{i}" for i in range(1, len(items) + 1)],
    }


def steps(eyebrow, title, text, items, surface="dark"):
    return {
        "type": "content-steps",
        "settings": {"surface": surface, "eyebrow": eyebrow, "title": title, "text": text},
        "blocks": {f"s{i}": {"type": "step", "settings": {
            "title": it[0], "text": it[1], "duration": it[2]}}
            for i, it in enumerate(items, 1)},
        "block_order": [f"s{i}" for i in range(1, len(items) + 1)],
    }


def compare(eyebrow, title, text, col_a, col_b, rows, verdict, surface="paper"):
    return {
        "type": "content-compare",
        "settings": {"surface": surface, "eyebrow": eyebrow, "title": title,
                     "text": text, "col_criteria": "Critère", "col_a": col_a,
                     "col_b": col_b, "verdict": verdict},
        "blocks": {f"r{i}": {"type": "row", "settings": {
            "criteria": r[0], "value_a": r[1], "value_b": r[2]}}
            for i, r in enumerate(rows, 1)},
        "block_order": [f"r{i}" for i in range(1, len(rows) + 1)],
    }


def stats(eyebrow, title, cells, source="", surface="dark"):
    return {
        "type": "content-stats",
        "settings": {"surface": surface, "eyebrow": eyebrow, "title": title, "source": source},
        "blocks": {f"s{i}": {"type": "stat", "settings": {
            "value": c[0], "label": c[1], "note": c[2]}}
            for i, c in enumerate(cells, 1)},
        "block_order": [f"s{i}" for i in range(1, len(cells) + 1)],
    }


def quote(eyebrow, text, by="", link=None, link_url=None):
    s = {"eyebrow": eyebrow, "quote": text, "attribution": by}
    if link:
        s["link_label"], s["link_url"] = link, link_url
    return {"type": "content-quote", "settings": s}


def faq(title, text, qas, surface="dark", cta="Poser une autre question"):
    return {
        "type": "content-faq",
        "settings": {"surface": surface, "eyebrow": "Questions fréquentes",
                     "title": title, "text": text, "cta_label": cta,
                     "open_first": True, "single_open": False, "emit_schema": True},
        "blocks": {f"q{i}": {"type": "qa", "settings": {
            "question": qa[0], "answer": qa[1]}}
            for i, qa in enumerate(qas, 1)},
        "block_order": [f"q{i}" for i in range(1, len(qas) + 1)],
    }


def cta(eyebrow, title, text, label, note="Réponse sous 48 h",
        link=None, link_url=None, points=()):
    s = {"eyebrow": eyebrow, "title": title, "text": text,
         "cta_label": label, "note": note}
    if link:
        s["link_label"], s["link_url"] = link, link_url
    out = {"type": "content-cta", "settings": s}
    if points:
        out["blocks"] = {f"r{i}": {"type": "point", "settings": {"text": p}}
                         for i, p in enumerate(points, 1)}
        out["block_order"] = [f"r{i}" for i in range(1, len(points) + 1)]
    return out


def write(suffix, ordered):
    """ordered = liste de (clé, section). L'ordre du fichier est l'ordre visuel."""
    tpl = {"sections": {k: v for k, v in ordered}, "order": [k for k, _ in ordered]}
    path = OUT / f"page.{suffix}.json"
    path.write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path.name


PAGES = {}

# ==========================================================================
# 1. CRÉATION DE SITE VITRINE
#    Angle : le site vitrine n'est pas une plaquette, c'est un commercial.
#    Trame : hero → position → démonstration → déroulé → comparatif → FAQ → CTA
# ==========================================================================
PAGES["creation-site-vitrine"] = [
    ("hero", hero(
        "Création de site vitrine",
        "Un site vitrine qui vous amène des demandes chaque semaine.",
        "Votre site est écrit et développé pour votre activité. Il charge vite, il explique votre offre, et vous le modifiez sans nous. Aucun constructeur de pages, aucun abonnement caché.",
        "Cadrer mon projet", "Voir des réalisations", "/pages/resultats",
        "Expertises", "/pages/agence-seo",
        proofs=[("", "0", "", "constructeur de pages"),
                ("", "100", " %", "code écrit pour vous"),
                ("", "4", " sem.", "délai courant")])),

    ("position", quote(
        "Notre parti pris",
        "Un site vitrine se juge à une seule chose : le nombre de personnes qui vous écrivent après l'avoir lu. Tout le reste — animations, mentions, palmarès — n'est utile que s'il sert cette phrase.",
        "Clickscreation")),

    ("demonstration", split(
        "Ce qui fait la différence",
        "Votre visiteur balaie la page et décide en dix secondes.",
        "<p>En moyenne, un visiteur accorde quelques secondes à une page avant de décider s'il continue. Il ne cherche pas votre histoire, il cherche à savoir si vous résolvez son problème, si vous êtes crédible et combien ça coûte.</p><p>Nous construisons donc chaque page dans cet ordre-là : le problème d'abord, la preuve ensuite, la demande de contact quand la valeur est comprise — jamais avant.</p>",
        [("Une promesse compréhensible en dix secondes",
          "Ce que vous faites, pour qui, et ce qui vous distingue. Sans jargon de métier ni superlatifs invérifiables."),
         ("Des preuves à la place des adjectifs",
          "Réalisations datées, chiffres vérifiables, avis identifiables. « Expert reconnu » ne convainc personne ; un cas client précis, oui."),
         ("Un chemin de contact évident",
          "Un formulaire court, une adresse visible, un délai de réponse annoncé. La friction se mesure en champs inutiles.")],
        surface="paper", cta="Voir le déroulé", cta_url="#deroule")),

    ("deroule", steps(
        "Déroulé du projet",
        "Cinq étapes, un interlocuteur unique.",
        "Vous validez à chaque étape. Rien ne part en développement tant que la structure et les textes ne sont pas arrêtés — c'est ce qui évite les reprises coûteuses en fin de projet.",
        [("Cadrage", "Nous partons de votre activité, de vos clients types et des demandes que vous voulez recevoir. Aucune ligne de code avant cette clarté.", "1 semaine"),
         ("Architecture", "Arborescence, rôle de chaque page, parcours de contact, plan de rédaction. Vous voyez le site avant qu'il existe.", "3 à 5 jours"),
         ("Rédaction", "Nous écrivons les textes à partir de vos mots et de ce que cherchent vos clients. Vous relisez et amendez.", "1 semaine"),
         ("Design et développement", "Maquettes puis intégration sur mesure. Performance, accessibilité et référencement traités pendant, pas après.", "2 à 3 semaines"),
         ("Mise en ligne", "Bascule, redirections, suivi des conversions, formation à l'administration. Vous repartez autonome.", "2 jours")],
        surface="dark")),

    ("metiers", grid(
        "Selon votre activité",
        "Ce qui change d'un métier à l'autre.",
        "Le site d'un artisan et celui d'un cabinet de conseil n'ont ni le même parcours, ni les mêmes preuves, ni le même déclencheur de contact. Chaque page ci-dessous détaille ce qui change.",
        [("layers", "PME et TPE", "Une vente à cycle long où le site prépare le rendez-vous et fait circuler l'information en interne.",
          "/pages/site-vitrine-pme-tpe", "Voir cette page"),
         ("check", "Indépendant et freelance", "On vous choisit vous avant de choisir votre offre : le site doit installer la confiance.",
          "/pages/site-vitrine-freelance", "Voir cette page"),
         ("cart", "Restaurant et hôtellerie", "Chaque réservation en direct est une commission économisée sur les plateformes.",
          "/pages/site-vitrine-restaurant", "Voir cette page"),
         ("target", "Artisan et BTP", "Le problème n'est pas le nombre d'appels mais leur qualité : le site filtre en amont.",
          "/pages/site-vitrine-artisan", "Voir cette page")],
        surface="dark", density="comfortable")),

    ("choix", compare(
        "Faire le bon choix",
        "Site sur mesure, gabarit ou constructeur : lequel pour vous ?",
        "Un site sur mesure ne se justifie pas toujours. Voici comment nous en discutons avant de vous vendre quoi que ce soit.",
        "Développement sur mesure", "Gabarit ou constructeur",
        [("Coût de départ", "Plus élevé", "Faible"),
         ("Coût sur trois ans", "Stable, aucun abonnement d'outil", "Abonnements cumulés, souvent supérieur"),
         ("Vitesse de chargement", "Maîtrisée, code minimal", "Alourdie par le constructeur"),
         ("Référencement technique", "Structure et balisage contrôlés", "Dépend de ce que l'outil autorise"),
         ("Évolution", "Toute demande est réalisable", "Limitée aux options prévues"),
         ("Autonomie", "Vous modifiez les contenus", "Vous modifiez les contenus"),
         ("Pertinent si", "Le site est un canal d'acquisition", "Vous testez une activité naissante")],
        "Si votre site doit générer des demandes de manière régulière, le sur-mesure se rentabilise. Si vous validez encore votre marché, un gabarit suffit — et nous vous le dirons.",
        surface="paper")),

    ("faq", faq(
        "Ce qu'on nous demande sur la création de site.",
        "Des réponses précises, y compris quand elles ne vont pas dans notre sens.",
        [("Combien coûte un site vitrine sur mesure ?",
          "<p>Le budget dépend du nombre de pages, du volume de rédaction et des fonctionnalités. Un site de présentation à cinq pages n'a rien à voir avec un site de services couvrant douze métiers et trois zones géographiques. Nous chiffrons après le cadrage, sur un périmètre écrit, et le devis détaille chaque poste.</p>"),
         ("Qui écrit les textes ?",
          "<p>Nous, à partir d'un entretien avec vous et d'une analyse de ce que cherchent vos clients. Vous relisez, corrigez et validez. Beaucoup de projets échouent parce que le prestataire attend des contenus que le client n'a pas le temps d'écrire — nous préférons prendre cette charge.</p>"),
         ("Le site sera-t-il visible sur Google ?",
          "<p>Il sera techniquement irréprochable : structure, balisage, vitesse, données structurées, indexation. Cela ne suffit pas à se positionner sur des requêtes concurrentielles, qui demandent un travail de référencement dans la durée. Nous distinguons toujours les deux, et nous ne facturons pas du SEO déguisé en création de site.</p>"),
         ("Puis-je modifier le site sans vous ?",
          "<p>Oui. Chaque bloc est éditable depuis l'interface d'administration : textes, images, ordre des sections. Nous formons une personne de votre équipe à la mise en ligne et livrons une documentation. Vous ne dépendez de nous que pour les évolutions structurelles.</p>"),
         ("Que se passe-t-il si je veux changer de prestataire ensuite ?",
          "<p>Vous partez avec tout : hébergement à votre nom, nom de domaine à votre nom, accès complets, code livré. Nous ne conservons aucune clé qui vous rendrait captif. C'est un choix commercial assumé.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Parlons de votre projet avant de parler budget.",
        "Décrivez votre activité et ce que vous attendez du site. Nous revenons avec une lecture de votre situation et un ordre de grandeur honnête — y compris si un site sur mesure ne se justifie pas chez vous.",
        "Cadrer mon projet", link="Voir la prestation SEO", link_url="/pages/agence-seo",
        points=("Devis détaillé poste par poste", "Aucun engagement au cadrage"))),
]

# ==========================================================================
# 2. META ADS  (suffixe : meta-ads)
#    Angle : la publicité amplifie, elle ne répare pas.
#    Trame : hero → chiffres → démonstration inversée → périmètre → position → FAQ → CTA
# ==========================================================================
PAGES["meta-ads"] = [
    ("hero", hero(
        "Publicité Meta",
        "La publicité amplifie une offre. Elle ne la répare pas.",
        "Facebook et Instagram peuvent multiplier vos demandes — à condition que l'offre, la page de destination et le suivi des conversions tiennent déjà debout. Vous ne dépensez rien tant que ces trois points ne tiennent pas.",
        "Faire auditer mes campagnes", "Voir l'audit Meta Ads", "/pages/audit-meta-ads",
        "Expertises", "/pages/agence-seo")),

    ("constat", stats(
        "Ce que nous voyons en audit",
        "Les trois causes les plus fréquentes d'un budget qui part sans retour.",
        [("Suivi", "Conversions mal configurées", "Des achats ou des formulaires non remontés faussent l'optimisation : l'algorithme apprend sur des données incomplètes."),
         ("Créations", "Une seule idée déclinée", "Cinq visuels issus du même concept ne testent qu'une hypothèse. La lassitude publicitaire arrive vite."),
         ("Destination", "Page non alignée", "La publicité promet une chose, la page en raconte une autre. Le clic est payé, la conversion perdue.")],
        source="Constats récurrents sur les comptes que nous auditons. Ils ne préjugent pas de votre situation.",
        surface="dark")),

    ("methode", split(
        "Notre méthode",
        "Nous pilotons sur la marge, jamais sur le coût par clic.",
        "<p>Un coût par clic qui baisse peut parfaitement accompagner une rentabilité qui s'effondre. Le seul indicateur qui décide, c'est ce que rapporte un euro investi une fois toutes les charges déduites.</p><p>Nous remontons donc la chaîne complète : impression, clic, page de destination, formulaire ou panier, puis valeur réelle du client. Chaque décision d'augmentation de budget s'appuie sur ce trajet entier.</p>",
        [("Structure lisible", "Peu de campagnes, des ensembles de publicités qui ne se cannibalisent pas, une intention par audience."),
         ("Créations testées par angle", "On ne teste pas cinq couleurs de bouton mais cinq raisons d'acheter. Les écarts de performance viennent de là."),
         ("Budget piloté par paliers", "On augmente quand le coût par demande reste tenable sur une période complète, pas sur trois bons jours.")],
        surface="paper", reverse=True)),

    ("perimetre", grid(
        "Périmètre d'intervention",
        "Ce que nous prenons en charge.",
        "Selon votre situation, tout n'est pas nécessaire. Le diagnostic fixe le périmètre avant le devis.",
        [("target", "Audit du compte", "Structure, historique, dépenses, audiences, angles créatifs et suivi des conversions passés au crible."),
         ("megaphone", "Stratégie de campagne", "Objectifs, segmentation, budgets et calendrier définis à partir de votre marge, pas d'un standard sectoriel."),
         ("layers", "Production des créations", "Angles rédactionnels, déclinaisons visuelles et vidéos courtes conçues pour être testées les unes contre les autres."),
         ("gauge", "Page de destination", "Alignement message-publicité, réduction des frictions, formulaire raccourci. Souvent le gain le plus rapide."),
         ("signal", "Suivi et attribution", "Pixel, conversions côté serveur, événements personnalisés. Sans données fiables, aucune optimisation n'est possible."),
         ("check", "Pilotage mensuel", "Lecture des résultats, arbitrages de budget, renouvellement des créations avant l'essoufflement.")],
        surface="dark", density="comfortable")),

    ("position", quote(
        "Ce que nous refusons",
        "Nous n'acceptons pas de mission publicitaire sur une offre qui ne convertit pas encore. Dépenser du budget média pour masquer un problème de proposition de valeur revient à faire payer au client une erreur que nous aurions dû signaler.",
        link="Commencer par un audit", link_url="/pages/audit-meta-ads")),

    ("faq", faq(
        "Questions fréquentes sur Meta Ads.",
        "Sur la publicité, les promesses sont faciles. Voici nos réponses réelles.",
        [("Quel budget média minimum faut-il prévoir ?",
          "<p>En dessous d'un certain volume quotidien, l'algorithme ne sort jamais de sa phase d'apprentissage et les résultats restent erratiques. L'ordre de grandeur dépend de votre secteur et de votre prix. Une prestation à 3 000 € et un produit à 40 € n'ont pas le même seuil. Nous le calculons pendant l'audit, avant de vous engager.</p>"),
         ("Gérez-vous aussi Google Ads ?",
          "<p>Non. Nous intervenons sur Meta et sur Google Merchant Center pour les flux produits. Google Ads en recherche est un métier distinct, et nous préférons vous orienter vers quelqu'un dont c'est la spécialité plutôt que de facturer un apprentissage.</p>"),
         ("Qui est propriétaire du compte publicitaire ?",
          "<p>Vous. Nous travaillons sur votre gestionnaire d'entreprise avec un accès délégué. À la fin de la mission, nous retirons nos accès et vous conservez l'historique, les audiences et les créations. Un compte publicitaire détenu par une agence est un point de dépendance que nous refusons de créer.</p>"),
         ("Combien de temps avant de voir des résultats ?",
          "<p>Comptez deux à trois semaines de diffusion continue. C'est le temps qu'il faut aux campagnes pour sortir de l'apprentissage et réunir assez de conversions. Toute lecture faite avant relève de l'interprétation de bruit statistique.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Commençons par regarder ce que disent vos données.",
        "Donnez-nous un accès en lecture à votre compte publicitaire. Nous revenons avec ce qui fonctionne, ce qui coûte sans rapporter, et si la publicité est vraiment votre priorité aujourd'hui.",
        "Demander un audit Meta Ads",
        link="Analyser mes concurrents", link_url="/pages/analyse-concurrentielle-meta-ads",
        points=("Accès en lecture seule", "Aucun changement sans votre accord"))),
]

# ==========================================================================
# 3. OPTIMISATION CRO
#    Angle : la conversion se gagne en retirant, pas en ajoutant.
#    Trame : hero → démonstration → étapes → périmètre dense → comparatif → FAQ → CTA
# ==========================================================================
PAGES["optimisation-cro"] = [
    ("hero", hero(
        "Optimisation de la conversion",
        "Le même trafic peut produire deux fois plus de demandes.",
        "Avant d'acheter de la visibilité supplémentaire, il est presque toujours plus rentable de convertir celle que vous avez déjà. Vous gardez le même trafic, vous obtenez plus de demandes : nous retirons une à une les raisons d'hésiter.",
        "Analyser mes parcours", "Voir les résultats", "/pages/resultats",
        "Expertises", "/pages/agence-seo",
        proofs=[("", "3", " sem.", "premier cycle de test"),
                ("", "1", " hypothèse", "testée à la fois"),
                ("", "48", " h", "délai de réponse")])),

    ("constat", split(
        "Le diagnostic",
        "Vos visiteurs sont prêts à acheter. Quelque chose les arrête.",
        "<p>La conclusion la plus fréquente — et la plus fausse — est d'accuser la qualité du trafic. Dans la plupart des cas que nous reprenons, les visiteurs étaient les bons. C'est la page qui ne répondait pas à leur question au bon moment.</p><p>Nous partons donc de l'observation, pas de l'opinion : enregistrements de sessions, points d'abandon, formulaires abandonnés à mi-parcours, requêtes internes sans résultat.</p>",
        [("Là où l'attention se perd", "Analyse des parcours réels : ce que les visiteurs regardent, ignorent, et à quel endroit ils repartent."),
         ("Là où le doute apparaît", "Prix absent, délai flou, absence de preuve, engagement perçu comme trop lourd. Le doute a toujours une cause précise."),
         ("Là où la friction est mécanique", "Formulaire trop long, étape superflue, bouton invisible sur mobile, temps de chargement.")],
        surface="paper")),

    ("cycle", steps(
        "Comment nous travaillons",
        "Un cycle court, répété.",
        "Nous ne livrons pas une liste de cinquante recommandations. Nous en appliquons quelques-unes, nous mesurons, puis nous recommençons avec ce que les données nous ont appris.",
        [("Observer", "Données d'audience, enregistrements, entonnoirs, retours du service commercial. Aucune hypothèse sans matière.", "Semaine 1"),
         ("Prioriser", "Chaque frein est classé par impact estimé, effort et niveau de certitude. On commence par ce qui rapporte le plus vite.", "Semaine 1"),
         ("Modifier", "Réécriture, refonte de bloc, allègement de formulaire. Une seule variable significative à la fois.", "Semaines 2-3"),
         ("Mesurer", "Comparaison sur une durée suffisante pour être crédible. Un gain non reproductible n'est pas un gain.", "Semaines 3-5")],
        surface="dark")),

    ("leviers", grid(
        "Les points que nous travaillons",
        "Là où se jouent réellement les décisions.",
        "",
        [("gauge", "Message d'accueil", "La première phrase décide de la suite. Nous la réécrivons à partir des mots de vos clients."),
         ("check", "Preuves", "Avis, cas clients, chiffres datés, garanties. Placés au moment du doute, pas relégués en bas de page."),
         ("layers", "Hiérarchie mobile", "L'ordre des blocs sur petit écran n'est pas celui du bureau. Beaucoup de sites l'ignorent."),
         ("target", "Formulaires", "Chaque champ supprimé augmente le taux de complétion. Nous ne gardons que ce qui sert vraiment."),
         ("signal", "Prix et engagement", "Un tarif absent n'élimine pas l'objection, il l'aggrave. Nous cadrons comment en parler."),
         ("cart", "Tunnel d'achat", "Panier, livraison, paiement : les trois marches où l'on perd le plus de clients déjà décidés.")],
        surface="paper", density="dense")),

    ("format", compare(
        "Deux formats",
        "Deux façons de travailler, selon votre rythme.",
        "Le premier donne une carte, le second parcourt le chemin. Ils ne s'adressent pas aux mêmes situations.",
        "Accompagnement continu", "Audit ponctuel",
        [("Ce que vous recevez", "Modifications appliquées et mesurées", "Un rapport priorisé et argumenté"),
         ("Qui exécute", "Nous", "Votre équipe"),
         ("Durée", "Cycles de trois mois", "Deux à trois semaines"),
         ("Mesure des effets", "Incluse et documentée", "À votre charge"),
         ("Pertinent si", "Le site est un canal central et vous manquez de temps", "Vous avez une équipe technique disponible"),
         ("Budget", "Mensuel", "Forfait unique")],
        "Si personne chez vous n'a le temps d'appliquer les recommandations, l'audit seul finit dans un dossier. Nous préférons le dire avant.",
        surface="dark")),

    ("faq", faq(
        "Questions fréquentes sur le CRO.",
        "L'optimisation de la conversion attire beaucoup de raccourcis. Voici où nous nous situons.",
        [("Faut-il beaucoup de trafic pour faire du CRO ?",
          "<p>Pour des tests comparatifs statistiquement fiables, oui : en dessous d'un certain volume de conversions mensuelles, un écart observé relève du hasard. Mais l'essentiel du travail — clarté du message, preuves, allègement des formulaires, hiérarchie mobile — s'appuie sur l'observation qualitative et fonctionne à tout volume.</p>"),
         ("Allez-vous refaire tout mon site ?",
          "<p>Non, sauf si le diagnostic conclut que la structure elle-même est le frein. Nous modifions peu et nous mesurons, plutôt que de tout remplacer. Une refonte complète efface aussi les repères de vos visiteurs fidèles.</p>"),
         ("Comment mesurez-vous vos résultats ?",
          "<p>Sur le taux de conversion de l'objectif défini avec vous — demande de devis, prise de rendez-vous, achat — et sur une période complète incluant vos variations habituelles. Nous documentons le point de départ avant toute modification : sans mesure initiale, aucune progression n'est démontrable.</p>"),
         ("Travaillez-vous sur Shopify et sur les sites sur mesure ?",
          "<p>Les deux, ainsi que sur WordPress. Les principes de décision d'achat sont identiques ; seules changent les modalités techniques d'application. Sur Shopify, nous intervenons directement dans le thème.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Regardons où partent vos visiteurs.",
        "Décrivez votre site et l'action que vous voulez déclencher. Nous identifions les trois frictions les plus coûteuses et vous disons lesquelles se corrigent en quelques jours.",
        "Analyser mes parcours",
        link="Voir la prestation Shopify", link_url="/pages/agence-shopify",
        points=("Diagnostic argumenté", "Priorisation par impact"))),
]

if __name__ == "__main__":
    written = [write(suffix, sections) for suffix, sections in PAGES.items()]
    for name in written:
        print("écrit :", name)
