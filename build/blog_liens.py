#!/usr/bin/env python3
"""
Reprend les liens et les fins d'article dans build/blog/.

Cinq corrections, appliquées à l'ensemble du blog :

1. L'ancre « /#audit » n'existe plus depuis la refonte : trente-trois articles
   renvoyaient le lecteur en haut de l'accueil au lieu de la page de prise de
   rendez-vous.
2. Trente-quatre articles pointaient vers l'accueil avec exactement la même
   ancre. Chacun renvoie désormais vers la prestation dont il parle.
3. Cinq articles se terminaient par la même signature recyclée. Chacun reçoit
   une relance qui reprend son sujet.
4. Les questions de FAQ deviennent des titres de niveau 3.
5. Les illustrations perdent leur mise en forme écrite dans la balise.

Le script est sans effet s'il est relancé sur des fichiers déjà corrigés.
"""
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "blog"

ANCRE_ACCUEIL = '<a href="/">création de sites Shopify et vitrines</a>'

# Chaque article renvoie vers la prestation qu'il évoque, avec une ancre qui
# se lit dans la phrase où elle est posée.
VITRINE = ("/pages/creation-site-vitrine", "création de site vitrine")
SHOPIFY = ("/pages/agence-shopify", "création de boutique Shopify")
SURMESURE = ("/pages/creation-site-vitrine", "création de site sur mesure")

# Les phrases qui portaient l'ancre apportent déjà leur qualificatif
# (« orientée conversion », « pensée pour convertir ») : l'ancre doit s'y
# glisser sans le répéter, d'où un libellé propre à chaque article.
CRO = "/pages/optimisation-cro"

CIBLES = {
    "abandon-panier-corrections": SHOPIFY,
    "combien-coute-une-boutique-shopify": SHOPIFY,
    "donnees-structurees-produit-google": SHOPIFY,
    "fiche-produit-structure-conversion": SHOPIFY,
    "migrer-vers-shopify-sans-perdre-seo": SHOPIFY,
    "pixel-meta-api-conversion-shopify": SHOPIFY,
    "vitesse-shopify-optimisations": SHOPIFY,
    "apps-shopify-utiles-et-a-eviter": SURMESURE,

    "ad-library-analyser-pubs-concurrents": (CRO, "conception du site"),
    "angles-creatifs-publicite-meta": (CRO, "page de destination"),
    "calculer-roas-avec-marge": (CRO, "conception du site"),
    "microsoft-clarity-trouver-fuites-conversion": (CRO, "conception du site"),
    "page-contact-qui-convertit": (CRO, "travail sur la conversion"),
    "structure-compte-meta-ads-2026": (CRO, "conception du site"),
    "seo-ou-google-ads-par-quoi-commencer": (CRO, "conception du site"),

    "ab-testing-petit-trafic": VITRINE,
    "agence-seo-ou-consultant-seo": VITRINE,
    "ai-overviews-rester-visible": VITRINE,
    "balises-title-formules-ctr": VITRINE,
    "cahier-des-charges-site-vitrine": VITRINE,
    "checklist-audit-seo": VITRINE,
    "combien-coute-audit-seo": VITRINE,
    "combien-coute-le-seo-en-2026-et-pourquoi-fuir-le-200-euros-par-mois": VITRINE,
    "comment-choisir-votre-agence-seo-sans-vous-faire-avoir": VITRINE,
    "core-web-vitals-explique-simplement": VITRINE,
    "creer-pages-villes-sans-duplicate": VITRINE,
    "delais-resultats-seo": VITRINE,
    "eeat-prouver-expertise-google": VITRINE,
    "maillage-interne-cocon-semantique": VITRINE,
    "obtenir-plus-avis-google": VITRINE,
    "optimiser-fiche-google-business-profile": VITRINE,
    "prix-site-vitrine-2026": VITRINE,
    "refonte-site-sans-perdre-seo": VITRINE,
    "search-console-rapports-essentiels": VITRINE,
}

# Les articles qui se terminaient par la signature recyclée.
RELANCES = {
    "agence-seo-ou-consultant-seo":
        "<p><strong>Vous hésitez entre une agence et un indépendant pour votre "
        "référencement ?</strong> <a href=\"/pages/reserver\">Demandez votre "
        "diagnostic offert</a> : nous regardons votre marché, votre concurrence "
        "et le volume de travail réel, puis nous vous disons franchement quel "
        "format vous coûtera le moins cher par demande obtenue.</p>",
    "checklist-audit-seo":
        "<p><strong>Vous voulez cette checklist déroulée sur votre site, avec "
        "les chiffres ?</strong> <a href=\"/pages/audit-seo\">Demandez votre "
        "audit offert</a> : nous passons les 12 points en revue et vous "
        "renvoyons vos trois priorités classées par impact, sous 48 h.</p>",
    "combien-coute-audit-seo":
        "<p><strong>Vous voulez savoir ce qu'un audit changerait chez vous "
        "avant d'y mettre un euro ?</strong> <a href=\"/pages/audit-seo\">"
        "Demandez votre audit offert</a> : vous repartez avec vos trois "
        "priorités chiffrées, que nous travaillions ensemble ou non.</p>",
    "combien-coute-une-boutique-shopify":
        "<p><strong>Vous voulez un budget réaliste pour votre boutique, "
        "poste par poste ?</strong> <a href=\"/pages/agence-shopify\">"
        "Demandez votre diagnostic offert</a> : nous cadrons le périmètre, les "
        "intégrations et le coût de fonctionnement avant que vous ne signiez "
        "quoi que ce soit.</p>",
    "seo-ou-google-ads-par-quoi-commencer":
        "<p><strong>Vous ne savez pas par quel levier commencer avec votre "
        "budget ?</strong> <a href=\"/pages/reserver\">Demandez votre "
        "diagnostic offert</a> : nous estimons ce que chaque canal peut vous "
        "rapporter dans votre marché, et nous vous disons lequel lancer en "
        "premier.</p>",
}

SIGNATURE = re.compile(
    r"<p>Agence SEO, Shopify &amp; Meta Ads à Paris — CLICKSCREATION\..*?</p>",
    re.S)

# Les questions de FAQ étaient du texte nu dans <summary> : aucun article
# n'avait donc de titre de niveau 3. Un <summary> accepte un élément de titre,
# ce qui rend la question repérable par les moteurs comme par un lecteur
# d'écran.
QUESTION_NUE = re.compile(r"<summary>(?!\s*<h[23])(.*?)</summary>", re.S)

# Les illustrations arrivaient avec leur mise en forme écrite dans la balise et
# une légende vide réduite à un retour à la ligne. Le style appartient à la
# feuille de styles, et une légende vide n'a rien à faire dans le document.
FIGURE = re.compile(r"<figure[^>]*>", re.I)
IMG_STYLE = re.compile(r'(<img)\s+style="[^"]*"', re.I)
LEGENDE_VIDE = re.compile(r"<figcaption[^>]*>\s*(?:<br\s*/?>)?\s*</figcaption>", re.I)


def main():
    if not DOSSIER.exists():
        print("build/blog absent : lancer build/blog_extract.py d'abord")
        return 1

    audit = accueil = signature = questions = figures = 0
    orphelins = set(CIBLES)

    for chemin in sorted(DOSSIER.glob("*.html")):
        handle = chemin.stem
        corps = chemin.read_text(encoding="utf-8")
        depart = corps

        audit += corps.count('href="/#audit"')
        corps = corps.replace('href="/#audit"', 'href="/pages/reserver"')

        if ANCRE_ACCUEIL in corps:
            orphelins.discard(handle)
            if handle not in CIBLES:
                print("  cible manquante pour %s" % handle)
                return 1
            url, libelle = CIBLES[handle]
            accueil += corps.count(ANCRE_ACCUEIL)
            corps = corps.replace(
                ANCRE_ACCUEIL, '<a href="%s">%s</a>' % (url, libelle))

        if SIGNATURE.search(corps):
            if handle not in RELANCES:
                print("  relance manquante pour %s" % handle)
                return 1
            corps = SIGNATURE.sub(RELANCES[handle], corps)
            signature += 1

        questions += len(QUESTION_NUE.findall(corps))
        corps = QUESTION_NUE.sub(
            r'<summary><h3 class="cc-faq-list__q">\1</h3></summary>', corps)

        figures += len(FIGURE.findall(corps))
        corps = FIGURE.sub('<figure class="cc-figure">', corps)
        corps = IMG_STYLE.sub(r'\1 decoding="async"', corps)
        corps = LEGENDE_VIDE.sub("", corps)

        if corps != depart:
            chemin.write_text(corps, encoding="utf-8")

    print("liens : %d ancres /#audit redirigées vers /pages/reserver" % audit)
    print("liens : %d liens vers l'accueil renvoyés vers la bonne prestation" % accueil)
    print("fins  : %d signatures recyclées remplacées" % signature)
    print("titres: %d questions de FAQ passées en titre de niveau 3" % questions)
    print("images: %d illustrations sorties du style en ligne" % figures)
    # Sur une seconde exécution il ne reste plus rien à substituer : ce n'est
    # pas une anomalie, seul le premier passage doit être complet.
    if accueil and orphelins:
        print("cibles déclarées sans occurrence :", sorted(orphelins))
    return 0


if __name__ == "__main__":
    sys.exit(main())
