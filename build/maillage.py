#!/usr/bin/env python3
"""
Maillage interne : chaque page pousse trois guides.

À lancer APRÈS les générateurs pages_*.py, qui réécrivent les gabarits. Le
script insère une section « Lire aussi » juste avant l'appel à l'action final,
là où le lecteur qui n'est pas encore prêt à demander un diagnostic cherche à
se documenter.

Les cartes ne portent qu'un titre et une accroche courte : aucun texte long
n'est réutilisé d'une page à l'autre, donc aucun risque de duplication.
"""
import json
import pathlib
import sys

OUT = pathlib.Path(__file__).resolve().parent.parent / "theme" / "templates"
BLOG = "/blogs/ressources/"

# Accroche courte par guide, volontairement sous 60 caractères : c'est un
# libellé de navigation, pas du contenu.
GUIDES = {
    "delais-resultats-seo": ("Combien de temps avant les premiers résultats", "Les vrais délais, mois par mois"),
    "comment-choisir-votre-agence-seo-sans-vous-faire-avoir": ("Choisir une agence SEO sans se faire avoir", "Les questions qui trient"),
    "combien-coute-le-seo-en-2026-et-pourquoi-fuir-le-200-euros-par-mois": ("Combien coûte le SEO en 2026", "Et pourquoi fuir le 200 €/mois"),
    "agence-seo-ou-consultant-seo": ("Agence SEO ou consultant", "Ce qui change vraiment"),
    "checklist-audit-seo": ("Checklist d'audit SEO", "Les 12 points vérifiés en premier"),
    "combien-coute-audit-seo": ("Combien coûte un audit SEO", "Prix, livrables et pièges"),
    "search-console-rapports-essentiels": ("Search Console : les 5 rapports utiles", "Et comment les lire"),
    "recherche-mots-cles-methode-intentions": ("Recherche de mots-clés par intention", "La méthode qui trouve des clients"),
    "maillage-interne-cocon-semantique": ("Maillage interne et cocon sémantique", "Muscler ses pages business"),
    "balises-title-formules-ctr": ("15 formules de balises title", "Pour augmenter le taux de clic"),
    "ai-overviews-rester-visible": ("Rester visible face aux AI Overviews", "Quand Google répond à votre place"),
    "core-web-vitals-explique-simplement": ("Core Web Vitals expliqués simplement", "LCP, INP, CLS et le reste"),
    "eeat-prouver-expertise-google": ("Prouver son expertise à Google", "E-E-A-T sans être une marque connue"),
    "refonte-site-sans-perdre-seo": ("Refondre son site sans perdre son trafic", "La checklist de migration"),
    "optimiser-fiche-google-business-profile": ("Optimiser sa fiche Google Business", "Ce qui fait monter dans la carte"),
    "obtenir-plus-avis-google": ("Obtenir plus d'avis Google", "8 façons sans enfreindre les règles"),
    "creer-pages-villes-sans-duplicate": ("Des pages villes sans duplication", "Ranker localement proprement"),
    "collections-shopify-architecture-seo": ("Collections Shopify : l'architecture", "Celle qui fait ranker et vendre"),
    "donnees-structurees-produit-google": ("Données structurées produit", "Prix, stock et étoiles dans Google"),
    "fiche-produit-structure-conversion": ("La fiche produit en 9 blocs", "Structure qui transforme"),
    "vitesse-shopify-optimisations": ("11 optimisations de vitesse Shopify", "Réalisables sans développeur"),
    "apps-shopify-utiles-et-a-eviter": ("Apps Shopify : les 10 utiles", "Et celles qui ruinent la vitesse"),
    "boutique-shopify-qui-convertit-2026": ("Une boutique Shopify qui convertit", "La checklist complète"),
    "abandon-panier-corrections": ("Abandon de panier : 9 corrections", "À faire avant les emails"),
    "migrer-vers-shopify-sans-perdre-seo": ("Migrer vers Shopify sans casse", "Le plan complet"),
    "combien-coute-une-boutique-shopify": ("Combien coûte une boutique Shopify", "Les fourchettes réelles"),
    "cahier-des-charges-site-vitrine": ("Cahier des charges d'un site vitrine", "Le modèle à remplir"),
    "prix-site-vitrine-2026": ("Combien coûte un site vitrine", "Les fourchettes honnêtes"),
    "site-vitrine-pas-de-demandes-2026": ("Un site vitrine sans demandes", "Les 7 corrections prioritaires"),
    "page-contact-qui-convertit": ("Anatomie d'une page contact qui convertit", "7 éléments souvent absents"),
    "structure-compte-meta-ads-2026": ("Structurer un compte Meta Ads", "Le setup qui laisse l'algo travailler"),
    "angles-creatifs-publicite-meta": ("12 angles créatifs qui arrêtent le scroll", "Avec exemples décortiqués"),
    "pixel-meta-api-conversion-shopify": ("Pixel Meta et API de conversion", "L'installation propre sur Shopify"),
    "ad-library-analyser-pubs-concurrents": ("Décoder les publicités des concurrents", "La méthode Ad Library"),
    "calculer-roas-avec-marge": ("Calculer son ROAS avec sa marge", "Et arrêter de croire au chiffre brut"),
    "microsoft-clarity-trouver-fuites-conversion": ("Trouver ses fuites de conversion", "Microsoft Clarity en une heure"),
    "ab-testing-petit-trafic": ("A/B tester avec peu de trafic", "Ce qui est réellement testable"),
    "seo-ou-meta-ads-2026": ("SEO ou Meta Ads", "Quel levier pour votre acquisition"),
    "seo-ou-google-ads-par-quoi-commencer": ("SEO ou Google Ads", "Par quoi commencer"),
    "guide-seo-leads-2026": ("Transformer son SEO en machine à leads", "Le guide 2026"),
}

# Trois guides par page, choisis pour l'intention de la page.
PLAN = {
    "agence-seo": ["delais-resultats-seo", "comment-choisir-votre-agence-seo-sans-vous-faire-avoir", "combien-coute-le-seo-en-2026-et-pourquoi-fuir-le-200-euros-par-mois"],
    "seo-local": ["optimiser-fiche-google-business-profile", "creer-pages-villes-sans-duplicate", "obtenir-plus-avis-google"],
    "seo-ecommerce": ["collections-shopify-architecture-seo", "donnees-structurees-produit-google", "fiche-produit-structure-conversion"],
    "audit-seo": ["checklist-audit-seo", "combien-coute-audit-seo", "search-console-rapports-essentiels"],
    "agence-shopify": ["vitesse-shopify-optimisations", "apps-shopify-utiles-et-a-eviter", "boutique-shopify-qui-convertit-2026"],
    "creation-site-vitrine": ["cahier-des-charges-site-vitrine", "prix-site-vitrine-2026", "site-vitrine-pas-de-demandes-2026"],
    "meta-ads": ["structure-compte-meta-ads-2026", "angles-creatifs-publicite-meta", "pixel-meta-api-conversion-shopify"],
    "optimisation-cro": ["microsoft-clarity-trouver-fuites-conversion", "page-contact-qui-convertit", "ab-testing-petit-trafic"],
    "audit-meta-ads": ["calculer-roas-avec-marge", "structure-compte-meta-ads-2026", "pixel-meta-api-conversion-shopify"],
    "analyse-concurrentielle-meta-ads": ["ad-library-analyser-pubs-concurrents", "angles-creatifs-publicite-meta", "calculer-roas-avec-marge"],
    "audit-ecommerce": ["abandon-panier-corrections", "fiche-produit-structure-conversion", "microsoft-clarity-trouver-fuites-conversion"],
    "audit-merchant-center": ["donnees-structurees-produit-google", "collections-shopify-architecture-seo", "migrer-vers-shopify-sans-perdre-seo"],
    "site-vitrine-pme-tpe": ["cahier-des-charges-site-vitrine", "page-contact-qui-convertit", "prix-site-vitrine-2026"],
    "site-vitrine-freelance": ["eeat-prouver-expertise-google", "page-contact-qui-convertit", "site-vitrine-pas-de-demandes-2026"],
    "site-vitrine-restaurant": ["optimiser-fiche-google-business-profile", "obtenir-plus-avis-google", "page-contact-qui-convertit"],
    "site-vitrine-artisan": ["optimiser-fiche-google-business-profile", "obtenir-plus-avis-google", "creer-pages-villes-sans-duplicate"],
    "hub-villes": ["creer-pages-villes-sans-duplicate", "optimiser-fiche-google-business-profile", "recherche-mots-cles-methode-intentions"],
    "a-propos": ["eeat-prouver-expertise-google", "agence-seo-ou-consultant-seo", "comment-choisir-votre-agence-seo-sans-vous-faire-avoir"],
    "resultats": ["delais-resultats-seo", "search-console-rapports-essentiels", "calculer-roas-avec-marge"],
    "reserver": ["checklist-audit-seo", "combien-coute-audit-seo", "delais-resultats-seo"],
}

# Les seize zones puisent dans un vivier local, décalé d'une ville à l'autre :
# aucune n'affiche le même trio que sa voisine.
VIVIER = [
    "creer-pages-villes-sans-duplicate", "optimiser-fiche-google-business-profile",
    "obtenir-plus-avis-google", "recherche-mots-cles-methode-intentions",
    "delais-resultats-seo", "maillage-interne-cocon-semantique",
    "balises-title-formules-ctr", "checklist-audit-seo",
    "ai-overviews-rester-visible", "eeat-prouver-expertise-google",
    "core-web-vitals-explique-simplement", "search-console-rapports-essentiels",
    "refonte-site-sans-perdre-seo",
]
ZONES = ["seo-paris", "seo-lyon", "seo-rennes", "seo-lille", "seo-nice",
         "seo-toulouse", "seo-montpellier", "seo-strasbourg", "seo-grenoble",
         "seo-local-marseille", "seo-local-nantes", "seo-local-bordeaux",
         "agence-seo-luxembourg", "seo-suisse", "seo-belgique"]
for i, zone in enumerate(ZONES):
    PLAN[zone] = [VIVIER[(i * 3 + k) % len(VIVIER)] for k in range(3)]

ICONES = ["signal", "target", "layers", "gauge", "check"]


def section(guides, i):
    blocks, order = {}, []
    for n, handle in enumerate(guides, 1):
        titre, accroche = GUIDES[handle]
        cle = "g%d" % n
        blocks[cle] = {"type": "item", "settings": {
            "icon": ICONES[(i + n) % len(ICONES)],
            "title": titre, "text": accroche,
            "link": BLOG + handle, "link_label": "Lire le guide"}}
        order.append(cle)
    return {
        "type": "content-grid",
        "settings": {"surface": "paper", "density": "dense",
                     "eyebrow": "Pour aller plus loin",
                     "title": "Trois guides sur le sujet.", "text": ""},
        "blocks": blocks, "block_order": order,
    }


def main():
    touchees, liens = 0, 0
    for i, (suffixe, guides) in enumerate(sorted(PLAN.items())):
        path = OUT / ("page.%s.json" % suffixe)
        if not path.exists():
            print("  absent : %s" % path.name)
            continue
        tpl = json.loads(path.read_text(encoding="utf-8"))
        tpl["sections"]["lectures"] = section(guides, i)
        ordre = [k for k in tpl["order"] if k != "lectures"]
        # Juste avant l'appel à l'action final, jamais après.
        pos = ordre.index("cta") if "cta" in ordre else len(ordre)
        ordre.insert(pos, "lectures")
        tpl["order"] = ordre
        path.write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        touchees += 1
        liens += len(guides)
    print("maillage : %d pages, %d liens vers le blog" % (touchees, liens))
    manquants = {h for gs in PLAN.values() for h in gs} - set(GUIDES)
    if manquants:
        print("ACCROCHE MANQUANTE :", manquants)
        return 1

    reels = json.loads((pathlib.Path(__file__).parent / "blog_articles.json")
                       .read_text(encoding="utf-8"))
    morts = sorted(set(GUIDES) - set(reels))
    if morts:
        print("ARTICLES INEXISTANTS — ces liens seraient morts :")
        for h in morts:
            print("   ", h)
        return 1
    print("tous les handles correspondent à un article publié")
    return 0


if __name__ == "__main__":
    sys.exit(main())
