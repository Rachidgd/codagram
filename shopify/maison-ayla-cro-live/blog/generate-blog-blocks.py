"""Insertion de blocs produits dans les articles de blog Maison Ayla."""
import json, re, html

SRC = "/root/.claude/projects/-home-user-codagram/2db82d5f-363f-5432-8c88-73a3bdf9756e/tool-results/mcp-e5117c41-ff6c-4895-85df-ea6ce1b50c75-graphql_query-1785007336300.txt"
CDN = "https://cdn.shopify.com/s/files/1/1037/1842/0817/files/"

# handle, titre, prix, fichier image
P = {
 "layla-bn":  ("abaya-dubai-layla-bleu-nuit-brodee-or", "Abaya Layla : Caftan Bleu Nuit Brodé Or", "54,90", "Abaya-marocaine_Layla_bleu.webp?v=1779998721"),
 "layla-fu":  ("abaya-layla-fuchsia", "Abaya Layla Fuchsia", "54,90", "Abaya-marocaine_fuschia.svg?v=1779785109"),
 "layla-bc":  ("abaya-layla-bleu-ciel", "Abaya Layla Bleu Ciel", "54,90", "Abaya-marocaine_Layla_bleu_ciel.webp?v=1779999752"),
 "nour-b":    ("abaya-mariage-nour-blanc-pur-cristaux", "Abaya Nour Blanc : Ensemble 2 Pièces", "64,90", "Abaya-blanche_nour.webp?v=1779955913"),
 "nour-n":    ("abaya-nour-noir-prestige", "Abaya Nour Noir Prestige : Ensemble 2 Pièces", "64,90", "Abaya-noire_nour.webp?v=1779972063"),
 "almas-n":   ("abaya-farasha-almas-noir-metallise", "Abaya Farasha Almas Noir", "49,90", "Abaya-noire_alma.webp?v=1779993521"),
 "almas-g":   ("abaya-farasha-almas-gris-argente", "Abaya Almas Gris Argenté", "49,90", "alma_abaya_grise.png?v=1780863101"),
 "almas-v":   ("abaya-farasha-almas-vert-sauge-metallise", "Abaya Farasha Almas : Vert Sauge Irisé", "49,90", "Alma_abaya_vert_1.webp?v=1780864140"),
 "rania":     ("abaya-dubai-rania-blanche", "Abaya Dubai Rania Blanche", "59,90", "abaya_blanche_rania.webp?v=1780345843"),
 "yasmine":   ("abaya-brodee-blanche-kimono-yasmine", "Abaya Brodée Blanche Kimono Yasmine", "39,90", "Abaya-Yasmine_Blanche.webp?v=1779997784"),
 "maya-n":    ("abaya-noire-maya", "Abaya Noire Maya", "34,90", "Abaya_noire_Maya_satinee_brillante_Maison_Ayla.webp?v=1777934679"),
 "maya-b":    ("abaya-maya-beige", "Abaya Maya Beige", "39,90", "Abaya_Maya_beige_champagne_satinee_brillante_Maison_Ayla_ac8eb90a-3d90-45bc-9dd6-5809b1fd9d66.webp?v=1777934498"),
 "lina-nu":   ("abaya-lina-nude-ouverte-kimono", "Abaya Lina Nude : Ouverte Kimono", "39,90", "Abaya_Lina_Nude_2.webp?v=1778536494"),
 "lina-sa":   ("abaya-lina-sauge-ouverte-kimono", "Abaya Lina Sauge : Kimono Vert", "39,90", "abaya-lina-sauge-ouverte-kimono-detail_2.webp?v=1778536450"),
 "alya-bl":   ("abaya-papillon-alya-bleu", "Abaya Papillon Alya Bleu", "26,90", "abaya_bleu_alya.webp?v=1780524097"),
 "alya-ro":   ("abaya-papillon-alya-rose-poudre", "Abaya Papillon Alya Rose Poudré", "26,90", "abaya_rose_alya.webp?v=1780522988"),
 "soraya":    ("abaya-noire-soraya-col-chale-cristaux", "Abaya Noire Soraya", "44,90", "Abaya-soraya.webp?v=1780000161"),
 "nadia-n":   ("abaya-brodee-noire-kimono-nadia", "Abaya Brodée Noire Kimono Nadia", "39,90", "Abaya-noire_Nadya.webp?v=1779996850"),
 "sofia":     ("abaya-sofia-blanc-dentelle", "Abaya Sofia Blanc : Soie de Nidah", "34,90", "Abaya_Dubai_Sofia.png?v=1779832021"),
 "dalya":     ("abaya-dalya-noir-et-blanc", "Abaya Dalya Noir et Blanc", "29,90", "abaya_dalya_noir_blanc.webp?v=1781101435"),
 "hana-v":    ("abaya-hana-verte-ensemble-kimono", "Abaya Hana Verte : Ensemble Kimono", "37,90", "abaya_kimono_hana.webp?v=1779912498"),
 "warda-r":   ("abaya-warda-rouge-papillon-mousseline", "Abaya Warda Rouge : Papillon Mousseline", "38,90", "Abaya-marocaine_warda_rouge.svg?v=1779830141"),
 "warda-n":   ("abaya-warda-noire-papillon-mousseline", "Abaya Warda Noire : Papillon Mousseline", "38,90", "Abaya-marocaine_warda_noire.webp?v=1780001860"),
 "warda-b":   ("abaya-warda-bleu-papillon-mousseline", "Abaya Warda Bleu : Papillon Mousseline", "38,90", "Abaya-bleu_marocaine.webp?v=1780003087"),
 "warda-p":   ("abaya-warda-pourpre-papillon-mousseline", "Abaya Warda Pourpre : Papillon Mousseline", "38,90", "Abaya-warda_pourpre.webp?v=1780002820"),
}

STYLE = """<style>
.ma-shop{font-family:'Jost',system-ui,sans-serif;margin:2.75rem 0;padding:1.75rem 0;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8}
.ma-shop__label{margin:0 0 .4rem;font-size:.65rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B}
.ma-shop__title{margin:0 0 1.5rem;font-size:1.1rem;font-weight:300;line-height:1.3;color:#0A0A0A}
.ma-shop__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem}
.ma-shop__card{display:block;text-decoration:none;color:inherit}
.ma-shop__img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;object-position:top center;background:#F4F3F0;margin:0 0 .55rem}
.ma-shop__name{display:block;font-size:.78rem;font-weight:300;line-height:1.35;color:#0A0A0A}
.ma-shop__price{display:block;margin-top:.2rem;font-size:.78rem;font-weight:400;color:#6B6B6B}
.ma-shop__cta{display:inline-block;margin-top:1.5rem;padding-bottom:2px;border-bottom:1px solid #0A0A0A;font-size:.68rem;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#0A0A0A;text-decoration:none}
@media(min-width:700px){.ma-shop__grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:1.25rem}}
</style>
"""

def card(key):
    h, t, price, img = P[key]
    src = CDN + img + ("" if img.endswith(".svg") or ".svg?" in img else "&width=420")
    return (f'<a class="ma-shop__card" href="/products/{h}">'
            f'<img class="ma-shop__img" src="{src}" alt="{html.escape(t)}" width="420" height="560" loading="lazy">'
            f'<span class="ma-shop__name">{html.escape(t)}</span>'
            f'<span class="ma-shop__price">{price}&nbsp;€</span></a>')

def block(label, title, keys, cta_label, cta_url):
    cards = "".join(card(k) for k in keys)
    return (f'<aside class="ma-shop">'
            f'<p class="ma-shop__label">{label}</p>'
            f'<p class="ma-shop__title">{title}</p>'
            f'<div class="ma-shop__grid">{cards}</div>'
            f'<a class="ma-shop__cta" href="{cta_url}">{cta_label}</a>'
            f'</aside>')

PLAN = {
 "robe-mariage-marocain-tunisien-oriental": dict(
   id="gid://shopify/Article/642796880209",
   mid=("La sélection", "Les pièces qui tiennent une soirée de mariage",
        ["layla-bn", "layla-fu", "layla-bc", "nour-b"]),
   end=("Pour aller plus loin", "Si la cérémonie demande plus de sobriété",
        ["nour-n", "almas-n", "almas-g", "warda-n"]),
   cta=("Voir toutes les abayas de mariage", "/collections/abaya-mariage")),

 "abaya-omra-hajj-pelerinage": dict(
   id="gid://shopify/Article/642407399761",
   mid=("La sélection", "Des coupes couvrantes, pensées pour marcher",
        ["maya-n", "lina-nu", "alya-bl", "maya-b"]),
   end=("Pour aller plus loin", "Sobres, opaques, faciles à superposer",
        ["alya-ro", "soraya", "lina-sa", "nadia-n"]),
   cta=("Voir les abayas de prière", "/collections/abaya-priere")),

 "robe-soiree-femme-voilee": dict(
   id="gid://shopify/Article/642726232401",
   mid=("La sélection", "Nos pièces de cérémonie",
        ["nour-n", "almas-n", "soraya", "almas-g"]),
   end=("Pour aller plus loin", "Si vous cherchez plus clair",
        ["nour-b", "rania", "yasmine", "almas-v"]),
   cta=("Voir les abayas de soirée", "/collections/abaya-soiree")),

 "mode-modeste-2026-s-habiller-avec-style-femme-voilee": dict(
   id="gid://shopify/Article/642812019025",
   mid=("La sélection", "Les essentiels d'une garde-robe modeste",
        ["sofia", "lina-sa", "maya-n", "dalya"]),
   end=("Pour aller plus loin", "Des pièces qui se portent toute l'année",
        ["rania", "hana-v", "maya-b", "yasmine"]),
   cta=("Voir toutes les abayas", "/collections/abaya")),

 "djellaba-caftan-robe-orientale-differences-comment-porter-france": dict(
   id="gid://shopify/Article/642836824401",
   mid=("La sélection", "Dans l'esprit du caftan",
        ["layla-bn", "layla-fu", "warda-r", "warda-n"]),
   end=("Pour aller plus loin", "Les coupes papillon, plus amples",
        ["warda-b", "warda-p", "layla-bc", "nour-n"]),
   cta=("Voir les abayas marocaines", "/collections/abaya-marocaine")),
}

def insert_mid(body, blk):
    """Insère au premier <h2> passé 40 % du contenu ; sinon au </p> le plus proche."""
    target = int(len(body) * 0.40)
    marks = [m.start() for m in re.finditer(r"<h2[ >]", body)]
    after = [m for m in marks if m >= target]
    pos = after[0] if after else None
    if pos is None:
        ends = [m.end() for m in re.finditer(r"</p>", body)]
        cand = [e for e in ends if e >= target]
        pos = cand[0] if cand else len(body)
    return body[:pos] + blk + body[pos:], pos

src = json.load(open(SRC))
bodies = {a["handle"]: a["body"] for a in src["data"]["articles"]["nodes"]}

out = {}
for handle, cfg in PLAN.items():
    body = bodies[handle]
    cta_l, cta_u = cfg["cta"]
    mid = STYLE + block(*cfg["mid"][:2], cfg["mid"][2], cta_l, cta_u)
    end = block(*cfg["end"][:2], cfg["end"][2], cta_l, cta_u)
    new, pos = insert_mid(body, mid)
    # Le bloc de fin doit rester DANS le conteneur de l'article, sinon il s'affiche
    # pleine largeur alors que l'article est centré. Les 5 articles n'utilisent pas
    # le même conteneur : <article>, <div class="ma-blog"> ou <main>.
    close = -1
    for tag in ("</main>", "</article>"):
        close = new.rfind(tag)
        if close != -1:
            break
    if close == -1:
        close = new.rfind("</div>")
    new = (new[:close] + end + new[close:]) if close != -1 else new + end
    out[handle] = {"id": cfg["id"], "body": new}
    print(f"{handle[:52]:<52} {len(body):>6} → {len(new):>6} car. · insertion à {pos} ({pos/len(body):.0%})")

json.dump(out, open("blog_out.json", "w"), ensure_ascii=False)
print("\nContrôles :")
for h, v in out.items():
    b = v["body"]
    assert b.count('class="ma-shop"') == 2, h
    assert b.count(".ma-shop{") == 1, h  # les articles ont déjà leur propre <style>
    for m in re.finditer(r'href="/products/([^"]+)"', b):
        assert m.group(1) in {p[0] for p in P.values()}, m.group(1)
print(f"  {len(out)} articles · 2 blocs chacun · 1 seule feuille de style · tous les liens produits valides")
