#!/usr/bin/env python3
"""
Pages « site vitrine » par typologie de client.

Ces quatre pages sont le piège classique : même prestation, quatre publics. Si
on décline la même trame en changeant le nom du métier, Google n'en garde
qu'une et le visiteur ne se reconnaît dans aucune.

Chacune part donc d'une mécanique commerciale réellement différente :
— PME/TPE       : cycle long, plusieurs décideurs, le site outille les commerciaux
— Indépendant   : c'est une personne qu'on achète, pas une structure
— Restaurant    : dépendance aux plateformes, réservation en direct
— Artisan/BTP   : devis, zone d'intervention, preuve par le chantier
"""
from pages_services import (hero, split, grid, steps, compare, stats, quote,
                            faq, cta, write)

PAGES = {}

# ==========================================================================
# PME & TPE — cycle de vente long, plusieurs interlocuteurs
# Trame : hero → démonstration → périmètre → comparatif → FAQ → CTA
# ==========================================================================
PAGES["site-vitrine-pme-tpe"] = [
    ("hero", hero(
        "Site vitrine pour PME et TPE",
        "Un site qui travaille pour vos commerciaux entre deux rendez-vous.",
        "Dans une vente à cycle long, le site n'est presque jamais le point de contact final : il prépare, rassure et fait circuler l'information entre plusieurs interlocuteurs. Nous le concevons pour ce rôle-là.",
        "Cadrer mon projet", "Voir la création de site", "/pages/creation-site-vitrine",
        "Création de site", "/pages/creation-site-vitrine")),

    ("realite", split(
        "La réalité de votre cycle",
        "Votre acheteur n'est pas seul à décider.",
        "<p>Dans une PME, une décision d'achat passe par plusieurs mains : celui qui cherche, celui qui valide techniquement, celui qui signe. Ces trois personnes n'ont pas les mêmes questions et ne visitent pas votre site au même moment.</p><p>Un site qui ne parle qu'au premier laisse les deux autres sans réponse — et c'est souvent là que le dossier s'enlise.</p>",
        [("Pour celui qui cherche", "Compréhension rapide de l'offre, des cas traités et de l'ordre de grandeur budgétaire."),
         ("Pour celui qui valide", "Détail des méthodes, des références comparables, des garanties et des délais tenus."),
         ("Pour celui qui signe", "Solidité de l'entreprise, ancienneté, conformité, capacité à assumer l'engagement.")],
        surface="paper")),

    ("perimetre", grid(
        "Ce que nous construisons",
        "Un site structuré par métier et par cas d'usage.",
        "L'architecture prime sur le nombre de pages : mieux vaut six pages précises que vingt pages vagues.",
        [("layers", "Une page par métier", "Chaque prestation a sa page, avec son vocabulaire et ses objections propres. C'est aussi ce qui la rend référençable."),
         ("check", "Références comparables", "Un prospect se projette dans une entreprise de sa taille et de son secteur, pas dans votre plus gros client."),
         ("target", "Documents téléchargeables", "Plaquette, méthodologie, attestations. Ce qui circule en interne quand vous n'êtes pas dans la pièce."),
         ("gauge", "Formulaire qualifiant", "Quelques questions qui permettent à vos commerciaux d'arriver préparés au premier échange."),
         ("signal", "Preuves de solidité", "Ancienneté, effectifs, certifications, assurances. Rassure le signataire, pas l'utilisateur."),
         ("megaphone", "Actualités et recrutement", "Un site d'entreprise sert aussi la marque employeur, souvent négligée.")],
        surface="dark")),

    ("choix", compare(
        "Dimensionner le projet",
        "Ce qui sépare un site qui présente d'un site qui fait vendre.",
        "Les deux sont légitimes, mais ils n'ont ni le même coût ni le même effet.",
        "Site de génération de demandes", "Site de présentation",
        [("Nombre de pages", "Une par métier et par cible", "Trois à cinq pages"),
         ("Rédaction", "Écrite pour les requêtes du marché", "Descriptive"),
         ("Effet attendu", "Demandes entrantes régulières", "Crédibilité quand on vous cherche"),
         ("Travail après mise en ligne", "Continu", "Ponctuel"),
         ("Budget", "Plus élevé", "Contenu"),
         ("Pertinent si", "Vous voulez réduire la prospection sortante", "Votre activité vient du bouche-à-oreille")],
        "Si vos affaires viennent uniquement de la recommandation et que cela vous suffit, un site de présentation est le bon choix. Nous ne vous vendrons pas l'autre.",
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes des dirigeants de PME.",
        "",
        [("Combien de temps mes équipes devront-elles y consacrer ?",
          "<p>Comptez environ deux demi-journées d'entretien au cadrage, puis des relectures ponctuelles. Nous rédigeons à partir de ces échanges plutôt que d'attendre des textes de votre part — c'est le principal facteur de retard sur ce type de projet.</p>"),
         ("Peut-on démarrer par une seule page métier ?",
          "<p>Oui, et c'est souvent la bonne approche : on traite d'abord le métier le plus stratégique, on mesure l'effet sur les demandes entrantes, puis on étend. Cela répartit l'investissement et valide la méthode avant de l'industrialiser.</p>"),
         ("Que devient notre référencement existant ?",
          "<p>Il est protégé. Nous relevons vos pages positionnées avant toute refonte et nous établissons un plan de redirections complet. Une refonte sans ce travail préalable fait chuter le trafic pendant des mois — c'est l'accident le plus courant et le plus évitable.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Parlons de votre cycle de vente.",
        "Décrivez comment vos clients vous trouvent aujourd'hui et où le processus se bloque. Nous vous dirons ce qu'un site peut réellement y changer.",
        "Cadrer mon projet",
        points=("Devis détaillé", "Démarrage possible par un seul métier"))),
]

# ==========================================================================
# INDÉPENDANT & FREELANCE — on achète une personne
# Trame : hero → position → démonstration → étapes → FAQ → CTA
# ==========================================================================
PAGES["site-vitrine-freelance"] = [
    ("hero", hero(
        "Site pour indépendant et freelance",
        "Vos clients vous choisissent vous, avant de choisir votre offre.",
        "Quand vous êtes seul face au client, votre site vend une personne en qui on peut avoir confiance avant de l'avoir rencontrée. Cela change tout ce qu'il faut y mettre.",
        "Parler de mon site", "Voir la création de site", "/pages/creation-site-vitrine",
        "Création de site", "/pages/creation-site-vitrine")),

    ("position", quote(
        "Le contresens fréquent",
        "Beaucoup d'indépendants écrivent « nous » pour paraître plus gros. C'est exactement l'inverse qu'il faut faire : votre avantage sur une agence, c'est qu'on sait qui fera le travail. Le masquer revient à effacer votre seul argument imbattable.",
        "Clickscreation")),

    ("contenu", split(
        "Ce qui construit la confiance",
        "Quatre éléments décident, et ils sont rarement ceux qu'on soigne.",
        "<p>Les sites d'indépendants consacrent souvent l'essentiel de leur surface à la liste des compétences. Or personne ne choisit un prestataire sur une liste de compétences : on choisit sur la capacité perçue à comprendre son problème.</p><p>Nous réorganisons donc la page autour de ce que le client cherche à vérifier avant de vous écrire.</p>",
        [("Un visage et un nom", "Une photo réelle et une présentation directe. L'anonymat coûte plus cher qu'il ne protège."),
         ("Un périmètre assumé", "Ce que vous faites et ce que vous ne faites pas. Refuser un domaine renforce la crédibilité sur les autres."),
         ("Des cas racontés", "Deux ou trois missions détaillées valent mieux que quinze logos sans contexte."),
         ("Une disponibilité claire", "Délai de réponse, capacité actuelle, modalités de démarrage. Le flou fait renoncer.")],
        surface="paper")),

    ("deroule", steps(
        "Comment nous procédons",
        "Un format court, adapté à un budget d'indépendant.",
        "Nous savons que ce projet sort de votre poche. Le déroulé est resserré pour rester finançable sans sacrifier ce qui compte.",
        [("Entretien", "Une heure et demie pour comprendre votre activité, vos clients et ce qui vous distingue réellement.", "1 séance"),
         ("Rédaction", "Nous écrivons la totalité des textes. Vous relisez et corrigez, sans page blanche.", "1 semaine"),
         ("Design et intégration", "Un site court, rapide, sans fonctionnalité superflue à maintenir.", "2 semaines"),
         ("Mise en ligne", "Bascule, fiche d'établissement si pertinent, prise en main de l'administration.", "2 jours")],
        surface="dark")),

    ("faq", faq(
        "Questions fréquentes des indépendants.",
        "",
        [("Ai-je vraiment besoin d'un site si j'ai LinkedIn ?",
          "<p>LinkedIn vous rend visible auprès de qui vous cherche déjà par votre nom. Votre site vous rend trouvable auprès de gens qui cherchent votre compétence sans vous connaître. Et il vous appartient : un réseau social peut changer ses règles du jour au lendemain. Les deux se complètent plus qu'ils ne se remplacent.</p>"),
         ("Combien coûte un site d'indépendant ?",
          "<p>Nettement moins qu'un site d'entreprise multi-métiers, parce que le périmètre est plus court : moins de pages, une seule cible, pas de fonctionnalité complexe. Nous chiffrons après l'entretien et le devis reste ferme.</p>"),
         ("Puis-je le faire évoluer si mon activité change ?",
          "<p>Oui, c'est même prévu : les sections sont modulaires et vous ajoutez ou réorganisez les blocs vous-même. Une activité d'indépendant bouge souvent dans les deux premières années, le site doit suivre sans nous solliciter à chaque fois.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Racontez-nous ce que vous faites.",
        "Un échange d'une heure suffit pour savoir ce que votre site devrait dire — et si vous avez besoin de nous pour l'écrire.",
        "Prendre contact",
        points=("Périmètre court et chiffré", "Aucun abonnement caché"))),
]

# ==========================================================================
# RESTAURANT & CHR — reprendre la main sur les plateformes
# Trame : hero → chiffres → démonstration inversée → périmètre → FAQ → CTA
# ==========================================================================
PAGES["site-vitrine-restaurant"] = [
    ("hero", hero(
        "Site pour restaurant et hôtellerie",
        "Chaque réservation en direct vous fait économiser la commission.",
        "Les plateformes vous apportent du volume et prélèvent leur part sur chaque couvert. Votre site récupère les clients qui vous cherchent déjà par votre nom. Sur ceux-là, vous encaissez la totalité.",
        "Parler de mon établissement", "Voir le SEO local", "/pages/seo-local",
        "Création de site", "/pages/creation-site-vitrine")),

    ("enjeu", stats(
        "Ce qui se joue",
        "Trois mécaniques propres à la restauration.",
        [("Recherche de marque", "On vous cherche par votre nom", "Un client qui tape le nom de votre établissement doit tomber sur vous, pas sur une plateforme qui prélèvera une commission."),
         ("Décision rapide", "Quelques minutes", "Menu, horaires, adresse et réservation doivent être atteignables immédiatement, sur mobile, souvent depuis la rue."),
         ("Preuve visuelle", "La photo décide", "Dans ce secteur, l'image porte la décision plus que le texte. Des visuels faibles annulent le reste.")],
        source="Mécaniques observées dans le secteur. Leur intensité varie selon le type d'établissement et l'emplacement.",
        surface="dark")),

    ("priorite", split(
        "L'ordre des priorités",
        "Le menu et les horaires avant l'histoire de la maison.",
        "<p>La page d'accueil d'un restaurant s'ouvre le plus souvent sur un texte d'ambiance, tandis que le menu se cache derrière un fichier à télécharger. C'est l'exact inverse de ce que cherche le visiteur.</p><p>Nous plaçons en premier ce qui déclenche la venue, et nous gardons le récit pour ceux qui font défiler — ils existent, mais ils sont minoritaires.</p>",
        [("Un menu lisible sur mobile, sans PDF", "Un document à télécharger n'est ni lisible sur mobile ni indexable. Le menu doit être du texte réel."),
         ("Réservation en deux clics", "Depuis n'importe quelle page, sans compte à créer, avec confirmation immédiate."),
         ("Informations pratiques visibles", "Horaires à jour, adresse cliquable vers l'itinéraire, téléphone appelable d'un doigt.")],
        surface="paper", reverse=True)),

    ("perimetre", grid(
        "Ce que nous mettons en place",
        "Six éléments, dans cet ordre.",
        "",
        [("cart", "Menu structuré", "Plats, prix, allergènes et suggestions du moment, modifiables par vous en quelques minutes."),
         ("target", "Réservation directe", "Intégration du module de votre choix, ou formulaire simple si vous gérez au téléphone."),
         ("signal", "Fiche d'établissement", "Photos, horaires, plats mis en avant, réponses aux avis. Souvent le premier point de contact réel."),
         ("layers", "Pages événements", "Privatisation, groupes, brunchs, service traiteur : des demandes à forte valeur, rarement traitées."),
         ("gauge", "Vitesse mobile", "Vos visiteurs sont dehors, parfois en mauvaise réception. Un site lourd perd le client au coin de la rue."),
         ("check", "Photos exploitées", "Cadrage, poids et disposition. Nous ne photographions pas, mais nous savons mettre en valeur ce que vous avez.")],
        surface="dark")),

    ("faq", faq(
        "Questions fréquentes en restauration.",
        "",
        [("Dois-je quitter les plateformes de réservation ?",
          "<p>Non, et ce serait risqué. Elles apportent une clientèle de découverte que vous n'atteindriez pas autrement. L'objectif est de récupérer en direct les clients qui vous connaissent déjà — ce sont les plus rentables et ceux pour lesquels la commission est la moins justifiée.</p>"),
         ("Puis-je changer le menu moi-même ?",
          "<p>Oui, c'est un point non négociable dans nos projets de restauration. Un menu qu'il faut faire modifier par un prestataire n'est jamais à jour. Vous modifiez plats, prix et suggestions depuis une interface simple, en quelques minutes.</p>"),
         ("Faites-vous les photos ?",
          "<p>Non, ce n'est pas notre métier et un photographe culinaire fera bien mieux. Nous vous indiquons précisément ce dont le site a besoin — cadrages, formats, nombre de visuels — pour que la séance soit utile du premier coup.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Parlons de votre établissement.",
        "Dites-nous où vous en êtes : site existant, plateformes utilisées, part de réservations en direct. Nous vous dirons ce qui est récupérable.",
        "Prendre contact",
        link="Voir le référencement local", link_url="/pages/seo-local",
        points=("Menu modifiable par vous", "Réservation en direct"))),
]

# ==========================================================================
# ARTISAN & BTP — le devis, la zone, la preuve par le chantier
# Trame : hero → démonstration inversée → étapes → périmètre → FAQ → CTA
# ==========================================================================
PAGES["site-vitrine-artisan"] = [
    ("hero", hero(
        "Site pour artisan et entreprise du bâtiment",
        "Recevez des demandes de devis dans votre métier et votre zone.",
        "Le problème d'un artisan visible n'est pas le nombre d'appels, c'est leur qualité : hors zone, hors métier, hors budget. Un site bien construit filtre en amont et vous fait gagner les heures que vous passez à décliner.",
        "Parler de mon activité", "Voir le SEO local", "/pages/seo-local",
        "Création de site", "/pages/creation-site-vitrine")),

    ("filtre", split(
        "Le vrai enjeu",
        "Un bon site vous fait recevoir moins d'appels, et de meilleurs.",
        "<p>Beaucoup d'artisans nous décrivent la même journée : quinze appels, dont trois dans la zone, deux dans le métier, et un seul avec un budget réaliste. Le temps perdu ne se rattrape pas le soir.</p><p>Nous rendons donc explicites les trois critères qui écartent les demandes non pertinentes — sans faire fuir les bonnes.</p>",
        [("La zone, écrite noir sur blanc", "Communes couvertes et rayon d'intervention. Le flou géographique génère l'essentiel des appels inutiles."),
         ("Le périmètre de métier", "Ce que vous prenez, ce que vous ne prenez pas. Un refus clair vaut mieux qu'un devis jamais envoyé."),
         ("L'ordre de grandeur", "Une fourchette ou un montant minimum d'intervention. C'est l'information la plus évitée et la plus efficace.")],
        surface="paper", reverse=True)),

    ("deroule", steps(
        "Comment ça se passe",
        "Un projet calé sur votre disponibilité.",
        "Vous êtes sur les chantiers la journée. Nous organisons le projet pour qu'il n'exige jamais votre présence en pleine semaine.",
        [("Un entretien téléphonique", "Une heure, en fin de journée si besoin. Métiers, zone, clients types, chantiers dont vous êtes fier.", "1 appel"),
         ("Nous rédigeons", "Textes, structure, pages par métier et par commune. Vous validez par retour, sans rien écrire.", "1 semaine"),
         ("Vos photos de chantier", "Nous vous disons quoi photographier avec votre téléphone. Le avant-après vaut tous les arguments.", "À votre rythme"),
         ("Mise en ligne", "Site, fiche d'établissement, demande de devis. Vous recevez les demandes par courriel et par SMS.", "2 semaines")],
        surface="dark")),

    ("perimetre", grid(
        "Ce que comprend le site",
        "",
        "",
        [("layers", "Une page par métier", "Chaque prestation a sa page : c'est ce qui vous rend trouvable sur des recherches précises plutôt que génériques."),
         ("signal", "Pages par commune", "Vos villes d'intervention réellement travaillées, pas une liste dupliquée."),
         ("check", "Galerie de chantiers", "Avant-après classés par métier. La preuve la plus convaincante de votre secteur."),
         ("target", "Demande de devis qualifiante", "Type de travaux, commune, échéance, photos jointes. Vous savez si ça vaut le déplacement avant de rappeler."),
         ("gauge", "Garanties et assurances", "Décennale, certifications, qualifications. Ce que vérifie un particulier avant de signer."),
         ("megaphone", "Avis clients", "Collecte organisée après chantier, quand la satisfaction est à son maximum.")],
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes des artisans.",
        "",
        [("Je n'ai pas le temps de m'occuper d'un site.",
          "<p>C'est la remarque la plus fréquente et elle est légitime. Concrètement, votre contribution se limite à un entretien téléphonique et à des photos prises au téléphone entre deux chantiers. Nous nous chargeons de tout le reste, y compris de la rédaction.</p>"),
         ("Faut-il afficher mes prix ?",
          "<p>Pas nécessairement un tarif exact, mais un ordre de grandeur ou un montant minimum d'intervention, oui. C'est ce qui écarte les demandes irréalistes avant qu'elles ne vous coûtent un déplacement. Les artisans qui franchissent ce pas reçoivent moins d'appels et signent davantage.</p>"),
         ("Est-ce que ça remplace les plateformes de mise en relation ?",
          "<p>À terme, cela réduit fortement votre dépendance. Une demande arrivée par votre site ne se paie pas au lead et ne vous met pas en concurrence immédiate avec trois confrères. Mais cela demande quelques mois de référencement local avant de produire un volume régulier — nous ne promettons pas l'inverse.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Un appel en fin de journée suffit pour démarrer.",
        "Dites-nous vos métiers, vos communes et le type de chantiers que vous cherchez. Nous vous dirons ce qu'un site peut vous apporter et sous quel délai.",
        "Être rappelé",
        link="Voir le référencement local", link_url="/pages/seo-local",
        points=("Un seul entretien nécessaire", "Nous rédigeons tout"))),
]

if __name__ == "__main__":
    for suffix, sections in PAGES.items():
        print("écrit :", write(suffix, sections))
