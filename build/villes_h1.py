#!/usr/bin/env python3
"""
Remet la requête cible dans le titre de niveau 1 des pages villes.

Ces pages sont indexées mais bloquées entre la 45e et la 100e place. Leur H1
est une accroche éditoriale — « Une ville jeune, connectée, qui vérifie tout
avant d'appeler. » — qui ne contient ni le métier ni la ville. Google n'a donc
aucun signal fort reliant la page à « agence seo rennes ».

L'accroche n'est pas perdue : le chapô (« lead ») la reprenait déjà en
substance sur toutes les pages vérifiées.

Requête retenue par ville : celle qui gagne à la fois en volume et en
difficulté, mesurée sur Semrush base fr le 6 août 2026. Lyon et Paris gardent
« consultant » parce que « agence seo paris » (KD 44) et « agence seo lyon »
(KD 34) sont hors de portée à ce stade, là où « consultant seo paris » tombe
à KD 18.
"""
import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"

# gabarit : (nouveau H1, requête visée, volume, KD)
VILLES = {
    "page.seo-nice.json": (
        "Agence SEO à Nice, pour une clientèle saisonnière et internationale",
        "agence seo nice", 1600, 13),
    "page.seo-grenoble.json": (
        "Agence SEO à Grenoble, sur des marchés où l'expertise se démontre",
        "agence seo grenoble", 1000, 18),
    "page.seo-paris.json": (
        "Consultant SEO à Paris, sur le marché le plus disputé de France",
        "consultant seo paris", 1900, 18),
    "page.seo-montpellier.json": (
        "Agence SEO à Montpellier et dans les communes voisines",
        "agence seo montpellier", 1900, 19),
    "page.seo-lyon.json": (
        "Consultant SEO à Lyon, pour capter la demande locale",
        "consultant seo lyon", 2400, 19),
    "page.seo-rennes.json": (
        "Agence SEO à Rennes, pour un public qui compare avant d'appeler",
        "agence seo rennes", 1900, 21),
    "page.seo-lille.json": (
        "Agence SEO à Lille, sur un bassin transfrontalier négligé",
        "agence seo lille", 2400, 23),
    "page.seo-local-nantes.json": (
        "Agence SEO à Nantes, pour capter les nouveaux arrivants",
        "agence seo nantes", 3600, 23),
    "page.seo-local-bordeaux.json": (
        "Agence SEO à Bordeaux, sur un marché devenu concurrentiel",
        "agence seo bordeaux", 2900, 23),
    "page.seo-local-marseille.json": (
        "Agence SEO à Marseille, où la recherche se joue au quartier",
        "agence seo marseille", 2400, 23),
    "page.seo-toulouse.json": (
        "Agence SEO à Toulouse, pour être trouvé par les donneurs d'ordre",
        "agence seo toulouse", 1600, 27),
    "page.seo-strasbourg.json": (
        "Agence SEO à Strasbourg, sur un marché bilingue",
        "agence seo strasbourg", 1600, 29),
    "page.seo-suisse.json": (
        "Consultant SEO en Suisse romande, canton par canton",
        "consultant seo suisse", None, None),
    "page.seo-belgique.json": (
        "Consultant SEO en Belgique francophone",
        "consultant seo belgique", None, None),
}


def normalise(texte):
    remplacements = {"à": "a", "é": "e", "è": "e", "ê": "e", "î": "i",
                     "ô": "o", "û": "u", "ç": "c", "'": " ", "’": " "}
    for a, b in remplacements.items():
        texte = texte.replace(a, b)
    return texte.lower()


def main():
    erreurs, faits = [], []

    for nom, (titre, requete, volume, kd) in sorted(VILLES.items()):
        chemin = GABARITS / nom
        if not chemin.exists():
            erreurs.append("%s : gabarit introuvable" % nom)
            continue

        donnees = json.loads(chemin.read_text(encoding="utf-8"))
        hero = donnees.get("sections", {}).get("hero", {}).get("settings")
        if hero is None:
            erreurs.append("%s : pas de section hero" % nom)
            continue

        # Le H1 doit contenir chaque mot de la requête, sinon le changement
        # ne sert à rien : c'est tout l'objet de la correction.
        cible, dans_titre = normalise(requete).split(), normalise(titre)
        absents = [m for m in cible if m not in dans_titre]
        if absents:
            erreurs.append("%s : « %s » absent du H1 proposé"
                           % (nom, " ".join(absents)))
            continue

        if len(titre) > 75:
            erreurs.append("%s : H1 de %d caractères, trop long"
                           % (nom, len(titre)))
            continue

        ancien = hero.get("title", "")
        if ancien == titre:
            faits.append((nom, "déjà à jour", requete))
            continue

        hero["title"] = titre
        chemin.write_text(json.dumps(donnees, ensure_ascii=False, indent=2)
                          + "\n", encoding="utf-8")
        faits.append((nom, ancien, requete))

    if erreurs:
        print("REFUS — %d problème(s) :" % len(erreurs))
        for e in erreurs:
            print("   ", e)
        return 1

    for nom, ancien, requete in faits:
        print("%-32s → %s" % (nom.replace("page.", "").replace(".json", ""),
                              requete))
    print("\n%d titres de niveau 1 réalignés sur leur requête." % len(faits))
    return 0


if __name__ == "__main__":
    sys.exit(main())
