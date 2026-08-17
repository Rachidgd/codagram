#!/usr/bin/env python3
"""
Passe typographique française sur les gabarits et les articles.

Deux fautes présentes partout, zéro exception : l'apostrophe droite du
clavier américain au lieu de l'apostrophe française, et l'espace ordinaire
devant les ponctuations doubles. La seconde se voit à l'œil nu sur mobile :
un « ? » ou un « » » se retrouve seul en début de ligne, parce que rien
n'empêche le navigateur de couler là. Sur les quarante-six questions de FAQ
du site, cela arrive souvent.

Ce que le script pose :
  ’  U+2019  apostrophe typographique, pour toutes les élisions
  ␯  U+202F  espace fine insécable, devant ? ! ; et autour des guillemets
  ␠  U+00A0  espace insécable, devant les deux-points

Les gabarits sont traités en JSON — on parcourt les chaînes, on ne touche
jamais la structure. Les articles sont du HTML : on a vérifié qu'aucune
apostrophe n'y sert de délimiteur d'attribut avant d'y toucher.
"""
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"
ARTICLES = RACINE / "build" / "blog"

FINE = " "   # espace fine insécable
DURE = " "   # espace insécable

# Élision : apostrophe entre une lettre et une lettre, ou une lettre et une
# balise ouvrante (« d'<strong>audit</strong> » existe dans les articles).
ELISION = re.compile(r"(?<=[A-Za-zÀ-ÖØ-öø-ÿ])'(?=[A-Za-zÀ-ÖØ-öø-ÿ<])")
AVANT_FINE = re.compile(r"[  ]+(?=[?!;»])")
APRES_GUILLEMET = re.compile(r"«[  ]+")
AVANT_DEUX_POINTS = re.compile(r" +(?=:)")


def corriger(texte):
    texte = ELISION.sub("’", texte)
    texte = AVANT_FINE.sub(FINE, texte)
    texte = APRES_GUILLEMET.sub("«" + FINE, texte)
    texte = AVANT_DEUX_POINTS.sub(DURE, texte)
    return texte


def parcourir(objet, compteur):
    if isinstance(objet, str):
        neuf = corriger(objet)
        if neuf != objet:
            compteur[0] += 1
        return neuf
    if isinstance(objet, dict):
        return {k: parcourir(v, compteur) for k, v in objet.items()}
    if isinstance(objet, list):
        return [parcourir(v, compteur) for v in objet]
    return objet


def main():
    total_champs = total_fichiers = 0

    for chemin in sorted(GABARITS.glob("*.json")):
        avant = chemin.read_text(encoding="utf-8")
        donnees = json.loads(avant)
        compteur = [0]
        donnees = parcourir(donnees, compteur)
        if not compteur[0]:
            continue
        apres = json.dumps(donnees, ensure_ascii=False, indent=2) + "\n"
        chemin.write_text(apres, encoding="utf-8")
        total_champs += compteur[0]
        total_fichiers += 1

    total_articles = 0
    for chemin in sorted(ARTICLES.glob("*.html")):
        avant = chemin.read_text(encoding="utf-8")
        apres = corriger(avant)
        if apres != avant:
            chemin.write_text(apres, encoding="utf-8")
            total_articles += 1

    print("Gabarits : %d champs repris dans %d fichiers."
          % (total_champs, total_fichiers))
    print("Articles : %d fichiers repris." % total_articles)

    # Contrôle : plus une seule apostrophe droite en position d'élision, plus
    # une seule espace ordinaire devant une ponctuation double.
    restes = []
    for chemin in list(GABARITS.glob("*.json")) + list(ARTICLES.glob("*.html")):
        t = chemin.read_text(encoding="utf-8")
        if ELISION.search(t):
            restes.append("%s : apostrophe droite" % chemin.name)
        if re.search(r"(?<![  ]) (?=[?!;»])", t):
            restes.append("%s : espace ordinaire avant ponctuation double" % chemin.name)
    if restes:
        print("\nRESTES — %d :" % len(restes))
        for r in restes[:20]:
            print("   ", r)
        return 1
    print("\nContrôle : aucune apostrophe droite, aucune espace ordinaire "
          "devant une ponctuation double.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
