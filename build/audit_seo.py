#!/usr/bin/env python3
"""
Audit SEO du HTML réellement rendu.

Le gabarit ne dit pas ce que Google voit : les balises se construisent dans le
layout, les données structurées dans un snippet, les liens dans les menus. Cet
audit lit donc les pages rendues par build/render.mjs, pas les JSON.

Ce qu'il vérifie :
  structure   un H1 et un seul, hiérarchie des titres sans saut
  balises     title et meta description — présence, longueur, unicité
  indexation  canonical, robots, hreflang, Open Graph
  contenu     volume de texte utile, pages faibles
  snippets    éligibilité paragraphe / liste / tableau / FAQ
  données     JSON-LD présent, parsable, types attendus par gabarit
  maillage    liens internes entrants et sortants, pages orphelines
  cannibales  pages qui visent la même intention
"""
import collections
import json
import pathlib
import re
import sys

from bs4 import BeautifulSoup

HERE = pathlib.Path(__file__).resolve().parent
PREVIEW = HERE / "preview"

# Seuils. Les longueurs de balises sont exprimées en caractères : c'est une
# approximation de la largeur de pixels réellement tronquée par Google.
TITLE_MIN, TITLE_MAX = 30, 62
DESC_MIN, DESC_MAX = 110, 160
CONTENU_FAIBLE = 300        # mots de texte utile
SNIPPET_MIN, SNIPPET_MAX = 30, 60   # mots d'une réponse éligible au snippet

# Mots vides français : ignorés pour comparer les intentions de deux pages.
VIDES = set("""a à au aux avec ce ces dans de des du elle en et eux il ils je
la le les leur lui ma mais me même mes moi mon ne nos notre nous on ou par pas
pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous
c d j l m n s t y été être avoir plus très sans sous chez entre vers dont
qu'il qu'elle nos leurs cette cet quel quelle est sont fait faire peut""".split())


def mots_cles(texte):
    mots = re.findall(r"[a-zà-öø-ÿ0-9]+", (texte or "").lower())
    return {m for m in mots if len(m) > 2 and m not in VIDES}


def texte_utile(soup):
    """Le texte du <main>, sans navigation ni pied de page."""
    principal = soup.find("main") or soup.body
    if principal is None:
        return ""
    clone = BeautifulSoup(str(principal), "lxml")
    for balise in clone(["script", "style", "nav", "footer", "template"]):
        balise.decompose()
    return re.sub(r"\s+", " ", clone.get_text(" ")).strip()


def analyser(path):
    html = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")
    r = {"page": path.stem}

    # ------------------------------------------------------------- structure
    titres = [(int(h.name[1]), h.get_text(" ", strip=True))
              for h in soup.find_all(re.compile(r"^h[1-6]$"))]
    r["h1"] = [t for n, t in titres if n == 1]
    sauts = []
    precedent = 0
    for n, t in titres:
        if precedent and n > precedent + 1:
            sauts.append("h{}→h{} : {}".format(precedent, n, t[:44]))
        precedent = n
    r["sauts"] = sauts
    r["nb_titres"] = len(titres)

    # ---------------------------------------------------------------- balises
    balise_title = soup.find("title")
    r["title"] = balise_title.get_text(strip=True) if balise_title else ""
    desc = soup.find("meta", attrs={"name": "description"})
    r["desc"] = (desc.get("content") or "").strip() if desc else ""

    canon = soup.find("link", rel="canonical")
    r["canonical"] = canon.get("href") if canon else ""
    robots = soup.find("meta", attrs={"name": "robots"})
    r["robots"] = (robots.get("content") or "") if robots else ""
    r["lang"] = (soup.find("html") or {}).get("lang", "") if soup.find("html") else ""

    og = {m.get("property"): m.get("content") for m in
          soup.find_all("meta", attrs={"property": True})}
    r["og_manquants"] = [k for k in ("og:title", "og:description", "og:type", "og:url")
                         if not og.get(k)]

    # ---------------------------------------------------------------- contenu
    txt = texte_utile(soup)
    r["mots"] = len(txt.split())
    r["texte"] = txt

    # --------------------------------------------------------------- snippets
    # Paragraphe : un titre en question suivi d'une réponse de 30 à 60 mots.
    questions, reponses_ok = [], 0
    for h in soup.find_all(["h2", "h3"]):
        t = h.get_text(" ", strip=True)
        if not t.endswith("?"):
            continue
        questions.append(t)
        suite = h.find_next(["p", "li"])
        if suite:
            n = len(suite.get_text(" ", strip=True).split())
            if SNIPPET_MIN <= n <= SNIPPET_MAX:
                reponses_ok += 1
    r["questions"] = questions
    r["reponses_snippet"] = reponses_ok

    principal = soup.find("main") or soup
    r["listes"] = len(principal.find_all(["ul", "ol"]))
    r["tableaux"] = len(principal.find_all("table"))
    r["listes_ordonnees"] = len(principal.find_all("ol"))

    # ---------------------------------------------------------- données JSON-LD
    types, erreurs = [], []
    for s in soup.find_all("script", attrs={"type": "application/ld+json"}):
        brut = s.string or s.get_text()
        try:
            data = json.loads(brut)
        except Exception as exc:
            erreurs.append(str(exc)[:70])
            continue
        noeuds = data.get("@graph", [data]) if isinstance(data, dict) else data
        for n in noeuds:
            if isinstance(n, dict) and n.get("@type"):
                t = n["@type"]
                types.extend(t if isinstance(t, list) else [t])
    r["jsonld"] = sorted(set(types))
    r["jsonld_erreurs"] = erreurs

    # ---------------------------------------------------------------- maillage
    liens = []
    zone = soup.find("main") or soup
    for a in zone.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/") and not href.startswith("//"):
            liens.append(href.split("#")[0].rstrip("/"))
    r["liens_sortants"] = sorted(set(liens))

    # ---------------------------------------------------------------- images
    imgs = soup.find_all("img")
    r["images"] = len(imgs)
    r["images_sans_alt"] = sum(1 for i in imgs if not (i.get("alt") or "").strip())

    return r


def main():
    fichiers = sorted(PREVIEW.glob("*.html"))
    if not fichiers:
        print("Aucune page rendue. Lancez d'abord : node build/render.mjs")
        return 1
    rapports = [analyser(f) for f in fichiers]
    par_page = {r["page"]: r for r in rapports}

    print("AUDIT SEO — {} pages rendues".format(len(rapports)))
    print("=" * 78)

    # ---------------------------------------------------------------- 1. H1
    print("\n1. TITRE PRINCIPAL")
    mauvais = [r for r in rapports if len(r["h1"]) != 1]
    if mauvais:
        for r in mauvais:
            print("   ✗ {:<34} {} balises H1".format(r["page"], len(r["h1"])))
            for h in r["h1"]:
                print("       « {} »".format(h[:70]))
    else:
        print("   ✓ un H1 unique sur les {} pages".format(len(rapports)))

    doublons_h1 = collections.Counter(r["h1"][0] for r in rapports if r["h1"])
    repetes = [(h, n) for h, n in doublons_h1.items() if n > 1]
    if repetes:
        print("   ✗ H1 identiques sur plusieurs pages :")
        for h, n in repetes:
            print("       {} fois — « {} »".format(n, h[:64]))
    else:
        print("   ✓ aucun H1 partagé par deux pages")

    # -------------------------------------------------------- 2. hiérarchie
    print("\n2. HIÉRARCHIE DES TITRES")
    avec_sauts = [r for r in rapports if r["sauts"]]
    if avec_sauts:
        for r in avec_sauts:
            print("   ✗ {:<34} {}".format(r["page"], r["sauts"][0]))
    else:
        print("   ✓ aucun niveau sauté")

    # ------------------------------------------------------------ 3. balises
    print("\n3. TITLE ET META DESCRIPTION")
    for champ, mini, maxi in (("title", TITLE_MIN, TITLE_MAX), ("desc", DESC_MIN, DESC_MAX)):
        vides = [r["page"] for r in rapports if not r[champ]]
        courts = [(r["page"], len(r[champ])) for r in rapports if r[champ] and len(r[champ]) < mini]
        longs = [(r["page"], len(r[champ])) for r in rapports if len(r[champ]) > maxi]
        vus = collections.Counter(r[champ] for r in rapports if r[champ])
        dupes = [(v, n) for v, n in vus.items() if n > 1]
        nom = "title" if champ == "title" else "description"
        print("   {} — {} pages".format(nom, len(rapports)))
        print("     manquants {} | trop courts {} | trop longs {} | dupliqués {}".format(
            len(vides), len(courts), len(longs), len(dupes)))
        for p, n in longs[:8]:
            print("       trop long  {:<32} {} car.".format(p, n))
        for p, n in courts[:8]:
            print("       trop court {:<32} {} car.".format(p, n))
        for v, n in dupes[:5]:
            print("       dupliqué {} fois — « {} »".format(n, v[:58]))

    # -------------------------------------------------------- 4. indexation
    print("\n4. INDEXATION")
    sans_canon = [r["page"] for r in rapports if not r["canonical"]]
    noindex = [r["page"] for r in rapports if "noindex" in r["robots"]]
    sans_lang = [r["page"] for r in rapports if not r["lang"]]
    og_ko = [(r["page"], r["og_manquants"]) for r in rapports if r["og_manquants"]]
    print("   canonical absent   {}".format(len(sans_canon) or "0 ✓"))
    print("   noindex            {}{}".format(len(noindex), " → " + ", ".join(noindex) if noindex else " ✓"))
    print("   attribut lang      {}".format(len(sans_lang) or "0 ✓"))
    print("   Open Graph         {}".format(len(og_ko) or "0 ✓"))
    for p, m in og_ko[:5]:
        print("       {:<32} manque {}".format(p, ", ".join(m)))

    # ------------------------------------------------------------ 5. contenu
    print("\n5. VOLUME DE CONTENU")
    faibles = sorted([r for r in rapports if r["mots"] < CONTENU_FAIBLE], key=lambda r: r["mots"])
    print("   seuil retenu : {} mots de texte utile (hors nav et pied de page)".format(CONTENU_FAIBLE))
    if faibles:
        for r in faibles:
            print("   ✗ {:<34} {} mots".format(r["page"], r["mots"]))
    else:
        print("   ✓ aucune page sous le seuil")
    med = sorted(r["mots"] for r in rapports)[len(rapports) // 2]
    print("   médiane {} mots | minimum {} | maximum {}".format(
        med, min(r["mots"] for r in rapports), max(r["mots"] for r in rapports)))

    # ----------------------------------------------------------- 6. snippets
    print("\n6. ÉLIGIBILITÉ AUX EXTRAITS ENRICHIS")
    sans_faq = [r["page"] for r in rapports if "FAQPage" not in r["jsonld"]]
    sans_q = [r["page"] for r in rapports if not r["questions"]]
    total_q = sum(len(r["questions"]) for r in rapports)
    total_ok = sum(r["reponses_snippet"] for r in rapports)
    print("   FAQPage déclaré     {} / {} pages".format(len(rapports) - len(sans_faq), len(rapports)))
    print("   titres en question  {} au total".format(total_q))
    print("   réponses calibrées  {} sur {} ({}-{} mots)".format(
        total_ok, total_q, SNIPPET_MIN, SNIPPET_MAX))
    print("   listes ordonnées    {} pages en ont".format(
        sum(1 for r in rapports if r["listes_ordonnees"])))
    print("   tableaux            {} pages en ont".format(
        sum(1 for r in rapports if r["tableaux"])))
    if sans_q:
        print("   ✗ sans aucune question en titre : {}".format(", ".join(sans_q[:12])))

    # -------------------------------------------------------- 7. données JSON-LD
    print("\n7. DONNÉES STRUCTURÉES")
    casses = [r for r in rapports if r["jsonld_erreurs"]]
    vides = [r["page"] for r in rapports if not r["jsonld"]]
    print("   JSON-LD invalide    {}".format(len(casses) or "0 ✓"))
    for r in casses[:5]:
        print("       {:<32} {}".format(r["page"], r["jsonld_erreurs"][0]))
    print("   sans données        {}".format(len(vides) or "0 ✓"))
    compte = collections.Counter(t for r in rapports for t in r["jsonld"])
    for t, n in compte.most_common():
        print("     {:<22} {} pages".format(t, n))

    # ------------------------------------------------------------ 8. maillage
    print("\n8. MAILLAGE INTERNE")
    entrants = collections.Counter()
    for r in rapports:
        for lien in r["liens_sortants"]:
            entrants[lien] += 1
    orphelines, faiblement = [], []
    for r in rapports:
        if r["page"] == "index":
            continue
        chemin = "/pages/" + r["page"]
        n = entrants.get(chemin, 0)
        if n == 0:
            orphelines.append(r["page"])
        elif n < 3:
            faiblement.append((r["page"], n))
    print("   pages sans lien entrant dans le contenu  {}".format(len(orphelines)))
    if orphelines:
        print("     {}".format(", ".join(orphelines[:14])))
    print("   moins de 3 liens entrants                {}".format(len(faiblement)))
    sortants = [(r["page"], len(r["liens_sortants"])) for r in rapports]
    pauvres = [p for p, n in sortants if n < 3]
    if pauvres:
        print("   moins de 3 liens sortants : {}".format(", ".join(pauvres[:14])))

    # -------------------------------------------------------- 9. images / alt
    sans_alt = [(r["page"], r["images_sans_alt"]) for r in rapports if r["images_sans_alt"]]
    print("\n9. IMAGES")
    print("   images sans attribut alt : {}".format(
        sum(n for _, n in sans_alt) if sans_alt else "0 ✓"))
    for p, n in sans_alt[:8]:
        print("       {:<32} {}".format(p, n))

    # ----------------------------------------------------- 10. cannibalisation
    print("\n10. CANNIBALISATION")
    print("    Deux pages se cannibalisent quand elles visent la même intention.")
    print("    On compare le vocabulaire du title et du H1, hors mots vides.")
    signatures = {}
    for r in rapports:
        if r["page"] in ("404", "mentions-legales", "politique-de-confidentialite", "plan-du-site"):
            continue
        signatures[r["page"]] = mots_cles(r["title"] + " " + " ".join(r["h1"]))

    paires = []
    noms = sorted(signatures)
    for i, a in enumerate(noms):
        for b in noms[i + 1:]:
            sa, sb = signatures[a], signatures[b]
            if not sa or not sb:
                continue
            commun = sa & sb
            jaccard = len(commun) / len(sa | sb)
            if jaccard >= 0.30:
                paires.append((jaccard, a, b, sorted(commun)))
    paires.sort(reverse=True)
    if paires:
        for j, a, b, commun in paires[:14]:
            print("    {:.0%}  {}  ⟷  {}".format(j, a, b))
            print("          en commun : {}".format(", ".join(commun[:9])))
    else:
        print("    ✓ aucune paire au-dessus de 30 % de recouvrement")

    print("\n" + "=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
