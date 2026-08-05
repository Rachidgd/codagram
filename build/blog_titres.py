#!/usr/bin/env python3
"""
Recale les titres sur les formulations réellement tapées.

L'audit Semrush a montré que six articles visaient une tournure sans volume
alors qu'une variante proche en concentrait des centaines. Le fond ne change
pas : seul le titre, qui décide de la requête sur laquelle la page concourt.

Le handle reste identique. Changer l'adresse d'un article publié demanderait
une redirection et casserait le maillage interne, pour un gain nul : Google
lit le titre, pas le nom de fichier.

Met à jour build/blog_index.json et produit build/blog_titres.json, qui porte
aussi la balise title à poser en métachamp global.title_tag.
"""
import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent

# handle : (titre affiché, balise title, requête visée, volume mensuel France)
TITRES = {
    "combien-coute-audit-seo": (
        "Prix d'un audit SEO en 2026 : tarifs, livrables et pièges à éviter",
        "Prix d'un audit SEO en 2026 : tarifs et livrables",
        "prix audit seo", 880),

    "combien-coute-le-seo-en-2026-et-pourquoi-fuir-le-200-euros-par-mois": (
        "Tarif SEO en 2026 : les prix réels par prestation, "
        "et pourquoi fuir le 200 €/mois",
        "Tarif SEO 2026 : prix réels par prestation",
        "tarif seo", 720),

    "seo-ou-google-ads-par-quoi-commencer": (
        "SEO vs SEA : par quoi commencer selon votre budget et votre marché",
        "SEO vs SEA : par quoi commencer en 2026",
        "seo vs sea", 590),

    "collections-shopify-architecture-seo": (
        "SEO Shopify : l'architecture de collections qui fait ranker et vendre",
        "SEO Shopify : l'architecture de collections qui vend",
        "seo shopify", 480),

    "combien-coute-une-boutique-shopify": (
        "Prix d'une boutique Shopify en 2026 : les fourchettes réelles, "
        "poste par poste",
        "Prix d'une boutique Shopify en 2026, poste par poste",
        "boutique shopify", 1600),

    "balises-title-formules-ctr": (
        "Balise title : 15 formules qui augmentent le taux de clic "
        "(avec avant/après)",
        "Balise title : 15 formules qui font cliquer",
        "balise title", 590),

    # Ces deux-là partageaient 40 % de leur vocabulaire de titres et visaient
    # la même intention. Le premier prend la comparaison des formats, le second
    # la vérification avant signature : deux moments différents du parcours.
    "agence-seo-ou-consultant-seo": (
        "Consultant SEO ou agence : lequel choisir selon votre budget",
        "Consultant SEO ou agence : lequel choisir",
        "consultant seo", 6600),

    "comment-choisir-votre-agence-seo-sans-vous-faire-avoir": (
        "Les 7 critères pour vérifier une agence SEO avant de signer",
        "Vérifier une agence SEO : les 7 critères avant de signer",
        "vérifier agence seo", None),
}


def main():
    chemin = RACINE / "blog_index.json"
    index = json.loads(chemin.read_text(encoding="utf-8"))
    sortie = {}

    for handle, (titre, balise, requete, volume) in TITRES.items():
        if handle not in index:
            print("  absent de l'index :", handle)
            return 1
        if len(balise) > 60:
            print("  balise title trop longue (%d) : %s" % (len(balise), handle))
            return 1
        avant = index[handle]["titre"]
        index[handle]["titre"] = titre
        sortie[handle] = {
            "id": index[handle]["id"],
            "titre": titre,
            "title_tag": balise,
            "requete": requete,
            "volume": volume,
            "avant": avant,
        }
        print("%-56s %s" % (handle[:56],
                            "%s/mois" % volume if volume else "intention distincte"))
        print("   avant : %s" % avant)
        print("   après : %s" % titre)

    chemin.write_text(json.dumps(index, ensure_ascii=False, indent=2,
                                 sort_keys=True) + "\n", encoding="utf-8")
    (RACINE / "blog_titres.json").write_text(
        json.dumps(sortie, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("\n%d titres recalés" % len(sortie))
    return 0


if __name__ == "__main__":
    sys.exit(main())
