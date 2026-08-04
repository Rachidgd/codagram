#!/usr/bin/env python3
"""
Contrôle les articles retravaillés et prépare leur envoi à Shopify.

Le script refuse de produire le fichier d'envoi tant qu'un article contient un
lien mort, un marqueur de travail resté dans le texte, un titre de niveau 1
(le gabarit le pose déjà) ou une phrase recopiée d'un autre article.

Sortie : build/blog_push.jsonl, à téléverser puis à passer à
bulkOperationRunMutation avec la mutation articleUpdate.
"""
import collections
import datetime
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "blog"
INDEX = RACINE / "blog_index.json"
PAGES = RACINE / "live_pages.json"
SORTIE = RACINE / "blog_push.jsonl"

# Les articles sont retravaillés aujourd'hui : la date de mise à jour le dit,
# au lecteur comme au balisage.
MAINTENANT = datetime.datetime.now(datetime.timezone.utc).replace(
    microsecond=0).isoformat()

BALISE = re.compile(r"<[^>]+>")
LIEN = re.compile(r'href="([^"]+)"')
PARA = re.compile(r"<p[^>]*>(.*?)</p>", re.I | re.S)

MARQUEURS = re.compile(
    r"CONTENU PILOTE|[ÀA] REMPLACER AVANT|\bTODO\b|\bFIXME\b|lorem ipsum|"
    r"\[à compléter\]|XXX")

# Étiquettes de pilotage interne : le lecteur n'a rien à en faire.
ETIQUETTES_INTERNES = {"Pilote éditorial"}

# Brouillon resté à l'état de coquille, dont le sujet est déjà couvert par deux
# articles en ligne. Il est laissé de côté ici : à supprimer côté Shopify.
ECARTES = {"creer-boutique-shopify-methode-prix-erreurs"}


def texte(fragment):
    return html.unescape(BALISE.sub(" ", fragment)).replace("\xa0", " ")


def mots(fragment):
    return len([m for m in re.split(r"\s+", texte(fragment)) if m])


def handles_pages():
    donnees = json.loads(PAGES.read_text(encoding="utf-8"))
    if isinstance(donnees, dict):
        donnees = donnees.get("pages", list(donnees.values()))
    return {p["handle"] for p in donnees}


def main():
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    pages = handles_pages()
    articles = {c.stem: c.read_text(encoding="utf-8")
                for c in sorted(DOSSIER.glob("*.html"))
                if c.stem not in ECARTES}
    erreurs = []

    # Les liens vers le blog doivent viser un article qui existe. La
    # publication est vérifiée séparément : un lien vers un brouillon reste un
    # lien mort tant que l'article n'est pas en ligne. Avec --publier, l'envoi
    # met les brouillons en ligne, donc ces liens ne sont plus morts.
    publier = "--publier" in sys.argv
    brouillons = set() if publier else {
        h for h, v in index.items() if not v["publie"]}

    phrases = collections.defaultdict(set)

    for handle, corps in articles.items():
        prefixe = "%s :" % handle

        if "<h1" in corps.lower():
            erreurs.append("%s un titre de niveau 1 dans le corps" % prefixe)

        trouve = MARQUEURS.search(texte(corps))
        if trouve:
            erreurs.append("%s marqueur de travail « %s »"
                           % (prefixe, trouve.group(0)))

        n = mots(corps)
        if n < 300:
            erreurs.append("%s %d mots seulement" % (prefixe, n))

        for url in LIEN.findall(corps):
            if url.startswith(("http", "mailto:", "tel:", "#")):
                continue
            if url == "/":
                erreurs.append("%s lien vers l'accueil sans ancre utile" % prefixe)
            elif url.startswith("/pages/"):
                cible = url.split("#")[0].rstrip("/").rsplit("/", 1)[-1]
                if cible not in pages:
                    erreurs.append("%s page inexistante %s" % (prefixe, url))
            elif url.startswith("/blogs/"):
                cible = url.split("#")[0].rstrip("/").rsplit("/", 1)[-1]
                if cible not in index:
                    erreurs.append("%s article inexistant %s" % (prefixe, url))
                elif cible in brouillons:
                    erreurs.append("%s renvoie vers un brouillon (%s)"
                                   % (prefixe, cible))
            elif url.startswith("/"):
                erreurs.append("%s lien interne non vérifiable %s" % (prefixe, url))

        for para in PARA.findall(corps):
            for phrase in re.split(r"(?<=[.!?])\s+", texte(para).strip()):
                phrase = phrase.strip()
                if len(phrase) > 60:
                    phrases[phrase].add(handle)

    recyclees = {p: sorted(h) for p, h in phrases.items() if len(h) > 1}
    for phrase, porteurs in sorted(recyclees.items())[:10]:
        erreurs.append("phrase recopiée dans %s : « %s… »"
                       % (", ".join(porteurs), phrase[:70]))

    if erreurs:
        print("REFUS — %d problème(s) :" % len(erreurs))
        for e in erreurs:
            print("   ", e)
        return 1

    faqs = json.loads((RACINE / "blog_faq.json").read_text(encoding="utf-8"))

    lignes = []
    for handle, corps in articles.items():
        fiche = index[handle]
        etiquettes = [t for t in fiche["etiquettes"]
                      if t not in ETIQUETTES_INTERNES]
        entree = {"body": corps, "tags": etiquettes}
        if publier and not fiche["publie"]:
            entree["isPublished"] = True
        champs = [{
            "namespace": "editorial",
            "key": "updated_at",
            "type": "date_time",
            "value": MAINTENANT,
        }]
        if handle in faqs:
            champs.append({
                "namespace": "editorial",
                "key": "faq",
                "type": "json",
                "value": json.dumps(faqs[handle]["faq"], ensure_ascii=False),
            })
        entree["metafields"] = champs
        lignes.append(json.dumps({"id": fiche["id"], "article": entree},
                                 ensure_ascii=False))

    SORTIE.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    volumes = sorted(mots(c) for c in articles.values())
    print("%d articles prêts — médiane %d mots, minimum %d, maximum %d"
          % (len(lignes), volumes[len(volumes) // 2], volumes[0], volumes[-1]))
    print("fichier d'envoi : %s (%d Ko)"
          % (SORTIE.name, SORTIE.stat().st_size // 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
