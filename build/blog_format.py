#!/usr/bin/env python3
"""
Aligne six articles restés au format éditorial d'origine sur celui des autres.

Ces articles ont été écrits avant la mise en place du gabarit actuel. Ils
portent un tableau sans conteneur défilant — sur mobile, la largeur minimale
du tableau fait défiler la page entière — et une FAQ en titres de niveau 3
plutôt qu'en dépliants. Leur premier paragraphe est déjà la réponse directe à
la requête visée : il ne manque que la classe qui le signale au lecteur.

Le script est idempotent : repassé sur un article déjà converti, il ne fait
rien.
"""
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "blog"

ARTICLES = (
    "agence-seo-ou-consultant-seo",
    "combien-coute-audit-seo",
    "combien-coute-le-seo-en-2026-et-pourquoi-fuir-le-200-euros-par-mois",
    "combien-coute-une-boutique-shopify",
    "comment-choisir-votre-agence-seo-sans-vous-faire-avoir",
    "seo-ou-google-ads-par-quoi-commencer",
)

TABLEAU = re.compile(r"^<table>(.*?)^</table>$", re.M | re.S)
DEBUT_FAQ = re.compile(r"^<h2>FAQ</h2>$", re.M)
PAIRE = re.compile(r"^<h3>(.*?)</h3>\n<p>(.*?)</p>$", re.M | re.S)


def conteneur_tableau(corps):
    if '<div class="cc-table">' in corps:
        return corps, 0
    corps, n = TABLEAU.subn(
        lambda m: '<div class="cc-table">\n<table>%s</table>\n</div>'
                  % m.group(1),
        corps)
    return corps, n


def depliants(corps):
    if "cc-faq-list" in corps:
        return corps, 0
    debut = DEBUT_FAQ.search(corps)
    if not debut:
        return corps, 0

    tete, queue = corps[:debut.end()], corps[debut.end():]
    paires = PAIRE.findall(queue)
    if not paires:
        return corps, 0

    # Ce qui suit la dernière paire — l'appel à l'action de fin d'article —
    # reste en place, après le dépliant.
    fin = queue[PAIRE.search(queue).start():]
    for q, r in paires:
        fin = fin.replace("<h3>%s</h3>\n<p>%s</p>" % (q, r), "", 1)

    blocs = []
    for i, (q, r) in enumerate(paires):
        blocs.append(
            "<details%s>\n<summary><h3 class=\"cc-faq-list__q\">%s</h3></summary>"
            "\n<p>%s</p>\n</details>" % (" open" if i == 0 else "", q, r))

    liste = "\n<div class=\"cc-faq-list\">\n%s\n</div>\n" % "\n".join(blocs)
    return tete + liste + fin.strip("\n") + "\n", len(paires)


def reponse(corps):
    if "cc-answer" in corps:
        return corps, 0
    if not corps.startswith("<p>"):
        return corps, 0
    return corps.replace("<p>", '<p class="cc-answer">', 1), 1


def main():
    total = {"tableau": 0, "faq": 0, "reponse": 0}
    for handle in ARTICLES:
        chemin = DOSSIER / ("%s.html" % handle)
        corps = chemin.read_text(encoding="utf-8")
        avant = corps

        corps, a = reponse(corps)
        corps, b = conteneur_tableau(corps)
        corps, c = depliants(corps)
        total["reponse"] += a
        total["tableau"] += b
        total["faq"] += c

        if corps != avant:
            chemin.write_text(corps, encoding="utf-8")
            print("%-68s réponse:%d tableau:%d questions:%d"
                  % (handle, a, b, c))
        else:
            print("%-68s déjà au format" % handle)

    print("\n%d réponses signalées, %d tableaux mis en conteneur, "
          "%d questions passées en dépliant"
          % (total["reponse"], total["tableau"], total["faq"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
