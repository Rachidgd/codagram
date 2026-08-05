#!/usr/bin/env python3
"""
Audit éditorial des articles du blog.

Répond à cinq questions, chiffres à l'appui plutôt qu'à l'impression :

1. Le contenu est-il assez long et assez dense ?
2. Se lit-il facilement ? (longueur de phrase, lisibilité Kandel-Moles)
3. Prouve-t-il une expérience réelle ? (marqueurs E-E-A-T)
4. Apporte-t-il de la valeur actionnable, ou de la généralité ?
5. Est-il d'actualité en 2026 ? (mentions périmées, années figées)

Plus un contrôle de cannibalisation entre articles, qui décide de l'impact
SEO réel : deux articles sur la même intention s'annulent.

Sortie : un tableau par article, les alertes classées, et build/audit_articles.json.
"""
import collections
import html
import json
import math
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent
DOSSIER = RACINE / "blog"
INDEX = RACINE / "blog_index.json"

BALISE = re.compile(r"<[^>]+>")
TITRE = re.compile(r"<h([2-4])[^>]*>(.*?)</h\1>", re.I | re.S)
PARA = re.compile(r"<p[^>]*>(.*?)</p>", re.I | re.S)
PHRASE = re.compile(r"(?<=[.!?…])\s+")

# --- Lisibilité ------------------------------------------------------------
VOYELLES = "aeiouyàâäéèêëîïôöùûüÿ"


def syllabes(mot):
    """Compte les groupes de voyelles, le « e » final muet en moins."""
    mot = mot.lower()
    n, precedente = 0, False
    for c in mot:
        v = c in VOYELLES
        if v and not precedente:
            n += 1
        precedente = v
    if mot.endswith("e") and n > 1:
        n -= 1
    return max(n, 1)


def kandel_moles(phrases, mots):
    """Flesch adapté au français par Kandel et Moles. 0 = ardu, 100 = limpide."""
    if not phrases or not mots:
        return 0.0
    mpp = len(mots) / len(phrases)
    spm = sum(syllabes(m) for m in mots) / len(mots)
    return 207 - 1.015 * mpp - 73.6 * spm


# --- Marqueurs -------------------------------------------------------------
# Ce qui prouve qu'on a fait le travail, pas seulement lu la documentation.
EXPERIENCE = re.compile(
    r"\bnous (?:voyons|retrouvons|constatons|观|appliquons|commençons|déroulons|"
    r"corrigeons|mesurons|auditons|recommandons)\b|"
    r"\b(?:dans|selon) notre expérience\b|chez nos clients\b|sur nos projets\b|"
    r"\bnous (?:avons|rencontrons)\b|\bon (?:voit|rencontre|retrouve|constate)\b|"
    r"\bnos audits\b|\bnotre méthode\b|\bque nous (?:déroulons|appliquons)\b",
    re.I)

# Un conseil devient actionnable quand il porte un seuil, un outil ou un geste.
OUTILS = re.compile(
    r"Search Console|PageSpeed|Clarity|Analytics|GA4|Ad Library|Google Business|"
    r"Ads Manager|gestionnaire d'événements|Shopify|Meta|robots\.txt|sitemap|"
    r"bibliothèque publicitaire", re.I)
# Un repère chiffré compte qu'il soit écrit en chiffres ou en toutes lettres :
# « deux à quatre semaines » vaut « 2 à 4 semaines » pour le lecteur.
NOMBRE = (r"(?:\d+[\s,.]?\d*|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|"
          r"onze|douze|quinze|vingt|trente|quarante|cinquante|soixante|cent|"
          r"mille|plusieurs|quelques)")
UNITE = (r"(?:%|€|euros?|s\b|ms\b|secondes?|mois|semaines?|jours?|heures?|"
         r"minutes?|mots|caract[èe]res|px|Ko|Mo|clics?|visites?|conversions?|"
         r"produits?|champs?|pages?|articles?|avis|points?|lignes?|colonnes?)")
SEUILS = re.compile(r"\b%s(?:\s+(?:à|ou|et)\s+%s)?\s+%s" % (NOMBRE, NOMBRE, UNITE),
                    re.I)
GESTES = re.compile(
    r"\b(?:ouvrez|vérifiez|comptez|notez|filtrez|ajoutez|retirez|supprimez|"
    r"remplacez|réécrivez|testez|mesurez|comparez|classez|commencez|regardez|"
    r"demandez|installez|activez|désinstallez|corrigez|placez|affichez)\b",
    re.I)

# Le creux : des phrases qui pourraient figurer dans n'importe quel article,
# quel que soit le contexte.
GENERALITES = re.compile(
    r"\bil est important de\b|\bil est essentiel de\b|\bn'oubliez pas que\b|"
    r"\bde nos jours\b|\bà l'heure actuelle\b|\bforce est de constater\b|"
    r"\bdans un monde où\b|\bvéritable atout\b|\bnombreux avantages\b|"
    r"\bnul doute que\b|\bà l'ère (?:du|de la|des)\b", re.I)

# Ce qui date le contenu ou l'a rendu faux. Un terme obsolète cité comme tel
# — « remplace l'ancien FID » — est une précision utile, pas une erreur : on
# ne signale que les mentions présentées comme d'actualité.
PERIMES = {
    "Universal Analytics": "arrêté en 2023, remplacé par GA4",
    "First Input Delay": "remplacé par INP en mars 2024",
    r"\bFID\b": "remplacé par INP en mars 2024",
    r"\bAMP\b": "abandonné par Google dans les résultats mobiles",
    r"Google\+": "fermé en 2019",
    "rich cards": "terminologie abandonnée par Google",
    r"Search Console.{0,20}ancienne version": "l'ancienne interface n'existe plus",
    r"\bTwitter\b": "renommé X en 2023",
    "Expert Google Partner": "programme renommé",
}
DEJA_SITUE = re.compile(
    r"ancien|anciennes?|remplac|obsol[èe]t|abandonn|dispar|autrefois|"
    r"jusqu'(?:en|à)|n'existe plus|à l'époque", re.I)
ANNEES = re.compile(r"\b(20(?:1\d|2[0-5]))\b")

VIDES = set("""au aux avec ce ces dans de des du elle en et eux il je la le les leur
lui ma mais me même mes moi mon ne nos notre nous on ou par pas pour qu que qui sa
se ses son sur ta te tes toi ton tu un une vos votre vous c d j l à m n s t y été
étée étées étés étant suis es est sommes êtes sont serai seras sera serons serez
seront ai as avons avez ont plus moins très bien tout tous toute toutes cette cet
comme donc car si quand alors aussi encore déjà jamais toujours faut peut être
avoir faire dont leurs quel quelle quels quelles ceux celle celles""".split())


def texte(fragment):
    return html.unescape(BALISE.sub(" ", fragment)).replace("\xa0", " ")


def mots_de(t):
    return [m for m in re.findall(r"[A-Za-zÀ-ÿ']+", t) if len(m) > 1]


def cles(t):
    return {m.lower() for m in mots_de(t) if len(m) > 3 and m.lower() not in VIDES}


def note(valeur, bon, moyen):
    """Trois paliers, pour que le tableau se lise d'un coup d'œil."""
    if valeur >= bon:
        return "bon"
    if valeur >= moyen:
        return "moyen"
    return "faible"


def analyser(handle, corps):
    brut = texte(corps)
    mots = mots_de(brut)
    phrases = [p for p in PHRASE.split(brut) if len(mots_de(p)) > 2]
    paras = PARA.findall(corps)
    titres = [(int(n), texte(t).strip()) for n, t in TITRE.findall(corps)]

    longues = [p for p in phrases if len(mots_de(p)) > 25]
    lisibilite = kandel_moles(phrases, mots)

    per = []
    for motif, raison in PERIMES.items():
        for trouve in re.finditer(motif, brut, re.I):
            autour = brut[max(0, trouve.start() - 90):trouve.end() + 90]
            if not DEJA_SITUE.search(autour):
                per.append((re.sub(r"\\b|\\", "", motif), raison))
                break

    annees = collections.Counter(ANNEES.findall(brut))
    vieilles = {a: n for a, n in annees.items() if a < "2026"}

    return {
        "handle": handle,
        "mots": len(mots),
        "phrases": len(phrases),
        "paragraphes": len(paras),
        "h2": sum(1 for n, _ in titres if n == 2),
        "h3": sum(1 for n, _ in titres if n == 3),
        "tableaux": corps.count("<table"),
        "listes": corps.count("<ul") + corps.count("<ol"),
        "reponse_courte": corps.count('class="cc-answer"'),
        "mots_par_phrase": round(len(mots) / max(len(phrases), 1), 1),
        "phrases_longues": len(longues),
        "part_longues": round(100 * len(longues) / max(len(phrases), 1), 1),
        "lisibilite": round(lisibilite, 1),
        "experience": len(EXPERIENCE.findall(brut)),
        "outils": len(set(m.lower() for m in OUTILS.findall(brut))),
        "seuils": len(SEUILS.findall(brut)),
        "gestes": len(GESTES.findall(brut)),
        "generalites": [g.strip() for g in GENERALITES.findall(brut)],
        "perimes": per,
        "annees_anciennes": vieilles,
        "questions_titre": sum(1 for _, t in titres if t.endswith("?")),
        "cles": sorted(cles(" ".join(t for _, t in titres))),
    }


def cannibalisation(fiches, seuil=0.34):
    paires = []
    for i, a in enumerate(fiches):
        for b in fiches[i + 1:]:
            ca, cb = set(a["cles"]), set(b["cles"])
            if not ca or not cb:
                continue
            j = len(ca & cb) / len(ca | cb)
            if j >= seuil:
                paires.append((round(j, 2), a["handle"], b["handle"],
                               sorted(ca & cb)[:6]))
    return sorted(paires, reverse=True)


def main():
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    fiches = []
    for chemin in sorted(DOSSIER.glob("*.html")):
        if chemin.stem in index:
            fiches.append(analyser(chemin.stem,
                                   chemin.read_text(encoding="utf-8")))

    print("=" * 100)
    print("AUDIT ÉDITORIAL — %d articles" % len(fiches))
    print("=" * 100)
    print("%-46s %5s %5s %5s %5s %5s %5s %5s" % (
        "article", "mots", "m/phr", "lisib", "expér", "seuils", "gestes", "outils"))
    for f in sorted(fiches, key=lambda x: x["lisibilite"]):
        print("%-46s %5d %5.1f %5.1f %5d %5d %5d %5d" % (
            f["handle"][:46], f["mots"], f["mots_par_phrase"], f["lisibilite"],
            f["experience"], f["seuils"], f["gestes"], f["outils"]))

    def moyenne(cle):
        return sum(f[cle] for f in fiches) / len(fiches)

    print("\n--- SYNTHÈSE " + "-" * 86)
    print("Volume         : médiane %d mots, minimum %d, maximum %d" % (
        sorted(f["mots"] for f in fiches)[len(fiches) // 2],
        min(f["mots"] for f in fiches), max(f["mots"] for f in fiches)))
    print("Lisibilité     : moyenne %.1f (60-70 = accessible, 30-50 = ardu)"
          % moyenne("lisibilite"))
    print("Phrases        : %.1f mots en moyenne, %.1f %% au-dessus de 25 mots"
          % (moyenne("mots_par_phrase"), moyenne("part_longues")))
    print("Densité        : %.1f seuils chiffrés, %.1f gestes concrets par article"
          % (moyenne("seuils"), moyenne("gestes")))
    print("Expérience     : %.1f marqueur(s) de vécu par article, %d article(s) à zéro"
          % (moyenne("experience"), sum(1 for f in fiches if not f["experience"])))
    print("Structure      : %.1f titres de niveau 2, %.1f de niveau 3, %.1f tableau"
          % (moyenne("h2"), moyenne("h3"), moyenne("tableaux")))

    print("\n--- ALERTES " + "-" * 88)

    faibles = [f for f in fiches if f["experience"] == 0]
    if faibles:
        print("\nAucun marqueur d'expérience vécue (%d) — le texte pourrait venir"
              " de n'importe qui :" % len(faibles))
        for f in faibles:
            print("   ", f["handle"])

    ardus = [f for f in fiches if f["lisibilite"] < 40]
    if ardus:
        print("\nLecture ardue, sous 40 (%d) :" % len(ardus))
        for f in sorted(ardus, key=lambda x: x["lisibilite"]):
            print("    %-52s %.1f — %.1f mots/phrase"
                  % (f["handle"], f["lisibilite"], f["mots_par_phrase"]))

    creux = [f for f in fiches if f["generalites"]]
    if creux:
        print("\nFormules creuses (%d article(s)) :" % len(creux))
        for f in creux:
            print("    %-52s %s" % (f["handle"], ", ".join(f["generalites"])))

    perimes = [f for f in fiches if f["perimes"]]
    if perimes:
        print("\nMentions périmées en 2026 (%d article(s)) :" % len(perimes))
        for f in perimes:
            for motif, raison in f["perimes"]:
                print("    %-52s « %s » — %s" % (f["handle"], motif, raison))

    vieux = [f for f in fiches if f["annees_anciennes"]]
    if vieux:
        print("\nAnnées antérieures à 2026 citées (%d article(s)) :" % len(vieux))
        for f in vieux:
            print("    %-52s %s" % (
                f["handle"], ", ".join("%s×%d" % (a, n)
                                       for a, n in sorted(f["annees_anciennes"].items()))))

    pauvres = [f for f in fiches if f["seuils"] < 8]
    if pauvres:
        print("\nPeu de repères chiffrés, sous 8 (%d) :" % len(pauvres))
        for f in pauvres:
            print("    %-52s %d" % (f["handle"], f["seuils"]))

    paires = cannibalisation(fiches)
    print("\nCannibalisation (recouvrement des titres ≥ 34 %%) : %d paire(s)"
          % len(paires))
    for j, a, b, communs in paires:
        print("    %.2f  %s ↔ %s" % (j, a, b))
        print("           communs : %s" % ", ".join(communs))

    (RACINE / "audit_articles.json").write_text(
        json.dumps(fiches, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
