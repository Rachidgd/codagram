#!/usr/bin/env python3
"""
Corrections SEO et de crédibilité issues de la réunion du 8 août 2026.

Quatre familles, toutes vérifiées dans le code avant écriture.

1. Douze fils d'Ariane annonçaient une rubrique qui n'existe pas. Sept pages
   affichaient « Expertises », cinq « Audits » — or aucune page ne porte ces
   noms. Le lien remontait donc vers une page sœur prise au hasard : depuis
   « Agence SEO », cliquer « Expertises » menait à « Agence Shopify », et
   inversement. Le niveau intermédiaire est supprimé ; le fil affiché
   correspond alors au BreadcrumbList émis dans la même page, qui n'a jamais
   déclaré que deux niveaux.

2. Les quatorze pages villes déclaraient « SEO local » comme parent. C'est
   une prestation sœur, pas leur parent. Leur parent réel est le hub qui les
   liste toutes et d'où vient le visiteur. Effet secondaire recherché :
   quinze liens de plus vers ce hub, qui n'en recevait aucun des menus.

3. Deux H1 à reprendre. Celui du Luxembourg ne contient ni « agence seo » ni
   « Luxembourg », alors que « agence seo luxembourg » est la cible la plus
   accessible du site (KD 7, la plus basse mesurée). Celui de la page mère
   des sites vitrines promet « des demandes chaque semaine » : une promesse
   de fréquence, donc de résultat, qu'aucun des deux cas documentés n'étaye.

4. Le premier écran de l'accueil affichait deux chiffres sans propriétaire,
   dont un mal nommé : « 350 % visites depuis Google » alors que la source
   est un relevé de clics. Les chiffres reprennent leur nom de client, et le
   second cas apparaît enfin dès le premier écran au lieu de dormir cinq
   sections plus bas.

Le script refuse d'écrire si une valeur attendue ne correspond pas.
"""
import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"

# Les rubriques qui n'existent pas : le niveau intermédiaire disparaît.
RUBRIQUES_FANTOMES = {"Expertises", "Audits"}

# Le hub des villes est le parent réel des pages géographiques.
HUB_VILLES = ("Référencement par ville", "/pages/seo-par-ville")

# Les pages métiers et les pages création-ville partagent une vraie page mère,
# désignée sous deux libellés différents. Un nœud, un nom.
PARENT_SITE = ("Création de site vitrine", "/pages/creation-site-vitrine")

H1 = [
    ("page.agence-seo-luxembourg.json",
     "Un marché petit, riche, et multilingue par nécessité.",
     "Agence SEO au Luxembourg, sur un marché petit, riche et multilingue"),
    ("page.creation-site-vitrine.json",
     "Un site vitrine qui vous amène des demandes chaque semaine.",
     "Création de site vitrine : un site conçu pour déclencher la demande"),
]

# Premier écran de l'accueil. Chiffres relevés dans page.resultats.json :
# Noza & Co +169 % impressions / +144 % clics, mi-mai → juin 2026.
# Maison Ayla +236 % impressions / +350 % clics, avril → juin 2026.
ACCUEIL = [
    (("hero", "blocks", "t3", "settings", "text"),
     "Vos accès restent les vôtres", "Réponse sous 48 h ouvrées"),
    (("hero", "blocks", "r1", "settings", "label"),
     "affichages sur Google", "affichages Google — Maison Ayla"),
    (("hero", "blocks", "r2", "settings", "label"),
     "visites depuis Google", "clics Google — Maison Ayla"),
    (("hero", "blocks", "r3", "settings", "count_to"), "48", "169"),
    (("hero", "blocks", "r3", "settings", "prefix"), "", "+"),
    (("hero", "blocks", "r3", "settings", "suffix"), " h", " %"),
    (("hero", "blocks", "r3", "settings", "label"),
     "pour vous répondre", "affichages Google — Noza & Co"),
]


def descendre(racine, chemin):
    o = racine
    for k in chemin[:-1]:
        o = o[k]
    return o, chemin[-1]


def main():
    fautes, faits = [], []
    touches = {}

    def charger(nom):
        if nom not in touches:
            touches[nom] = json.loads((GABARITS / nom).read_text(encoding="utf-8"))
        return touches[nom]

    # --- 1 et 2 : les fils d'Ariane ---------------------------------------
    for chemin in sorted(GABARITS.glob("page.*.json")):
        nom = chemin.name
        donnees = charger(nom)
        hero = donnees.get("sections", {}).get("hero", {}).get("settings")
        if not isinstance(hero, dict):
            continue
        label = hero.get("parent_label")
        if not label:
            continue

        if label in RUBRIQUES_FANTOMES:
            hero["parent_label"] = ""
            hero["parent_url"] = ""
            faits.append((nom, "fil d'Ariane", "rubrique « %s » supprimée" % label))
        elif label == "SEO local":
            hero["parent_label"], hero["parent_url"] = HUB_VILLES
            faits.append((nom, "fil d'Ariane", "parent → hub des villes"))
        elif label in ("Création de site", "Création de site vitrine"):
            if (hero.get("parent_label"), hero.get("parent_url")) != PARENT_SITE:
                hero["parent_label"], hero["parent_url"] = PARENT_SITE
                faits.append((nom, "fil d'Ariane", "libellé unifié"))

    # --- 3 : les deux H1 ---------------------------------------------------
    for nom, attendu, voulu in H1:
        hero = charger(nom)["sections"]["hero"]["settings"]
        if hero.get("title") == voulu:
            continue
        if hero.get("title") != attendu:
            fautes.append("%s : H1 inattendu — %r" % (nom, hero.get("title")))
            continue
        if len(voulu) > 75:
            fautes.append("%s : H1 de %d caractères" % (nom, len(voulu)))
            continue
        hero["title"] = voulu
        faits.append((nom, "H1", "%d caractères" % len(voulu)))

    # --- 4 : le premier écran de l'accueil ---------------------------------
    accueil = json.loads((GABARITS / "index.json").read_text(encoding="utf-8"))
    modifie = False
    for chemin, attendu, voulu in ACCUEIL:
        parent, clef = descendre(accueil["sections"], chemin)
        if parent.get(clef) == voulu:
            continue
        if parent.get(clef) != attendu:
            fautes.append("index.json : %s vaut %r, attendu %r"
                          % (".".join(chemin), parent.get(clef), attendu))
            continue
        parent[clef] = voulu
        modifie = True
        faits.append(("index.json", ".".join(chemin[1:]), voulu or "vidé"))

    if fautes:
        print("REFUS — %d problème(s), aucun fichier écrit :" % len(fautes))
        for f in fautes:
            print("    " + f)
        return 1

    for nom, contenu in touches.items():
        (GABARITS / nom).write_text(
            json.dumps(contenu, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")
    if modifie:
        (GABARITS / "index.json").write_text(
            json.dumps(accueil, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")

    for nom, quoi, detail in faits:
        print("  %-40s %-14s %s" % (nom.replace("page.", "")[:40], quoi, detail))
    print("\n%d corrections." % len(faits))
    return 0


if __name__ == "__main__":
    sys.exit(main())
