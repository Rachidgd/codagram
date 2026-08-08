#!/usr/bin/env python3
"""
Relecture de toutes les balises title et meta description du site.

Trois défauts reviennent dans l'existant, et ce sont les trois que le client a
lui-même signalés au fil des relectures :

1. Une promesse d'implantation locale. « SEO par ville | Experts locaux » :
   l'agence est à Paris, elle n'a pas d'expert à Nice. Une promesse qui tombe
   au premier rendez-vous.

2. Du jargon d'agence à la place du bénéfice. « leads qualifiés »,
   « acquisition organique », « hiérarchiser vos offres », « consolider les
   fondations techniques » : ce sont nos livrables, pas ce que le client
   gagne. Le registre attendu est celui du client : du trafic, de la
   visibilité locale, des appels, des demandes de devis.

3. Un angle qui rétrécit le marché. « Requêtes techniques B2B » sur Toulouse,
   « Saison et clientèle internationale » sur Nice : une entreprise de BTP
   qui cherche « agence seo toulouse » en conclut que la page n'est pas pour
   elle. L'angle reste dans le corps de la page, il sort du title.

S'y ajoutent deux fautes mécaniques : quatorze descriptions de pages villes
bâties sur la même phrase à trou, et quelques longueurs hors limites.

Le script ne réécrit rien de ce qui va bien. Il porte les corrections, les
vérifie, et refuse de sortir une charge utile si l'une d'elles enfreint une
règle.
"""
import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "build" / "metas_site.charge.json"

TITRE_MAX = 60
DESC_MIN = 138
DESC_MAX = 158

# Vocabulaire proscrit, accumulé au fil des refus du client. La règle vaut
# pour les balises, pas pour le corps des pages : une méta n'a pas la place
# d'expliquer un terme, donc elle n'en emploie aucun qui demande une glose.
BANNI = {
    "leads": "jargon : dire « demandes » ou « appels »",
    "acquisition organique": "jargon",
    "seo-friendly": "jargon",
    "experts locaux": "promesse d'implantation que l'agence ne tient pas",
    "expert local": "promesse d'implantation que l'agence ne tient pas",
    "trouvé par vos clients": "formule creuse, refusée en relecture",
    "trouvé par vos client": "formule creuse, refusée en relecture",
    "gabarit acheté": "on parle du procédé, pas du bénéfice",
    "thème acheté": "on parle du procédé, pas du bénéfice",
    "vos accès": "on parle du procédé, pas du bénéfice",
    "à votre nom": "on parle du procédé, pas du bénéfice",
    "un seul interlocuteur": "on parle du procédé, pas du bénéfice",
    "clé en main": "slogan",
    "sur-mesure et clé en main": "slogan",
}

# (handle, titre, description). None = on ne touche pas au champ.
PAGES = [
    # --- Prestations nationales -------------------------------------------
    ("agence-seo",
     "Agence SEO et référencement naturel | Plus de clients",
     "Être présent sur les recherches qui précèdent un achat, c'est du trafic "
     "chaque mois et des demandes qui arrivent seules. Diagnostic gratuit sous 48 h."),

    ("agence-shopify",
     "Agence Shopify | Création, refonte et plus de ventes",
     "Création ou refonte de votre boutique Shopify : rapide, visible sur Google "
     "et construite pour vendre davantage à trafic égal. Diagnostic gratuit 48 h."),

    ("creation-site-vitrine",
     "Création de site vitrine | Un site qui amène des clients",
     "Un site vitrine clair, rapide et visible sur Google, qui présente votre "
     "activité et transforme vos visiteurs en appels et en demandes de devis."),

    ("expert-meta-ads",
     "Expert Meta Ads : campagnes Facebook et Instagram rentables",
     None),

    ("optimisation-cro",
     "Optimisation CRO | Plus de ventes sans plus de trafic",
     "Le même trafic, plus de ventes : nous corrigeons ce qui fait abandonner vos "
     "visiteurs sur vos pages, vos formulaires et votre parcours mobile."),

    ("seo-local",
     "SEO local | Plus d'appels depuis les recherches de proximité",
     "Soyez visible auprès des clients proches de vous : fiche Google, pages "
     "locales et avis. Plus d'appels, de visites et de devis. Audit offert."),

    # « CRO » ne veut rien dire pour un dirigeant qui cherche à nous joindre.
    ("contact",
     None,
     "Contactez Clickscreation pour cadrer votre projet : référencement, site "
     "vitrine, boutique Shopify, conversion ou Meta Ads. Réponse sous 48 h."),

    ("a-propos",
     "À propos de Clickscreation | Agence SEO, web et Meta Ads",
     "Une agence à taille humaine, installée à Paris, qui relie site, "
     "référencement et publicité pour transformer votre visibilité en appels et "
     "en demandes."),

    # --- Audits et conversion ---------------------------------------------
    ("audit-seo",
     "Audit SEO gratuit | Vos 3 priorités pour monter sur Google",
     "Nous cherchons ce qui bloque votre visibilité et vous renvoyons les trois "
     "actions à mener en premier pour gagner des places. Gratuit, sous 48 h."),

    ("audit-meta-ads",
     "Audit Meta Ads gratuit : où part vraiment votre budget ?",
     "Campagnes, ciblage, créas, tracking : nous cherchons ce qui vous coûte des "
     "ventes avant que vous n'ajoutiez un euro de budget. Gratuit, sous 48 h."),

    ("analyse-concurrentielle-meta-ads",
     "Analyse concurrentielle Meta Ads : trouvez votre angle",
     "Ce que vos concurrents diffusent, depuis quand et avec quels arguments : de "
     "quoi lancer des campagnes plus claires et dépenser moins pour vendre autant."),

    ("audit-ecommerce",
     "Audit e-commerce : trouvez ce qui freine vos ventes",
     "Boutique lente, offre floue, panier abandonné, pages invisibles : nous vous "
     "disons ce qui vous fait perdre des ventes et par quoi commencer. Gratuit."),

    ("audit-merchant-center",
     "Audit Merchant Center : débloquez vos produits refusés",
     "Flux, produits refusés, titres, tracking : nous cherchons ce qui empêche vos "
     "produits d'apparaître dans Shopping et ce qu'il faut corriger en premier."),

    ("reserver",
     None,
     "Choisissez un créneau : nous analysons votre site et vous repartez avec les "
     "priorités à corriger pour gagner en visibilité et en demandes. C'est gratuit."),

    ("plan-du-site",
     None,
     "Toutes les pages de Clickscreation en un coup d'œil : référencement, création "
     "de site, Shopify, Meta Ads, conversion, audits, villes et ressources."),

    ("mentions-legales",
     None,
     "Mentions légales du site Clickscreation : éditeur, directeur de la "
     "publication, hébergeur, propriété intellectuelle et coordonnées de contact."),

    ("politique-de-confidentialite",
     None,
     "Politique de confidentialité de Clickscreation : données collectées, "
     "finalités, durées de conservation, cookies et exercice de vos droits."),

    # --- Référencement par ville ------------------------------------------
    ("seo-par-ville",
     "SEO par ville | Le référencement local, ville par ville",
     "Nos pages ville par ville : ce qui se joue sur chaque marché local et comment "
     "y gagner en visibilité, en trafic et en demandes. Diagnostic gratuit 48 h."),

    ("consultant-seo-paris",
     "Consultant SEO Paris | Être visible malgré la concurrence",
     "À Paris, tout le monde est sur Google et peu sont vus. Nous visons les "
     "recherches encore accessibles pour vous ramener du trafic et des demandes."),

    ("consultant-seo-lyon",
     "Consultant SEO Lyon | Capter la demande locale sur Google",
     "Référencement naturel à Lyon : apparaître sur les recherches de votre "
     "activité, faire venir du trafic local et transformer ces visites en clients."),

    ("consultant-seo-rennes",
     "Consultant SEO Rennes | Être choisi par ceux qui comparent",
     "Référencement naturel à Rennes : vos clients comparent avant d'appeler. Nous "
     "vous plaçons sur ces recherches pour capter le trafic et les demandes."),

    ("agence-seo-marseille",
     "Agence SEO Marseille | Visible quartier par quartier",
     "Référencement naturel à Marseille : apparaître sur les recherches des "
     "quartiers que vous couvrez, capter ce trafic et recevoir plus de demandes."),

    ("agence-seo-lille",
     "Agence SEO Lille | Visible en France et en Belgique",
     "Référencement naturel à Lille : capter la demande locale et la clientèle "
     "belge voisine, pour du trafic régulier et davantage de demandes de devis."),

    ("agence-seo-nantes",
     "Agence SEO Nantes | Capter une demande qui augmente",
     "Référencement naturel à Nantes : une ville qui grandit vite, donc des clients "
     "qui cherchent tout sur Google. Nous vous plaçons sur ces recherches-là."),

    ("agence-seo-bordeaux",
     "Agence SEO Bordeaux | Passer devant vos concurrents",
     "Référencement naturel à Bordeaux : sur un marché devenu disputé, nous visons "
     "les recherches qui rapportent pour vous ramener trafic et demandes."),

    ("agence-seo-nice",
     "Agence SEO Nice | Une visibilité qui tient toute l'année",
     "Référencement naturel à Nice : capter la demande de la saison sans "
     "disparaître le reste de l'année, pour du trafic et des demandes réguliers."),

    ("agence-seo-toulouse",
     "Agence SEO Toulouse | Gagner en visibilité et en demandes",
     "Référencement naturel à Toulouse : rendre votre savoir-faire lisible sur "
     "Google, capter les recherches de votre marché et recevoir plus de demandes."),

    ("agence-seo-montpellier",
     "Agence SEO Montpellier | Visible sur toute la métropole",
     "Référencement naturel à Montpellier et dans les communes voisines : "
     "apparaître là où vos clients cherchent et transformer ce trafic en demandes."),

    ("agence-seo-strasbourg",
     "Agence SEO Strasbourg | Visible en France et en Allemagne",
     "Référencement naturel à Strasbourg : être visible côté français comme côté "
     "allemand, pour élargir votre trafic et recevoir davantage de demandes."),

    ("agence-seo-grenoble",
     "Agence SEO Grenoble | Rendre votre expertise visible",
     "Référencement naturel à Grenoble : traduire ce que vous savez faire en pages "
     "que Google comprend, pour attirer du trafic et des demandes concrètes."),

    ("agence-seo-luxembourg",
     "Agence SEO Luxembourg | Plus de visibilité, plus de clients",
     "Référencement naturel au Luxembourg : être visible dans les langues de vos "
     "clients, capter les recherches de votre marché et recevoir plus de demandes."),

    ("consultant-seo-suisse",
     None,
     "Référencement naturel en Suisse romande : apparaître sur google.ch à Genève, "
     "Lausanne et dans les cantons voisins, et transformer ce trafic en clients."),

    ("consultant-seo-belgique",
     "Consultant SEO Belgique | Gagner en visibilité locale",
     "Référencement naturel en Belgique francophone : apparaître sur les recherches "
     "de votre région, attirer du trafic et recevoir davantage de demandes."),

    # --- Pages métiers : le rétrécissement y est volontaire ----------------
    ("site-vitrine-restaurant",
     None,
     "Un site qui remplit vos couverts : carte à jour, réservation en direct sans "
     "commission, avis en avant, visible sur Google. Audit gratuit sous 48 h."),

    ("site-vitrine-artisan",
     None,
     "Un site qui transforme vos chantiers en demandes de devis, visible sur vos "
     "villes d'intervention. Photos, avis, contact direct. Audit gratuit sous 48 h."),

    # --- Création de site + ville : uniformisation du séparateur ----------
    # Ces deux descriptions employaient encore « trouvé par vos futurs
    # clients », la tournure jugée creuse en relecture. Elles disent
    # maintenant où le site apparaît et ce que la visite déclenche.
    ("creation-site-internet-strasbourg",
     "Création site internet Strasbourg | Sur mesure et SEO",
     "Votre site à Strasbourg placé sur les recherches de votre métier, pour "
     "attirer du trafic local et le transformer en demandes de devis et en "
     "rendez-vous."),
    ("creation-site-internet-marseille",
     "Création site internet Marseille | Site vitrine sur mesure",
     "À Marseille, votre site peut devenir votre première source de contacts : "
     "visible sur les recherches de votre activité, il déclenche l'appel ou le "
     "message."),
    ("creation-site-internet-lille",
     "Création site internet Lille | Sur mesure, SEO inclus", None),
    ("creation-site-internet-lyon",
     "Création site internet Lyon | Site vitrine et référencement", None),
    ("creation-site-internet-nice",
     "Création site internet Nice | Agence web sur mesure", None),
    ("creation-site-internet-nantes",
     "Création site internet Nantes | Agence web et site vitrine", None),
]

ARTICLES = [
    ("boutique-shopify-qui-convertit-2026",
     "Boutique Shopify qui convertit : la checklist 2026",
     "Structure, fiches produits, vitesse, référencement et tracking : la checklist "
     "complète pour lancer une boutique qui vend, et pas seulement qui existe."),

    ("delais-resultats-seo",
     "SEO : combien de temps avant les premiers résultats ?",
     None),

    ("migrer-vers-shopify-sans-perdre-seo",
     "Migrer vers Shopify sans perdre votre SEO : le plan",
     None),

    ("seo-ou-google-ads-par-quoi-commencer",
     None,
     "Délais, coûts, durabilité, intention : le comparatif SEO ou Google Ads pour "
     "savoir par quoi commencer selon votre budget et vos objectifs."),

    ("agence-seo-ou-consultant-seo",
     None,
     "Budget, périmètre, continuité : agence SEO ou consultant, les 7 critères qui "
     "comptent vraiment et les signaux d'alarme à repérer avant de signer."),

    ("guide-seo-leads-2026",
     "Guide SEO 2026 : transformer le trafic en demandes",
     "Intentions de recherche, cocon sémantique, E-E-A-T, IA et mesure : la méthode "
     "complète pour que votre référencement produise des demandes, pas du trafic."),

    ("seo-ou-meta-ads-2026",
     None,
     "Délais, coûts, durabilité, intention : le comparatif honnête entre "
     "référencement et publicité Meta, et pourquoi les meilleurs comptes cumulent."),

    ("site-vitrine-pas-de-demandes-2026",
     None,
     "Promesse floue, preuves absentes, formulaire trop long, mobile négligé : les 7 "
     "corrections à faire pour qu'un site vitrine génère enfin des demandes."),

    ("angles-creatifs-publicite-meta",
     None,
     "Problème, preuve, comparaison, objection : 12 angles publicitaires prêts à "
     "briefer, chacun illustré par un exemple et adapté au type de votre offre."),
]


def sans_accent(texte):
    return "".join(c for c in unicodedata.normalize("NFD", texte.lower())
                   if unicodedata.category(c) != "Mn")


def controle(genre, handle, titre, desc):
    """Renvoie la liste des règles enfreintes par une paire title/description."""
    fautes = []

    if titre is not None:
        if len(titre) > TITRE_MAX:
            fautes.append("titre de %d caractères (max %d)"
                          % (len(titre), TITRE_MAX))
        if titre != titre.strip():
            fautes.append("titre avec une espace en bord")
        if " - " in titre:
            fautes.append("séparateur « - » au lieu de « | »")

    if desc is not None:
        if not DESC_MIN <= len(desc) <= DESC_MAX:
            fautes.append("description de %d caractères (attendu %d-%d)"
                          % (len(desc), DESC_MIN, DESC_MAX))
        if re.search(r"\s{2,}", desc):
            fautes.append("description avec une double espace")
        if not desc.rstrip().endswith((".", "?", "!")):
            fautes.append("description sans ponctuation finale")

    for champ, valeur in (("titre", titre), ("description", desc)):
        if valeur is None:
            continue
        plat = sans_accent(valeur)
        for mot, motif in BANNI.items():
            if sans_accent(mot) in plat:
                fautes.append("%s : « %s » — %s" % (champ, mot, motif))

    # Une description ne doit pas recopier son titre : le résultat de
    # recherche dirait deux fois la même chose.
    if titre and desc:
        tete = sans_accent(titre.split("|")[0].split(":")[0]).strip()
        if len(tete) > 20 and tete in sans_accent(desc):
            fautes.append("la description recopie le début du titre")

    return ["%s %s : %s" % (genre, handle, f) for f in fautes]


def main():
    fautes = []
    charge = {"pages": [], "articles": []}

    vus = set()
    for genre, table, clef in (("page", PAGES, "pages"),
                               ("article", ARTICLES, "articles")):
        for handle, titre, desc in table:
            if (genre, handle) in vus:
                fautes.append("%s %s : doublon dans la table" % (genre, handle))
            vus.add((genre, handle))
            if titre is None and desc is None:
                fautes.append("%s %s : aucune correction" % (genre, handle))
                continue
            fautes += controle(genre, handle, titre, desc)
            charge[clef].append({"handle": handle,
                                 "title": titre, "description": desc})

    # Deux pages villes ne doivent pas partager le même segment après la barre.
    segments = {}
    for e in charge["pages"]:
        if not e["title"] or "|" not in e["title"]:
            continue
        seg = sans_accent(e["title"].split("|", 1)[1]).strip()
        segments.setdefault(seg, []).append(e["handle"])
    for seg, ou in segments.items():
        if len(ou) > 1:
            fautes.append("segment « %s » répété sur : %s" % (seg, ", ".join(ou)))

    if fautes:
        print("REFUS — %d règle(s) enfreinte(s) :" % len(fautes))
        for f in fautes:
            print("   ", f)
        return 1

    SORTIE.write_text(json.dumps(charge, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")
    print("%d pages et %d articles corrigés."
          % (len(charge["pages"]), len(charge["articles"])))
    for clef in ("pages", "articles"):
        for e in charge[clef]:
            t = "%3d" % len(e["title"]) if e["title"] else "  ·"
            d = "%3d" % len(e["description"]) if e["description"] else "  ·"
            print("  %s %s  %s" % (t, d, e["handle"]))
    print("\nCharge utile écrite dans %s" % SORTIE.relative_to(RACINE))
    return 0


if __name__ == "__main__":
    sys.exit(main())
