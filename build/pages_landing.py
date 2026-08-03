#!/usr/bin/env python3
"""
Landing de réservation et plan du site.

La page /reserver est une landing de conversion : elle ne décrit pas une
prestation, elle fait franchir un pas. Sa structure est donc plus courte et
plus resserrée que celle d'une page service, et elle assume de dire à qui
l'offre ne s'adresse pas — c'est ce qui qualifie les demandes.
"""
import json
import pathlib
from pages_services import hero, split, grid, steps, compare, faq, cta, write

def form_inline(eyebrow, title, text, points, cta_label, note, origine):
    """Formulaire posé dans la page. Utilisé là où le clic supplémentaire
    vers le tiroir de diagnostic coûterait des demandes."""
    blocks = {"p%d" % i: {"type": "point", "settings": {"text": txt}}
              for i, txt in enumerate(points, 1)}
    return {
        "type": "content-form",
        "settings": {
            "surface": "dark", "eyebrow": eyebrow, "title": title, "text": text,
            "cta_label": cta_label, "note": note, "origine": origine,
            "legal": "Vos informations servent uniquement à traiter votre demande. "
                     "Aucune revente, aucune inscription automatique.",
            "confirmation": "Nous revenons vers vous sous 48 h, à l'adresse indiquée."
        },
        "blocks": blocks,
        "block_order": list(blocks),
    }

write("reserver", [
 ("hero", hero(
   "Audit SEO offert",
   "Trente minutes pour savoir si votre référencement mérite un investissement.",
   "Nous relevons vos positions, l'état technique du site et ce que font vos concurrents, puis nous vous restituons trois priorités par téléphone. C'est gratuit, et cela ne vous engage à rien — pas même à nous rappeler.",
   "Réserver mon créneau", "Voir la prestation SEO", "/pages/agence-seo",
   proofs=[("", "30", " min", "d'échange"),
           ("", "3", " priorités", "argumentées"),
           ("", "0", " €", "et sans engagement")])),

 ("demande", form_inline(
   "Votre créneau",
   "Réservez votre audit en deux champs.",
   "Nous préparons l'analyse avant l'appel. Donnez-nous simplement de quoi vous "
   "recontacter et regarder votre site.",
   ["Trente minutes, par téléphone ou en visio",
    "Trois priorités écrites, que vous gardez",
    "Aucun engagement, aucune relance commerciale"],
   "Réserver mon créneau", "Gratuit — réponse sous 48 h", "landing-reserver")),

 ("contenu", grid(
   "Ce que contient l'échange",
   "Quatre points, dans cet ordre.",
   "Nous préparons l'analyse avant l'appel : le temps d'échange sert à discuter des conclusions, pas à découvrir votre site ensemble.",
   [("signal", "Vos positions actuelles", "Sur quelles requêtes vous apparaissez aujourd'hui, à quelle place, et depuis quelles zones géographiques."),
    ("target", "L'état technique", "Indexation, vitesse, structure, balisage. Ce qui bloque éventuellement tout le reste."),
    ("layers", "Ce que font vos concurrents", "Qui occupe vos requêtes, avec quel type de page, et pourquoi ces pages passent devant."),
    ("check", "Les trois priorités", "Ce par quoi commencer, dans quel ordre, avec un ordre de grandeur d'effort pour chacune.")],
   surface="dark")),

 ("filtre", compare(
   "Est-ce pour vous ?",
   "À qui cet audit sert, et à qui il ne sert pas.",
   "Nous préférons le dire avant : un créneau réservé pour rien coûte du temps aux deux parties.",
   "Utile si", "Inutile si",
   [("Votre site", "Il est en ligne depuis au moins six mois", "Il n'existe pas encore ou vient d'être lancé"),
    ("Votre objectif", "Vous voulez des demandes entrantes régulières", "Vous cherchez un résultat sous quinze jours"),
    ("Votre marché", "Vos clients cherchent votre service sur Google", "Votre activité repose entièrement sur la recommandation"),
    ("Votre disponibilité", "Vous pouvez appliquer ou faire appliquer", "Personne ne pourra rien mettre en œuvre"),
    ("Votre attente", "Un avis argumenté, y compris négatif", "Une confirmation que tout va bien")],
   "Si votre site a moins de six mois, l'audit n'aura pas assez de données pour être utile. Écrivez-nous quand même : nous vous dirons quoi mettre en place en attendant.",
   surface="paper")),

 ("deroule", steps(
   "Comment ça se passe",
   "Trois étapes, aucune surprise.",
   "",
   [("Vous décrivez votre situation", "Quatre questions dans le formulaire. Cela nous permet de préparer l'analyse avant l'appel.", "2 minutes"),
    ("Nous analysons", "Relevé de positions, contrôle technique, étude des concurrents sur vos requêtes principales.", "Sous 48 h"),
    ("Nous en parlons", "Trente minutes au téléphone ou en visioconférence, à l'heure qui vous arrange.", "À votre convenance")],
   surface="dark")),

 ("faq", faq(
   "Ce qu'on nous demande avant de réserver.",
   "",
   [("Pourquoi est-ce gratuit ?",
     "<p>Parce que c'est notre façon de qualifier les projets. Nous préférons consacrer quelques heures à comprendre une situation plutôt que d'envoyer une proposition commerciale à l'aveugle. Une partie des personnes que nous auditons ne devient pas cliente, et cela fait partie du calcul.</p>"),
    ("Vais-je subir un argumentaire de vente ?",
     "<p>Non. Nous présentons les constats et les priorités. Si vous voulez ensuite savoir ce que coûterait une intervention de notre part, vous demandez — sinon nous ne l'abordons pas. Le document reste utilisable sans nous.</p>"),
    ("Que se passe-t-il si mon site n'a aucun problème ?",
     "<p>Cela arrive, et nous vous le disons. L'échange sert alors à trouver ce qui vous bloque vraiment. Souvent votre offre, votre page ou vos publicités, plutôt que le référencement.</p>"),
    ("Faut-il me préparer ?",
     "<p>Non. Le formulaire suffit. Un accès en lecture à vos statistiques et à votre console de recherche rend l'analyse plus précise. Ce n'est pas indispensable pour un premier relevé.</p>")],
   surface="paper")),

 ("cta", cta(
   "Réserver",
   "Décrivez votre situation, nous préparons l'analyse.",
   "Quatre questions suffisent. Nous revenons vers vous sous deux jours ouvrés avec une proposition de créneau.",
   "Réserver mon créneau",
   points=("Gratuit et sans engagement", "Aucun argumentaire de vente", "Document utilisable sans nous"))),
])
print("écrit : page.reserver.json")

# Plan du site : gabarit dédié alimenté par les menus.
OUT = pathlib.Path(__file__).resolve().parent.parent / "theme" / "templates"
sitemap = {
  "sections": {
    "hero": {"type": "page-hero", "settings": {
      "show_breadcrumb": True, "eyebrow": "Plan du site",
      "title": "Trouvez la page qu'il vous faut, en une vue.",
      "lead": "Si vous cherchez quelque chose de précis, la recherche du site (Ctrl + K) est plus rapide. Cette page existe pour explorer l'ensemble.",
      "cta_primary": "", "cta_secondary": "", "cta_secondary_url": ""}},
    "plan": {"type": "page-sitemap", "settings": {
      "eyebrow": "Navigation",
      "title": "Toutes les pages du site",
      "text": "Cette page se construit automatiquement depuis les menus : elle reste à jour sans intervention.",
      "blog": "ressources", "blog_title": "Guides"},
      "blocks": {
        "m1": {"type": "menu", "settings": {"title": "Expertises", "menu": "menu-footer-services-cs26"}},
        "m2": {"type": "menu", "settings": {"title": "SEO par ville", "menu": "menu-footer-villes-cs26"}},
        "m3": {"type": "menu", "settings": {"title": "Ressources", "menu": "menu-footer-ressources-cs26"}},
        "m4": {"type": "menu", "settings": {"title": "Informations", "menu": "menu-legal-cs26"}},
      },
      "block_order": ["m1", "m2", "m3", "m4"]},
  },
  "order": ["hero", "plan"],
}
(OUT / "page.sitemap.json").write_text(
    json.dumps(sitemap, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("écrit : page.sitemap.json")
