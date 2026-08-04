#!/usr/bin/env python3
"""
Sort les corps d'articles dans build/blog/ pour pouvoir les retravailler.

Un fichier HTML par article, indenté ligne à ligne pour que les retouches
restent lisibles dans un diff. build/blog_index.json garde la correspondance
handle → identifiant Shopify, titre et état de publication.
"""
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
SOURCE = RACINE / "articles_raw.jsonl"
DOSSIER = RACINE / "blog"

BLOCS = ("p", "h2", "h3", "h4", "ul", "ol", "li", "table", "thead", "tbody",
         "tr", "th", "td", "div", "details", "summary", "figure", "figcaption",
         "blockquote")
OUVRANT = re.compile(r"(<(?:%s)[\s>])" % "|".join(BLOCS), re.I)
FERMANT = re.compile(r"(</(?:%s)>)" % "|".join(BLOCS), re.I)


def aerer(corps):
    """Une balise de bloc par ligne : les retouches restent lisibles."""
    corps = OUVRANT.sub(r"\n\1", corps)
    corps = FERMANT.sub(r"\1\n", corps)
    lignes = [l.strip() for l in corps.split("\n")]
    return "\n".join(l for l in lignes if l) + "\n"


def main():
    DOSSIER.mkdir(exist_ok=True)
    index = {}
    for ligne in SOURCE.read_text(encoding="utf-8").splitlines():
        if not ligne.strip():
            continue
        a = json.loads(ligne)
        (DOSSIER / ("%s.html" % a["handle"])).write_text(
            aerer(a["body"] or ""), encoding="utf-8")
        index[a["handle"]] = {
            "id": a["id"],
            "titre": a["title"],
            "resume": a.get("summary") or "",
            "etiquettes": a.get("tags") or [],
            "publie": bool(a.get("isPublished")),
        }
    (RACINE / "blog_index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8")
    print("%d articles sortis dans %s" % (len(index), DOSSIER))
    return 0


if __name__ == "__main__":
    sys.exit(main())
