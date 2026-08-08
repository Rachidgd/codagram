#!/usr/bin/env python3
"""
Corrections issues de la relecture rédactionnelle du 8 août 2026.

Trois familles de fautes, et elles ont un point commun : le site énonce une
règle sur une page et l'enfreint sur une autre. Ce n'est pas un défaut
d'écriture, c'est un défaut de relecture transverse.

1. La preuve. La page « Résultats » publiait un troisième cas — client
   « Création web », période « Site vitrine ou boutique », résultat
   « 1 objectif ». Ni client, ni période, ni résultat : un bloc de
   remplissage au format des deux cas réels. La page « Études de cas » écrit
   pourtant noir sur blanc que nous renonçons à publier quand l'un de ces
   éléments manque. Et la page « Agence SEO » republiait les chiffres de
   Maison Ayla sans son nom, sans période, en renommant « clics » en
   « visites » — deux métriques différentes.

2. Les arguments bannis. « Accès à votre nom » avait été purgé des balises
   mais pas des pages : il restait en mention de réassurance sur les six
   pages création-ville.

3. Les fautes de langue et de logique : deux pronoms sans antécédent, un
   comparatif inversé, « Le avant-après », un surtitre identique à son titre,
   une ligne de tableau dont les deux colonnes disaient la même chose.

Le script refuse de modifier un champ dont la valeur actuelle ne correspond
pas exactement à ce qui est attendu. Une correction appliquée à l'aveugle sur
un fichier qui a bougé ferait plus de dégâts que la faute d'origine.
"""
import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"

VILLES = ["lille", "lyon", "marseille", "nantes", "nice", "strasbourg"]

# (fichier, chemin dans « sections », valeur attendue, valeur voulue)
REMPLACEMENTS = [
    # --- La preuve -------------------------------------------------------
    ("page.resultats.json", ("cas", "settings", "title"),
     "Trois situations, trois points de départ différents.",
     "Deux missions, documentées du point de départ à la période observée."),

    ("page.resultats.json", ("cta", "settings", "title"),
     "Le point de départ de chacun de ces clients.",
     "Vous êtes là où ces deux clients étaient il y a six mois."),

    ("page.resultats.json", ("cta", "settings", "text"),
     "Décrivez-la en quatre questions. Nous revenons avec une lecture "
     "argumentée de ce qui limite aujourd'hui votre acquisition.",
     "Décrivez votre situation en quatre questions. Nous revenons avec une "
     "lecture argumentée de ce qui limite aujourd'hui votre acquisition."),

    ("page.resultats.json", ("lecture", "settings", "eyebrow"),
     "Comment lire ces chiffres", "Méthode de lecture"),

    ("page.resultats.json", ("clients", "settings", "title"),
     "Quelques-uns des sites que nous avons construits",
     "Quelques-uns des sites que nous avons construits."),

    # --- Langue et logique -----------------------------------------------
    ("page.agence-shopify.json", ("probleme", "settings", "title"),
     "Vos ventes se perdent entre le panier et le paiement.",
     "Vos ventes se perdent avant le paiement, pas pendant."),

    ("page.agence-shopify.json", ("probleme", "settings", "text"),
     "<p>Elles les perdent entre l'arrivée sur la fiche produit et le "
     "paiement. Un thème acheté puis rallongé d'une dizaine d'applications "
     "produit exactement cela. Une page lente, un message flou, et rien pour "
     "rassurer au moment où le doute apparaît.</p><p>Nous reprenons ce trajet "
     "dans l'ordre où le client le vit — et nous supprimons ce qui "
     "l'interrompt.</p>",
     "<p>La plupart des boutiques cherchent le problème au moment du "
     "paiement. Il est presque toujours en amont, entre l'arrivée sur la "
     "fiche produit et le panier. Une page lente, un message flou, et rien "
     "pour rassurer à l'instant où le doute apparaît.</p><p>Nous reprenons ce "
     "trajet dans l'ordre où le client le vit — et nous supprimons ce qui "
     "l'interrompt.</p>"),

    ("page.optimisation-cro.json", ("format", "settings", "text"),
     "Le premier donne une carte, le second parcourt le chemin. Ils ne "
     "s'adressent pas aux mêmes situations.",
     "Le premier parcourt le chemin avec vous, le second vous en donne la "
     "carte. Ils ne s'adressent pas aux mêmes situations."),

    ("page.site-vitrine-artisan.json", ("deroule", "blocks", "s3", "settings", "text"),
     "Nous vous disons quoi photographier avec votre téléphone. Le "
     "avant-après vaut tous les arguments.",
     "Nous vous disons quoi photographier avec votre téléphone. L'avant-après "
     "vaut tous les arguments."),

    ("page.seo-ecommerce.json", ("comparaison", "settings", "text"),
     "La réponse dépend de la taille du catalogue et de la notoriété de vos "
     "marques.",
     "Le catalogue et la notoriété de vos marques déplacent le curseur, mais "
     "rarement l'ordre."),

    ("page.creation-site-vitrine.json", ("position", "settings", "quote"),
     "Un site vitrine se juge à une seule chose : le nombre de personnes qui "
     "vous écrivent après l'avoir lu. Tout le reste — animations, mentions, "
     "palmarès — n'est utile que s'il sert cette phrase.",
     "Un site vitrine se juge à une seule chose : le nombre de personnes qui "
     "vous écrivent après l'avoir lu. Animations, distinctions, effets de "
     "style : tout le reste n'est utile que s'il sert ce chiffre-là."),

    # --- Tableaux qui ne comparent rien ----------------------------------
    ("page.creation-site-vitrine.json", ("choix", "blocks", "r6", "settings", "value_a"),
     "Vous modifiez les contenus", "Vous modifiez tout, y compris la structure"),
    ("page.creation-site-vitrine.json", ("choix", "blocks", "r6", "settings", "value_b"),
     "Vous modifiez les contenus", "Vous modifiez les contenus, pas le cadre"),
    ("page.site-vitrine-pme-tpe.json", ("choix", "blocks", "r5", "settings", "value_b"),
     "Contenu", "Nettement plus faible"),

    # --- Répétitions ------------------------------------------------------
    ("page.a-propos.json", ("faq", "blocks", "q1", "settings", "answer"),
     "<p>Une à deux, selon le périmètre, et toujours les mêmes du début à la "
     "fin. Vous gardez le même interlocuteur du début à la fin, sans réunion "
     "de passation. C'est aussi ce qui limite le nombre de clients que nous "
     "prenons en même temps.</p>",
     "<p>Une à deux, selon le périmètre, et toujours les mêmes du début à la "
     "fin — sans réunion de passation ni changement d'interlocuteur en cours "
     "de route. C'est aussi ce qui limite le nombre de clients que nous "
     "prenons en même temps.</p>"),

    ("page.reserver.json", ("demande", "settings", "text"),
     "Nous préparons l'analyse avant l'appel. Donnez-nous simplement de quoi "
     "vous recontacter et regarder votre site.",
     "Donnez-nous simplement de quoi vous recontacter et regarder votre site."),

    ("page.reserver.json", ("deroule", "blocks", "s1", "settings", "text"),
     "Quatre questions dans le formulaire. Cela nous permet de préparer "
     "l'analyse avant l'appel.",
     "Quatre questions dans le formulaire. Elles suffisent à savoir où "
     "chercher."),

    ("page.reserver.json", ("cta", "settings", "title"),
     "Décrivez votre situation, nous préparons l'analyse.",
     "Dites-nous où vous en êtes, nous regardons avant de vous rappeler."),

    # --- Affirmation non documentée --------------------------------------
    ("page.site-vitrine-artisan.json", ("faq", "blocks", "q2", "settings", "answer"),
     "<p>Pas nécessairement un tarif exact, mais un ordre de grandeur ou un "
     "montant minimum d'intervention, oui. C'est ce qui écarte les demandes "
     "irréalistes avant qu'elles ne vous coûtent un déplacement. Les artisans "
     "qui franchissent ce pas reçoivent moins d'appels et signent "
     "davantage.</p>",
     "<p>Pas nécessairement un tarif exact, mais un ordre de grandeur ou un "
     "montant minimum d'intervention, oui. C'est ce qui écarte les demandes "
     "irréalistes avant qu'elles ne vous coûtent un déplacement. C'est le "
     "point sur lequel nous insistons le plus, et celui sur lequel on nous "
     "résiste le plus.</p>"),

    # --- Section sans titre, titre sans point ----------------------------
    ("page.site-vitrine-artisan.json", ("perimetre", "settings", "title"),
     "", "Six éléments, et l'ordre compte."),
    ("page.sitemap.json", ("plan", "settings", "title"),
     "Toutes les pages du site", "Toutes les pages du site."),
]

# « Accès à votre nom » : une condition normale d'une prestation correcte,
# pas un argument. Purgé des balises le 8 août, il restait ici.
for _v in VILLES:
    REMPLACEMENTS.append(
        ("page.creation-site-%s.json" % _v, ("cta", "blocks", "r2", "settings", "text"),
         "Accès à votre nom", "Devis détaillé poste par poste"))

# Le bandeau chiffré de la page d'accueil des sites vitrines argumentait sur
# l'absence de constructeur de pages : le procédé, pas le résultat.
BANDEAUX = [
    ("page.creation-site-vitrine.json", ("hero", "blocks", "p1", "settings"),
     {"prefix": "", "value": "0", "suffix": "", "label": "constructeur de pages"},
     {"prefix": "", "value": "5", "suffix": " étapes", "label": "avec validation à chacune"}),
    ("page.creation-site-vitrine.json", ("hero", "blocks", "p2", "settings"),
     {"prefix": "", "value": "100", "suffix": " %", "label": "code écrit pour vous"},
     {"prefix": "", "value": "2", "suffix": " tours", "label": "de corrections au contrat"}),
    # Les chiffres de Maison Ayla n'ont rien à faire ici sans son nom ni sa
    # période, et « clics » y était devenu « visites ».
    ("page.agence-seo.json", ("hero", "blocks", "p1", "settings"),
     {"prefix": "+", "value": "236", "suffix": " %", "label": "affichages Google en 3 mois"},
     {"prefix": "", "value": "1", "suffix": " page", "label": "par intention de recherche"}),
    ("page.agence-seo.json", ("hero", "blocks", "p2", "settings"),
     {"prefix": "+", "value": "350", "suffix": " %", "label": "visites depuis Google"},
     {"prefix": "", "value": "3", "suffix": " priorités", "label": "chiffrées au diagnostic"}),
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
            touches[nom] = json.loads(
                (GABARITS / nom).read_text(encoding="utf-8"))
        return touches[nom]

    for nom, chemin, attendu, voulu in REMPLACEMENTS + BANDEAUX:
        if not (GABARITS / nom).exists():
            fautes.append("%s : gabarit introuvable" % nom)
            continue
        d = charger(nom)
        try:
            parent, clef = descendre(d["sections"], chemin)
            actuel = parent[clef]
        except (KeyError, IndexError, TypeError):
            fautes.append("%s : chemin %s introuvable" % (nom, ".".join(map(str, chemin))))
            continue
        if actuel == voulu:
            faits.append((nom, ".".join(map(str, chemin)), "déjà corrigé"))
            continue
        if actuel != attendu:
            fautes.append("%s : %s a une valeur inattendue\n        attendu : %s\n        trouvé  : %s"
                          % (nom, ".".join(map(str, chemin)),
                             json.dumps(attendu, ensure_ascii=False)[:90],
                             json.dumps(actuel, ensure_ascii=False)[:90]))
            continue
        parent[clef] = voulu
        faits.append((nom, ".".join(map(str, chemin)), "corrigé"))

    # Le troisième « cas » de la page Résultats n'a ni client, ni période, ni
    # résultat. Il part, et le titre de section qui annonçait trois cas aussi.
    d = charger("page.resultats.json")
    cas = d["sections"]["cas"]
    if "c3" in cas.get("blocks", {}):
        client = cas["blocks"]["c3"]["settings"].get("client")
        if client != "Création web":
            fautes.append("page.resultats.json : le bloc c3 n'est pas celui attendu (%r)" % client)
        else:
            del cas["blocks"]["c3"]
            cas["block_order"] = [b for b in cas["block_order"] if b != "c3"]
            faits.append(("page.resultats.json", "cas.blocks.c3", "supprimé"))

    if fautes:
        print("REFUS — %d problème(s), aucun fichier écrit :" % len(fautes))
        for f in fautes:
            print("    " + f)
        return 1

    for nom, contenu in touches.items():
        (GABARITS / nom).write_text(
            json.dumps(contenu, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")

    corriges = [f for f in faits if f[2] != "déjà corrigé"]
    for nom, chemin, etat in faits:
        print("  %-9s %-34s %s" % (etat, nom.replace("page.", "")[:34], chemin))
    print("\n%d champs corrigés dans %d gabarits."
          % (len(corriges), len(touches)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
