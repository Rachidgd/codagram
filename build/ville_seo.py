"""Gabarit de transition pour les villes qui partagent encore le suffixe
ville-seo. Ce n'est pas un repli vide : c'est une vraie page de référencement
local, autonome et rédigée, qui tient tant que les suffixes dédiés ne sont pas
activés — et qui reste utile ensuite pour toute nouvelle ville."""
from pages_services import hero, split, grid, faq, cta, write

write("ville-seo", [
 ("hero", hero(
   "Référencement local",
   "Apparaître quand un client cherche un professionnel près de chez lui.",
   "Sur une recherche de proximité, Google ne classe pas les sites comme ailleurs : il pondère la distance, la cohérence de vos informations et votre réputation. Nous travaillons ces trois signaux ensemble, zone par zone.",
   "Demander un relevé de position", "Voir toutes les zones", "/pages/seo-par-ville",
   "SEO local", "/pages/seo-local")),

 ("mecanique", split(
   "Comment ça marche",
   "Trois signaux décident, et deux sont sous votre contrôle.",
   "<p>La distance entre le chercheur et votre établissement, vous ne la maîtrisez pas. En revanche, la qualité de votre fiche et la cohérence de vos informations sur l'ensemble du web dépendent entièrement de vous — et ce sont elles qui font la différence entre deux concurrents également proches.</p><p>C'est pourquoi une mission locale commence presque toujours par ces deux chantiers avant de toucher au site.</p>",
   [("Votre fiche d'établissement", "Catégories, description, horaires, photos, zones desservies. Le levier le plus rapide et le plus souvent négligé."),
    ("La cohérence de vos coordonnées", "Une adresse écrite de trois façons différentes sur trois annuaires affaiblit un signal que Google recoupe."),
    ("Vos avis clients", "Volume, régularité et réponses. Ils pèsent sur le classement et davantage encore sur le choix final.")],
   surface="paper")),

 ("intervention", grid(
   "Notre intervention",
   "Ce que nous mettons en place sur une zone.",
   "L'ordre dépend de votre point de départ : une fiche inexistante et une fiche mal renseignée n'appellent pas le même effort.",
   [("target", "Reprise de la fiche", "Renseignement complet, choix des catégories, photos, questions-réponses et publications régulières."),
    ("signal", "Page de zone rédigée", "Un contenu propre au territoire : tissu local, références situées, demandes spécifiques. Jamais une copie avec un nom changé."),
    ("check", "Correction des citations", "Vérification de vos coordonnées sur les annuaires qui comptent réellement dans votre secteur."),
    ("gauge", "Collecte d'avis", "Une méthode simple pour obtenir des avis en continu plutôt qu'une campagne isolée sans lendemain."),
    ("layers", "Balisage local", "Données structurées d'établissement, horaires et zone d'intervention, lisibles sans ambiguïté par les moteurs."),
    ("megaphone", "Suivi géolocalisé", "Positions relevées depuis plusieurs points de la zone : un classement local varie fortement d'un quartier à l'autre.")],
   surface="dark")),

 ("faq", faq(
   "Questions fréquentes sur la visibilité locale.",
   "",
   [("Combien de temps avant d'apparaître dans le bloc cartographique ?",
     "<p>Sur une fiche existante mais mal renseignée, les premiers mouvements arrivent souvent en trois à six semaines après reprise. Sur une fiche nouvellement créée, comptez plus longtemps : l'ancienneté et le volume d'avis pèsent, et ils ne se rattrapent pas en quelques jours.</p>"),
    ("Puis-je apparaître dans plusieurs villes ?",
     "<p>Dans le bloc cartographique, uniquement là où vous avez une adresse vérifiable — les adresses de complaisance sont détectées et sanctionnées. Dans les résultats classiques en revanche, une page de service dédiée à une zone peut se positionner sans y être implanté, à condition d'avoir un contenu réellement pertinent pour ce territoire.</p>"),
    ("Faut-il répondre aux avis négatifs ?",
     "<p>Oui, systématiquement et sans agressivité. La réponse n'est pas écrite pour l'auteur de l'avis mais pour les dizaines de prospects qui la liront ensuite. Une réponse posée à une critique dure rassure souvent plus que dix avis élogieux sans commentaire.</p>")],
   surface="paper")),

 ("cta", cta(
   "Étape suivante",
   "Un relevé de position sur votre zone.",
   "Indiquez-nous votre activité et vos communes d'intervention. Nous mesurons où vous apparaissez aujourd'hui depuis chacune d'elles, et l'état réel de votre fiche.",
   "Demander le relevé",
   link="Voir la prestation SEO local", link_url="/pages/seo-local",
   points=("Relevé géolocalisé", "Sans engagement"))),
])
print("écrit : page.ville-seo.json")
