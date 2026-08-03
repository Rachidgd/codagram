#!/usr/bin/env python3
"""
Audit du texte : promesse, bénéfice, naturel.

Ce script ne juge pas le style, il mesure quatre choses vérifiables :

1. Le lexique creux — les mots d'agence et les tournures d'IA qui ne disent
   rien au prospect. Chaque occurrence est signalée avec sa page.
2. Le sujet de la phrase — un texte qui parle surtout de « nous » ne parle pas
   au prospect. On compte vous/votre/vos contre nous/notre/nos.
3. La promesse en haut de page — le hero doit contenir un gain nommé
   (demandes, clients, trafic, ventes, appels…), sinon le visiteur ne sait pas
   ce qu'il vient chercher.
4. La friction — phrases trop longues, qui se relisent deux fois.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
TEMPLATES = HERE.parent / "theme" / "templates"

# Tournures qui ne veulent rien dire pour un prospect. Chacune a été relevée
# soit dans le texte du site, soit dans le registre des sites d'agence.
LEXIQUE_CREUX = [
    # abstractions d'agence
    # « accompagnement » seul décrit un vrai format de mission : ce n'est pas
    # un mot creux. Seules les formules toutes faites le sont.
    "levier", "activer", "déployer", "démarche", "approche globale", "solution",
    "accompagnement personnalisé", "accompagnement sur mesure",
    "problématique", "écosystème", "univers", "synergie",
    "clé en main", "sur-mesure", "savoir-faire", "expertise reconnue",
    "état de l'art", "bonnes pratiques", "présence en ligne", "visibilité optimale",
    "stratégie gagnante", "passer à la vitesse supérieure", "franchir un cap",
    "nouvelle dimension", "au cœur de", "au service de", "à vos côtés",
    # superlatifs vides
    "booster", "propulser", "dopez", "révolutionner", "incontournable",
    "véritable", "unique en son genre", "leader du marché", "100 % personnalisé",
    # connecteurs et remplissage de rédaction automatique
    "dans un monde", "à l'ère du", "aujourd'hui plus que jamais",
    "il est essentiel", "il est important de", "il convient de",
    "force est de constater", "en effet,", "par ailleurs,", "en somme",
    "n'hésitez pas", "nous vous accompagnons", "notre équipe passionnée",
    "grâce à notre expertise",
]

# Un gain nommé : ce que le prospect obtient, pas ce que nous faisons.
GAINS = [
    "demande", "client", "trafic", "vente", "appel", "devis", "rendez-vous",
    "commande", "chiffre d'affaires", "panier", "acheteur", "prospect",
    "visiteur", "contact", "revenu", "marge", "position", "visible", "trouv",
    "gagner", "remplir", "vendre", "attirer", "convertir",
]

CHAMPS = ("eyebrow", "title", "title_accent", "lead", "text", "answer", "note",
          "cta_label", "cta_primary", "cta_secondary", "label", "question",
          "symptom", "lever", "point_1", "point_2", "point_3", "context",
          "action", "deliverable", "source", "value", "duration")

MOTS_LONGS = 28

# Un procédé de rédaction répété d'une page à l'autre finit par sonner
# automatique, même quand chaque phrase prise seule est bonne. On compte donc
# les tics : l'antithèse « X, pas Y » et la question rhétorique en titre.
TICS = {
    "antithèse « …, pas … »": re.compile(r",\s*pas\s|\bpas\s+(?:un|une|des|le|la|les)\b.*\.$", re.I),
    "négation « ne … pas »": re.compile(r"\bne\s+\w+\s+pas\b", re.I),
    "question en titre": re.compile(r"\?\s*$"),
}


def strip_json_comment(raw):
    return re.sub(r"^\s*/\*.*?\*/\s*", "", raw, flags=re.S)


def textes(tpl):
    """Rend (chemin, valeur) pour chaque champ rédactionnel du gabarit."""
    for key in tpl.get("order", []):
        section = tpl["sections"].get(key)
        if not section:
            continue
        for field, value in (section.get("settings") or {}).items():
            if field in CHAMPS and isinstance(value, str) and value.strip():
                yield "{}.{}".format(key, field), value
        for bkey in (section.get("block_order") or []):
            block = (section.get("blocks") or {}).get(bkey) or {}
            for field, value in (block.get("settings") or {}).items():
                if field in CHAMPS and isinstance(value, str) and value.strip():
                    yield "{}.{}.{}".format(key, bkey, field), value


def nettoyer(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def hors_citation(texte):
    """Le texte entre guillemets cite quelqu'un d'autre — souvent pour montrer
    ce qu'il ne faut pas écrire. Il ne compte donc pas comme notre voix."""
    return re.sub(r"«[^»]*»", " ", texte)


def auditer(path):
    tpl = json.loads(strip_json_comment(path.read_text(encoding="utf-8")))
    champs = list(textes(tpl))
    corpus = " ".join(nettoyer(v) for _, v in champs)
    bas = corpus.lower()

    creux = []
    for terme in LEXIQUE_CREUX:
        for chemin, valeur in champs:
            if terme in hors_citation(nettoyer(valeur)).lower():
                creux.append((terme, chemin))

    vous = len(re.findall(r"\b(vous|votre|vos)\b", bas))
    nous = len(re.findall(r"\b(nous|notre|nos)\b", bas))

    # Le hero est la première section : c'est là que la promesse doit être.
    # Les gabarits système (panier, recherche, 404) n'en ont pas : on les ignore.
    premier = (tpl.get("order") or [None])[0]
    type_premier = (tpl["sections"].get(premier) or {}).get("type", "") if premier else ""
    a_un_hero = "hero" in type_premier
    hero_champs = [v for c, v in champs if premier and c.startswith(premier + ".")]
    hero = nettoyer(" ".join(hero_champs)).lower()
    promesse = (not a_un_hero) or any(g in hero for g in GAINS)

    longues = []
    for chemin, valeur in champs:
        for phrase in re.split(r"(?<=[.!?])\s+", nettoyer(valeur)):
            mots = phrase.split()
            if len(mots) > MOTS_LONGS:
                longues.append((len(mots), chemin, phrase[:64]))

    tics = []
    for chemin, valeur in champs:
        if not chemin.endswith(("title", "title_accent")):
            continue
        phrase = nettoyer(valeur)
        for nom, motif in TICS.items():
            if motif.search(phrase):
                tics.append((nom, chemin, phrase[:58]))

    return {
        "fichier": path.name,
        "creux": creux,
        "vous": vous,
        "nous": nous,
        "promesse": promesse,
        "longues": longues,
        "tics": tics,
    }


def main():
    cibles = sys.argv[1:] or sorted(str(p) for p in TEMPLATES.glob("*.json"))
    rapports = [auditer(pathlib.Path(c)) for c in cibles]

    total_creux = sum(len(r["creux"]) for r in rapports)
    sans_promesse = [r for r in rapports if not r["promesse"]]
    nous_domine = [r for r in rapports if r["nous"] > r["vous"]]
    total_longues = sum(len(r["longues"]) for r in rapports)

    for r in rapports:
        if not (r["creux"] or r["longues"] or not r["promesse"] or r["nous"] > r["vous"]):
            continue
        print("\n{}".format(r["fichier"]))
        if not r["promesse"]:
            print("  ! aucun gain nommé dans le hero")
        if r["nous"] > r["vous"]:
            print("  ! parle de nous ({}) plus que du prospect ({})".format(r["nous"], r["vous"]))
        for terme, chemin in r["creux"]:
            print("  creux   « {} »  → {}".format(terme, chemin))
        for n, chemin, extrait in r["longues"]:
            print("  longue  {} mots  → {} : {}…".format(n, chemin, extrait))

    # Les tics se jugent à l'échelle du site, pas d'une page.
    par_tic = {}
    for r in rapports:
        for nom, chemin, phrase in r["tics"]:
            par_tic.setdefault(nom, []).append((r["fichier"], chemin, phrase))

    if par_tic:
        print("\n--- tics de rédaction (répétition d'une page à l'autre) ---")
        for nom, occurrences in sorted(par_tic.items(), key=lambda kv: -len(kv[1])):
            print("\n{} — {} titres".format(nom, len(occurrences)))
            for fichier, chemin, phrase in occurrences:
                print("   {:<34} {}".format(fichier, phrase))

    print("\n" + "=" * 62)
    print("gabarits analysés            {}".format(len(rapports)))
    print("occurrences de lexique creux {}".format(total_creux))
    print("heros sans gain nommé        {}".format(len(sans_promesse)))
    print("pages centrées sur nous      {}".format(len(nous_domine)))
    print("phrases de plus de {} mots   {}".format(MOTS_LONGS, total_longues))
    print("titres portant un tic        {}".format(sum(len(v) for v in par_tic.values())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
