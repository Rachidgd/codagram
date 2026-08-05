#!/usr/bin/env python3
"""
Sort les questions-réponses des articles pour le balisage FAQPage.

Le corps d'un article porte sa FAQ en HTML dépliable ; Google ne la reconnaît
comme FAQPage que si elle est aussi déclarée en données structurées. Plutôt
que de faire analyser du HTML au gabarit, on range les paires dans un
métachamp editorial.faq et structured-data.liquid les lit telles quelles.

Produit build/blog_faq.json, prêt à passer à metafieldsSet.
"""
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "blog"
INDEX = RACINE / "blog_index.json"
SORTIE = RACINE / "blog_faq.json"

BALISE = re.compile(r"<[^>]+>")

# Une balise remplacée par une espace laisse une trace là où le français n'en
# veut pas : « le travail d' optimisation CRO . » quand la réponse contenait un
# lien. Le point et la virgule ne prennent jamais d'espace avant ; l'apostrophe
# et la parenthèse ouvrante jamais après. Les autres signes en prennent une,
# insécable, et sont laissés tranquilles.
COLLE_AVANT = re.compile(r"\s+([.,)\]…])")
COLLE_APRES = re.compile(r"(['’(\[])\s+")
PAIRE = re.compile(
    r"<details[^>]*>\s*<summary[^>]*>(.*?)</summary>\s*(.*?)\s*</details>",
    re.I | re.S)

# Six articles longs posent leur FAQ en titres de niveau 3 suivis d'un
# paragraphe, sans dépliant. On ne lit ce format qu'après le titre « FAQ »,
# pour ne pas confondre une section de fond avec une question.
DEBUT_FAQ = re.compile(r"<h2[^>]*>\s*FAQ\s*</h2>", re.I)
PAIRE_PLATE = re.compile(r"<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>", re.I | re.S)

# Google refuse une réponse vide et tronque au-delà de quelques centaines de
# caractères : au-delà, autant ne pas la déclarer.
MAX = 900


def texte(fragment):
    brut = " ".join(html.unescape(BALISE.sub(" ", fragment)).split())
    return COLLE_APRES.sub(r"\1", COLLE_AVANT.sub(r"\1", brut))


def main():
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    sortie, sans_faq, ignorees = {}, [], 0

    for chemin in sorted(DOSSIER.glob("*.html")):
        handle = chemin.stem
        if handle not in index:
            continue
        corps = chemin.read_text(encoding="utf-8")
        brutes = PAIRE.findall(corps)
        if not brutes:
            debut = DEBUT_FAQ.search(corps)
            if debut:
                brutes = PAIRE_PLATE.findall(corps[debut.end():])

        paires = []
        for question, reponse in brutes:
            q, r = texte(question), texte(reponse)
            if not q.endswith("?"):
                ignorees += 1
                continue
            if not q or not r:
                ignorees += 1
                continue
            if len(r) > MAX:
                ignorees += 1
                continue
            paires.append({"q": q, "r": r})
        if paires:
            sortie[handle] = {"id": index[handle]["id"], "faq": paires}
        else:
            sans_faq.append(handle)

    SORTIE.write_text(json.dumps(sortie, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")
    total = sum(len(v["faq"]) for v in sortie.values())
    print("%d articles avec FAQ, %d questions au total" % (len(sortie), total))
    if ignorees:
        print("%d paires écartées (vides ou trop longues)" % ignorees)
    if sans_faq:
        print("%d articles sans FAQ :" % len(sans_faq))
        for h in sans_faq:
            print("   ", h)
    return 0


if __name__ == "__main__":
    sys.exit(main())
