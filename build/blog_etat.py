#!/usr/bin/env python3
"""État des articles retravaillés dans build/blog/ : volume et structure."""
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
BALISE = re.compile(r"<[^>]+>")
SEUIL = 900


def mots(t):
    return len([m for m in re.split(r"\s+", html.unescape(BALISE.sub(" ", t))) if m])


def main():
    index = json.loads((RACINE / "blog_index.json").read_text(encoding="utf-8"))
    restant = []
    print("%-56s %5s %3s %3s %3s %3s %s" % ("article", "mots", "h2", "h3", "tab", "rep", "état"))
    for chemin in sorted((RACINE / "blog").glob("*.html")):
        t = chemin.read_text(encoding="utf-8")
        n = mots(t)
        if n < SEUIL:
            restant.append(chemin.stem)
        print("%-56s %5d %3d %3d %3d %3d %s" % (
            chemin.stem[:56], n, t.count("<h2"), t.count("<h3"),
            t.count("<table"), t.count('class="cc-answer"'),
            "publié" if index.get(chemin.stem, {}).get("publie") else "brouillon"))
    print("\n%d articles encore sous %d mots :" % (len(restant), SEUIL))
    for h in restant:
        print("   ", h)
    return 0


if __name__ == "__main__":
    sys.exit(main())
