#!/usr/bin/env python3
"""
Corps de page HTML pour les pages géographiques.

Pourquoi ce fichier existe. Chaque page de ville possède désormais son propre
gabarit, mais un gabarit ne vit que dans le thème publié. Tant que le nouveau
thème n'est pas en ligne, Shopify retombe sur `page.json`, qui n'affiche que le
titre et le corps de la page. Sans corps réel, la page serait vide.

Le corps est donc généré depuis le gabarit de la ville : mêmes faits, même
voix, aucune phrase inventée en double. Chaque ville a un ordre de sections
différent, donc un corps différent. Après publication, le gabarit reprend la
main et ce corps n'est plus rendu — il ne crée aucun contenu dupliqué.
"""
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
TEMPLATES = HERE.parent / "theme" / "templates"

# handle de la page Shopify -> suffixe de gabarit
GEO = {
    "consultant-seo-paris": "seo-paris",
    "consultant-seo-lyon": "seo-lyon",
    "consultant-seo-rennes": "seo-rennes",
    "agence-seo-lille": "seo-lille",
    "agence-seo-nice": "seo-nice",
    "agence-seo-toulouse": "seo-toulouse",
    "agence-seo-montpellier": "seo-montpellier",
    "agence-seo-strasbourg": "seo-strasbourg",
    "agence-seo-grenoble": "seo-grenoble",
    "agence-seo-marseille": "seo-local-marseille",
    "agence-seo-nantes": "seo-local-nantes",
    "agence-seo-bordeaux": "seo-local-bordeaux",
}


def strip_json_comment(raw):
    """Shopify préfixe ses gabarits d'un bandeau /* ... */ non standard."""
    return re.sub(r"^\s*/\*.*?\*/\s*", "", raw, flags=re.S)


def blocks(section):
    order = section.get("block_order") or list(section.get("blocks", {}))
    return [section["blocks"][k] for k in order if k in section.get("blocks", {})]


def inner(html):
    """Le texte riche des gabarits est déjà du HTML : on le reprend tel quel."""
    return (html or "").strip()


def para(text):
    return "<p>{}</p>".format(text.strip()) if text and text.strip() else ""


def build(section, out):
    kind = section["type"]
    s = section.get("settings", {})
    title = (s.get("title") or "").strip()

    if kind == "page-hero":
        out.append(para(s.get("lead")))
        return

    if title:
        out.append("<h2>{}</h2>".format(title))
    out.append(inner(s.get("text")) if kind == "content-split" else para(s.get("text")))

    if kind == "content-stats":
        items = [
            "<li><strong>{} — {}</strong> : {}</li>".format(
                b["settings"].get("value", ""),
                b["settings"].get("label", ""),
                b["settings"].get("note", ""),
            )
            for b in blocks(section)
        ]
        if items:
            out.append("<ul>{}</ul>".format("".join(items)))
        if s.get("source"):
            out.append("<p><em>{}</em></p>".format(s["source"]))

    elif kind in ("content-split", "content-grid"):
        items = [
            "<li><strong>{}</strong> : {}</li>".format(
                b["settings"].get("title", ""), b["settings"].get("text", "")
            )
            for b in blocks(section)
        ]
        if items:
            out.append("<ul>{}</ul>".format("".join(items)))

    elif kind == "content-steps":
        items = []
        for b in blocks(section):
            bs = b["settings"]
            duration = " <em>({})</em>".format(bs["duration"]) if bs.get("duration") else ""
            items.append(
                "<li><strong>{}</strong>{} : {}</li>".format(
                    bs.get("title", ""), duration, bs.get("text", "")
                )
            )
        if items:
            out.append("<ol>{}</ol>".format("".join(items)))

    elif kind == "content-faq":
        for b in blocks(section):
            bs = b["settings"]
            out.append("<h3>{}</h3>".format(bs.get("question", "")))
            out.append(inner(bs.get("answer")))

    elif kind == "content-cta":
        note = s.get("note")
        label = s.get("cta_label") or "Demander un diagnostic"
        out.append('<p><a href="/pages/reserver">{}</a>{}</p>'.format(
            label, " — {}".format(note) if note else ""
        ))
        if s.get("link_label") and s.get("link_url"):
            out.append('<p><a href="{}">{}</a></p>'.format(s["link_url"], s["link_label"]))


def body_for(suffix):
    raw = (TEMPLATES / "page.{}.json".format(suffix)).read_text(encoding="utf-8")
    tpl = json.loads(strip_json_comment(raw))
    out = []
    for key in tpl["order"]:
        build(tpl["sections"][key], out)
    return "".join(p for p in out if p)


def main():
    bodies = {handle: body_for(suffix) for handle, suffix in GEO.items()}
    dest = HERE / "bodies_geo.json"
    dest.write_text(json.dumps(bodies, ensure_ascii=False, indent=2), encoding="utf-8")

    # Contrôle anti-duplication : aucune phrase longue partagée entre deux villes.
    # Une balise ferme une phrase : un libellé de bouton ne doit pas être recollé
    # au paragraphe voisin, sinon la comparaison mesure une phrase qui n'existe pas.
    seen, clashes = {}, []
    for handle, html in bodies.items():
        text = re.sub(r"<[^>]+>", "\n", html)
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", text):
            sentence = " ".join(sentence.split())
            if len(sentence) < 60:
                continue
            if sentence in seen and seen[sentence] != handle:
                clashes.append((seen[sentence], handle, sentence[:70]))
            seen[sentence] = handle

    for handle, html in sorted(bodies.items()):
        words = len(re.sub(r"<[^>]+>", " ", html).split())
        print("{:<32} {:>6} o  {:>4} mots".format(handle, len(html.encode()), words))
    print("\nphrases longues comparées : {}".format(len(seen)))
    print("collisions entre villes   : {}".format(len(clashes)))
    for a, b, frag in clashes:
        print("  {} / {} → {}".format(a, b, frag))


if __name__ == "__main__":
    main()
