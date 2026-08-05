#!/usr/bin/env python3
"""
Étale la mise en ligne des brouillons, un article par jour.

Les articles déjà publiés reçoivent seulement leur nouveau corps : les
modifier ne crée aucun événement de publication. Les brouillons reçoivent en
plus une date de mise en ligne, décalée d'un jour à l'autre — Shopify les
révèle tout seul le jour dit.

L'ordre n'est pas alphabétique : passent d'abord les brouillons vers lesquels
un article déjà en ligne pointe. Tant qu'ils ne sont pas publiés, ces liens
sont morts pour un visiteur, donc chaque jour de retard se paie.

Produit un fichier de variables par article dans build/push/.
"""
import datetime
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "push"
LIEN_BLOG = re.compile(r'href="/blogs/[^/]+/([^"#?]+)')

# Première mise en ligne programmée, puis un article par jour à la même heure.
DEPART = datetime.datetime(2026, 8, 5, 7, 0, tzinfo=datetime.timezone.utc)


def main():
    index = json.loads((RACINE / "blog_index.json").read_text(encoding="utf-8"))
    faqs = json.loads((RACINE / "blog_faq.json").read_text(encoding="utf-8"))
    corps = {c.stem: c.read_text(encoding="utf-8")
             for c in sorted((RACINE / "blog").glob("*.html"))
             if c.stem in index}

    publies = {h for h, v in index.items() if v["publie"]}
    brouillons = [h for h in corps if h not in publies]

    # Un brouillon cité par un article déjà en ligne laisse un lien mort
    # visible aujourd'hui : il passe en tête de file.
    attendus = set()
    for h in publies:
        if h in corps:
            attendus.update(LIEN_BLOG.findall(corps[h]))
    # Puis ceux cités par d'autres brouillons : le lien se réparera de
    # lui-même, mais autant qu'il se répare tôt.
    cites = set()
    for h in brouillons:
        cites.update(LIEN_BLOG.findall(corps[h]))

    def rang(h):
        if h in attendus:
            return (0, h)
        if h in cites:
            return (1, h)
        return (2, h)

    file = sorted(brouillons, key=rang)

    for f in DOSSIER.glob("*.json"):
        f.unlink()

    titres = json.loads((RACINE / "blog_titres.json").read_text(encoding="utf-8"))
    champs = []

    calendrier, n = [], 0
    for i, handle in enumerate(sorted(corps), 1):
        article = {
            "title": index[handle]["titre"],
            "body": corps[handle].replace("\n", ""),
            "tags": [t for t in index[handle]["etiquettes"]
                     if t != "Pilote éditorial"],
        }
        champs.append({"ownerId": index[handle]["id"], "namespace": "editorial",
                       "key": "updated_date", "type": "date",
                       "value": datetime.date.today().isoformat()})
        if handle in faqs:
            champs.append({"ownerId": index[handle]["id"],
                           "namespace": "editorial", "key": "faq",
                           "type": "json",
                           "value": json.dumps(faqs[handle]["faq"],
                                               ensure_ascii=False)})
        if handle in titres:
            champs.append({"ownerId": index[handle]["id"],
                           "namespace": "global", "key": "title_tag",
                           "type": "single_line_text_field",
                           "value": titres[handle]["title_tag"]})
        quand = ""
        if handle in file:
            jour = DEPART + datetime.timedelta(days=file.index(handle))
            article["publishDate"] = jour.isoformat().replace("+00:00", "Z")
            quand = jour.strftime("%d/%m")
            n += 1
        (DOSSIER / ("%02d-%s.json" % (i, handle))).write_text(
            json.dumps({"id": index[handle]["id"], "article": article},
                       ensure_ascii=False), encoding="utf-8")
        calendrier.append((quand or "déjà en ligne", handle,
                           "prioritaire" if handle in attendus else ""))

    (RACINE / "blog_metafields.json").write_text(
        json.dumps(champs, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8")

    print("%d articles à envoyer, dont %d programmés, %d métachamps à poser"
          % (len(corps), n, len(champs)))
    print()
    for quand, handle, note in sorted(calendrier):
        print("  %-14s %-58s %s" % (quand, handle, note))

    manquants = sorted(set(corps) - set(faqs))
    if manquants:
        print("\nsans FAQ :", manquants)
    return 0


if __name__ == "__main__":
    sys.exit(main())
