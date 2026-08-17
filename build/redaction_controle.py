#!/usr/bin/env python3
"""
Contrôle de la rédaction web, d'après « Le guide du rédacteur web SEO
freelance » de Lucie Rondelet, chapitres 4, 5 et 7.

Le livre apporte ce que la charte anti-IA ne couvrait pas : des règles de
métier mesurables. Trois d'entre elles sont vérifiables par machine et se
prêtent donc à un contrôle systématique.

**La longueur de phrase.** Le livre fixe le seuil à 23 mots, pour une raison
qui n'est pas esthétique : le lecteur d'écran est mal assis, mal éclairé,
interrompu par ses notifications. Une phrase de 43 mots lui demande un effort
qu'il ne fournira pas. Le livre en donne la démonstration en coupant une
dépêche de 43 mots en deux phrases de 23.

**La voix active.** « La bombe atomique a touché Nagasaki » plutôt que
« Nagasaki a été touchée par la bombe atomique ». La forme passive éloigne
l'acteur de l'action et alourdit la lecture.

**Les mots faibles.** Le livre distingue l'hyperonyme de l'hyponyme : dès
qu'un terme plus précis existe, on l'emploie — « berline » plutôt que
« voiture ». Il fournit un test : si un mot compte trop de synonymes, il est
trop générique (« avoir » en a soixante-dix, « détenir » vingt et un). Et il
dresse la liste des expressions toutes faites qui n'apportent rien, ainsi que
des formules de doute qui affaiblissent le propos.

Ce script ne corrige rien. Le style demande un arbitrage, et une réécriture
automatique produirait exactement la platitude qu'on cherche à éviter. Il
signale, il classe par gravité, il donne la citation. La décision reste
humaine.
"""
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
GABARITS = RACINE / "theme" / "templates"
ARTICLES = RACINE / "build" / "blog"

SEUIL_PHRASE = 23          # le seuil du livre
SEUIL_ALERTE = 30          # au-delà, la phrase est illisible sur mobile

BALISE = re.compile(r"<[^>]+>")
FIN_PHRASE = re.compile(r"(?<=[.!?…])\s+")

# Forme passive : auxiliaire être suivi d'un participe passé. Le français ne
# se laisse pas analyser par une expression régulière, donc on écarte
# explicitement les mots fréquents qui finissent comme un participe sans en
# être un — sans cette liste, « est aussi », « est presque » et « sont jamais »
# remontent comme des passifs et le contrôle devient inutilisable.
PASSIF = re.compile(
    r"\b(est|sont|était|étaient|sera|seront|a été|ont été|avait été|"
    r"soit|soient)\s+(?:[a-zà-ÿ]+ment\s+)?"
    r"([a-zà-ÿ]{4,}(?:é|és|ée|ées|i|is|ie|ies|u|us|ue|ues))\b",
    re.I)

FAUX_PARTICIPES = {
    "aussi", "ainsi", "presque", "jamais", "parmi", "depuis", "puis", "alors",
    "celui", "celle", "celles", "ceux", "plus", "moins", "très", "trois",
    "tous", "toutes", "nous", "vous", "leurs", "prix", "choix", "deux",
    "faux", "mieux", "voici", "voilà", "peut", "quelques", "plusieurs",
    "autrui", "surtout", "partout", "aujourd", "pourtant", "cependant",
    "toujours", "souvent", "auprès", "après", "assez", "certes", "ici",
}

# Les expressions que le livre bannit, plus celles relevées sur nos pages.
EXPRESSIONS_FAIBLES = [
    "pour petits et grands", "qui a su se démarquer", "ravira toute la famille",
    "notre objectif est de vous satisfaire", "la qualité est notre priorité",
    "à votre écoute", "au service de votre", "fort de notre expérience",
    "n'hésitez pas à", "à la pointe de", "acteur incontournable",
    "solution sur-mesure", "clé en main", "une équipe de passionnés",
]

# Formules de doute : elles transmettent l'hésitation du rédacteur au lecteur.
DOUTE = ["il est possible que", "il se pourrait", "il semblerait",
         "peut-être que", "on pourrait dire", "en quelque sorte"]

# Pantonymes : mots sans signification propre.
PANTONYMES = [r"\btruc\b", r"\bmachin\b", r"\bdes choses\b",
              r"\bplusieurs choses\b", r"\bdifférentes choses\b",
              r"\bcertains éléments\b", r"\bdivers aspects\b",
              r"\bun certain nombre de\b"]

# Temps que le livre écarte parce qu'ils alourdissent le style web.
TEMPS_LOURDS = [r"\bfussent\b", r"\beussent\b", r"\bfût\b", r"\beût\b",
                r"\bfurent\b", r"\bfut\b", r"\beurent\b", r"\bvînt\b",
                r"\bprirent\b", r"\bfirent\b", r"\bdirent\b"]


def texte_des_gabarits():
    """Rend (source, chaîne) pour chaque champ rédactionnel des gabarits."""
    for chemin in sorted(GABARITS.glob("page.*.json")):
        donnees = json.loads(chemin.read_text(encoding="utf-8"))
        pile = [donnees.get("sections", {})]
        while pile:
            noeud = pile.pop()
            if isinstance(noeud, dict):
                for clef, valeur in noeud.items():
                    if clef in ("type", "id", "order", "block_order"):
                        continue
                    if isinstance(valeur, str):
                        if len(valeur.split()) >= 6:
                            yield chemin.name, valeur
                    else:
                        pile.append(valeur)
            elif isinstance(noeud, list):
                pile.extend(noeud)


def texte_des_articles():
    for chemin in sorted(ARTICLES.glob("*.html")):
        brut = html.unescape(BALISE.sub(" ", chemin.read_text(encoding="utf-8")))
        yield chemin.name, " ".join(brut.split())


def phrases(chaine):
    plat = " ".join(html.unescape(BALISE.sub(" ", chaine)).split())
    for p in FIN_PHRASE.split(plat):
        p = p.strip()
        if p:
            yield p


def analyser(source, chaine, releve):
    for p in phrases(chaine):
        mots = len(p.split())
        if mots > SEUIL_ALERTE:
            releve["phrases_tres_longues"].append((source, mots, p))
        elif mots > SEUIL_PHRASE:
            releve["phrases_longues"].append((source, mots, p))

        bas = p.lower()
        for exp in EXPRESSIONS_FAIBLES:
            if exp in bas:
                releve["expressions_faibles"].append((source, exp, p))
        for exp in DOUTE:
            if exp in bas:
                releve["doute"].append((source, exp, p))
        for motif in PANTONYMES:
            if re.search(motif, bas):
                releve["pantonymes"].append((source, motif, p))
        for motif in TEMPS_LOURDS:
            if re.search(motif, bas):
                releve["temps_lourds"].append((source, motif, p))
        for m in PASSIF.finditer(p):
            if m.group(2).lower() in FAUX_PARTICIPES:
                continue
            releve["passif"].append((source, m.group(0), p))
            break


def bloc(titre, entrees, limite, gabarit):
    print("\n### %s — %d" % (titre, len(entrees)))
    if not entrees:
        print("    aucun")
        return
    for e in entrees[:limite]:
        print(gabarit % e)
    if len(entrees) > limite:
        print("    … et %d autres" % (len(entrees) - limite))


def main():
    cible = sys.argv[1] if len(sys.argv) > 1 else "tout"
    releve = {k: [] for k in ("phrases_longues", "phrases_tres_longues",
                              "expressions_faibles", "doute", "pantonymes",
                              "temps_lourds", "passif")}
    total_phrases = 0

    sources = []
    if cible in ("tout", "pages"):
        sources.append(texte_des_gabarits())
    if cible in ("tout", "articles"):
        sources.append(texte_des_articles())

    for flux in sources:
        for source, chaine in flux:
            total_phrases += sum(1 for _ in phrases(chaine))
            analyser(source, chaine, releve)

    print("CONTRÔLE RÉDACTIONNEL — %d phrases analysées (%s)"
          % (total_phrases, cible))
    print("Seuil de longueur : %d mots (Rondelet, chap. 4)" % SEUIL_PHRASE)

    bloc("Phrases de plus de %d mots — à couper" % SEUIL_ALERTE,
         releve["phrases_tres_longues"], 15,
         "    %-38s %3d mots · %s")
    bloc("Phrases de %d à %d mots — à surveiller" % (SEUIL_PHRASE + 1, SEUIL_ALERTE),
         releve["phrases_longues"], 8,
         "    %-38s %3d mots · %s")
    bloc("Expressions toutes faites", releve["expressions_faibles"], 20,
         "    %-38s « %s » · %s")
    bloc("Formules de doute", releve["doute"], 12,
         "    %-38s « %s » · %s")
    bloc("Pantonymes", releve["pantonymes"], 12,
         "    %-38s %s · %s")
    bloc("Temps lourds (passé simple, subjonctif passé)",
         releve["temps_lourds"], 12, "    %-38s %s · %s")
    bloc("Forme passive nette", releve["passif"], 15,
         "    %-38s « %s » · %s")

    graves = (len(releve["phrases_tres_longues"])
              + len(releve["expressions_faibles"])
              + len(releve["pantonymes"]))
    print("\n%d infractions graves, %d phrases à surveiller."
          % (graves, len(releve["phrases_longues"])))
    print("Le script ne réécrit rien : le style s'arbitre, il ne s'automatise pas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
