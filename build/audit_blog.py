#!/usr/bin/env python3
"""
Audit des articles du blog.

Lit l'export en masse (build/articles_raw.jsonl) et mesure, pour chaque
article : le volume, la structure de titres, la présence d'une réponse courte
exploitable en extrait enrichi, d'un tableau, d'une FAQ, les liens internes et
les formules recyclées d'un article à l'autre.

Sortie : un tableau lisible et build/audit_blog.json pour la suite du travail.
"""
import collections
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
SOURCE = RACINE / "articles_raw.jsonl"

BALISE = re.compile(r"<[^>]+>")
TITRE = re.compile(r"<h([2-4])[^>]*>(.*?)</h\1>", re.I | re.S)
LIEN = re.compile(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.I | re.S)
PARA = re.compile(r"<p[^>]*>(.*?)</p>", re.I | re.S)
QUESTION = re.compile(r"<summary[^>]*>(.*?)</summary>", re.I | re.S)


def texte(fragment):
    return html.unescape(BALISE.sub(" ", fragment)).replace("\xa0", " ").strip()


def mots(fragment):
    return len([m for m in re.split(r"\s+", texte(fragment)) if m])


def charger():
    articles = []
    for ligne in SOURCE.read_text(encoding="utf-8").splitlines():
        if ligne.strip():
            articles.append(json.loads(ligne))
    return sorted(articles, key=lambda a: a["handle"])


def phrases_communes(articles, seuil=3):
    """Repère les phrases servies telles quelles dans plusieurs articles."""
    compte = collections.Counter()
    porteurs = collections.defaultdict(set)
    for a in articles:
        for para in PARA.findall(a["body"]):
            for phrase in re.split(r"(?<=[.!?])\s+", texte(para)):
                phrase = phrase.strip()
                if len(phrase) > 40:
                    compte[phrase] += 1
                    porteurs[phrase].add(a["handle"])
    return [(p, n, sorted(porteurs[p])) for p, n in compte.most_common() if n >= seuil]


def main():
    articles = charger()
    fiches = []

    for a in articles:
        corps = a["body"] or ""
        titres = [(int(n), texte(t)) for n, t in TITRE.findall(corps)]
        liens = [(url, texte(lab)) for url, lab in LIEN.findall(corps)]
        paras = PARA.findall(corps)
        intro = mots(paras[0]) if paras else 0

        internes = [u for u, _ in liens if u.startswith("/") or "clickscreation" in u]
        vers_accueil = [lab for u, lab in liens if u in ("/", "/#audit")]

        fiches.append({
            "handle": a["handle"],
            "titre": a["title"],
            "publie": bool(a.get("isPublished")),
            "etiquettes": a.get("tags") or [],
            "mots": mots(corps),
            "h2": sum(1 for n, _ in titres if n == 2),
            "h3": sum(1 for n, _ in titres if n == 3),
            "intro_mots": intro,
            "tableau": corps.count("<table") > 0,
            "liste": corps.count("<ul") + corps.count("<ol"),
            "faq": len(QUESTION.findall(corps)),
            "liens_internes": len(internes),
            "liens_accueil": vers_accueil,
            "cibles": sorted({u for u in internes}),
        })

    publies = [f for f in fiches if f["publie"]]
    brouillons = [f for f in fiches if not f["publie"]]

    print("=" * 78)
    print("AUDIT DU BLOG — %d articles (%d publiés, %d en brouillon)"
          % (len(fiches), len(publies), len(brouillons)))
    print("=" * 78)
    print("%-52s %5s %3s %3s %3s %4s %s" % ("article", "mots", "h2", "h3", "faq", "liens", "état"))
    for f in fiches:
        print("%-52s %5d %3d %3d %3d %4d %s" % (
            f["handle"][:52], f["mots"], f["h2"], f["h3"], f["faq"],
            f["liens_internes"], "publié" if f["publie"] else "BROUILLON"))

    volumes = sorted(f["mots"] for f in fiches)
    print("\nVolume : médiane %d mots, minimum %d, maximum %d"
          % (volumes[len(volumes) // 2], volumes[0], volumes[-1]))
    print("Sous 900 mots : %d articles" % sum(1 for f in fiches if f["mots"] < 900))
    print("Sans aucun H3 : %d articles" % sum(1 for f in fiches if f["h3"] == 0))
    print("Sans tableau : %d articles" % sum(1 for f in fiches if not f["tableau"]))
    print("Sans FAQ : %d articles" % sum(1 for f in fiches if f["faq"] == 0))

    ancres = collections.Counter()
    for f in fiches:
        for lab in f["liens_accueil"]:
            ancres[lab] += 1
    if ancres:
        print("\nLiens vers l'accueil, par libellé d'ancre :")
        for lab, n in ancres.most_common():
            print("   %3d × « %s »" % (n, lab))

    cibles = collections.Counter()
    for f in fiches:
        for u in f["cibles"]:
            cibles[u] += 1
    print("\nDestinations internes citées :")
    for u, n in cibles.most_common(20):
        print("   %3d × %s" % (n, u))

    communes = phrases_communes(fiches and articles)
    if communes:
        print("\nPhrases recyclées d'un article à l'autre :")
        for phrase, n, ou in communes[:12]:
            print("   %2d × %s" % (n, phrase[:110]))

    (RACINE / "audit_blog.json").write_text(
        json.dumps(fiches, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
