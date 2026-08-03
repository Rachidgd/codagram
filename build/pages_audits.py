#!/usr/bin/env python3
"""
Gabarits des spécialisations SEO et des pages d'audit.

Les cinq pages d'audit sont le piège à duplication le plus évident du site :
même format commercial, même promesse, même structure. Chacune reçoit donc un
angle distinct — ce que l'audit regarde, ce qu'il ne regarde pas, et à qui il
ne s'adresse pas.
"""
from pages_services import (hero, split, grid, steps, compare, stats, quote,
                            faq, cta, write)

PAGES = {}

# ==========================================================================
# SEO LOCAL — angle : la proximité se gagne sur la fiche, pas sur le site seul
# Trame : hero → chiffres → périmètre → démonstration → étapes → FAQ → CTA
# ==========================================================================
PAGES["seo-local"] = [
    ("hero", hero(
        "Référencement local",
        "Être trouvé par les clients qui sont déjà à côté de vous.",
        "Quand quelqu'un cherche un professionnel près de chez lui, Google regarde trois choses : votre proximité, la cohérence de vos informations et votre réputation. Nous travaillons ces trois signaux, dans cet ordre.",
        "Évaluer ma visibilité locale", "Voir les zones couvertes", "/pages/seo-par-ville",
        "Expertises", "/pages/agence-seo")),

    ("enjeux", stats(
        "Ce qui se joue",
        "Trois mécaniques propres à la recherche locale.",
        [("Le trio local", "Les trois fiches du haut", "Le bloc cartographique capte l'essentiel des clics sur une recherche de proximité. Y figurer change tout."),
         ("La distance", "Un critère que vous ne contrôlez pas", "Google pondère l'éloignement du chercheur. D'où l'intérêt de pages par zone plutôt qu'une page générique."),
         ("La cohérence", "Nom, adresse, téléphone", "Une adresse écrite différemment sur trois annuaires affaiblit un signal que Google recoupe.")],
        source="Mécaniques générales du référencement local. Leur poids varie selon le secteur et la densité concurrentielle.",
        surface="dark")),

    ("perimetre", grid(
        "Périmètre",
        "Ce que couvre une mission de SEO local.",
        "L'ordre d'intervention dépend de votre point de départ : une fiche inexistante et une fiche mal optimisée n'appellent pas le même effort.",
        [("target", "Fiche d'établissement", "Catégories, description, horaires, zones desservies, photos, questions-réponses. C'est ce qui produit un effet le plus vite."),
         ("signal", "Pages par zone", "Une page par ville réellement travaillée, avec un contenu propre. Dupliquer une page en changeant le nom de la ville ne fonctionne plus."),
         ("layers", "Cohérence des citations", "Vérification et correction de vos coordonnées sur les annuaires qui comptent dans votre secteur."),
         ("gauge", "Avis clients", "Méthode de collecte régulière, réponse aux avis, traitement des avis négatifs. Un signal de classement autant qu'un signal de confiance."),
         ("check", "Balisage local", "Données structurées d'établissement, horaires, zone d'intervention. Ce que les moteurs lisent sans ambiguïté."),
         ("megaphone", "Suivi par zone", "Positions mesurées depuis chaque secteur visé, pas depuis un point unique — un classement local varie d'un quartier à l'autre.")],
        surface="paper")),

    ("erreur", split(
        "L'erreur à éviter",
        "Dupliquer une page en changeant le nom de la ville ne marche plus.",
        "<p>C'est la méthode la plus répandue et la plus contre-productive : produire trente pages identiques où seul le toponyme change. Les moteurs identifient ces gabarits, n'en retiennent qu'une, et l'ensemble finit ignoré.</p><p>Une page locale doit dire quelque chose de vrai sur ce territoire : son tissu économique, la concurrence qui s'y trouve, les demandes spécifiques qu'on y reçoit. Sinon elle n'a aucune raison d'exister.</p>",
        [("Un contexte réel par zone", "Secteurs dominants, typologie de clients, saisonnalité. Ce qui rend la page défendable."),
         ("Des preuves situées", "Réalisations, avis ou références rattachés à la zone quand ils existent — et rien d'inventé quand ils n'existent pas."),
         ("Un maillage réfléchi", "Les pages locales se relient entre elles et à la page mère sans créer de concurrence interne.")],
        surface="dark", reverse=True)),

    ("deroule", steps(
        "Déroulé",
        "Quatre temps, du plus rapide au plus structurant.",
        "",
        [("État des lieux", "Position actuelle par zone, état de la fiche, cohérence des coordonnées, analyse des concurrents locaux.", "Semaine 1"),
         ("Fiche et citations", "Corrections immédiates. C'est souvent ce qui produit le premier mouvement visible.", "Semaines 1-2"),
         ("Pages de zone", "Rédaction et mise en ligne progressive, en commençant par les secteurs à plus fort potentiel.", "Semaines 2-8"),
         ("Avis et suivi", "Mise en place de la collecte, mesure par zone, arbitrages sur les secteurs à renforcer.", "En continu")],
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes sur le SEO local.",
        "",
        [("Puis-je apparaître dans une ville où je n'ai pas d'adresse ?",
          "<p>Dans le bloc cartographique, non : il exige une présence physique vérifiable et Google sanctionne les adresses de complaisance. Dans les résultats classiques en revanche, oui — une page de service dédiée à cette zone peut se positionner si son contenu est réellement pertinent pour ce territoire.</p>"),
         ("Combien de pages de villes faut-il créer ?",
          "<p>Autant que vous pouvez en défendre sérieusement, pas plus. Cinq pages documentées valent mieux que trente coquilles. Nous partons de vos zones d'intervention réelles et de celles où vous acceptez effectivement de vous déplacer.</p>"),
         ("Les avis influencent-ils vraiment le classement ?",
          "<p>Leur volume, leur régularité et leur fraîcheur comptent parmi les signaux locaux — et ils influencent surtout le taux de clic une fois affiché. Une fiche avec quarante avis récents est choisie devant une fiche à trois avis anciens, même mieux classée.</p>"),
         ("Intervenez-vous si j'ai plusieurs établissements ?",
          "<p>Oui, et la logique change : il faut une fiche par établissement, une page par établissement, et une architecture qui évite que vos propres pages se concurrencent. C'est un cas fréquent que nous traitons régulièrement.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Voyons où vous apparaissez réellement.",
        "Indiquez-nous votre activité et vos zones. Nous regardons votre position actuelle depuis chacune d'elles et l'état de votre fiche d'établissement.",
        "Évaluer ma visibilité locale",
        link="Voir toutes les zones", link_url="/pages/seo-par-ville",
        points=("Relevé par zone", "Sans engagement"))),
]

# ==========================================================================
# SEO E-COMMERCE — angle : le catalogue est une architecture, pas une liste
# Trame : hero → démonstration → comparatif → périmètre → position → FAQ → CTA
# ==========================================================================
PAGES["seo-ecommerce"] = [
    ("hero", hero(
        "Référencement e-commerce",
        "Vos catégories rapportent plus que vos fiches produit.",
        "Vos acheteurs arrivent presque toujours par les pages de catégorie. Nous construisons d'abord cette architecture : c'est elle qui capte le trafic qui achète.",
        "Auditer ma boutique", "Voir l'agence Shopify", "/pages/agence-shopify",
        "Expertises", "/pages/agence-seo",
        proofs=[("", "1", " page", "par intention d'achat"),
                ("", "0", "", "contenu dupliqué toléré")])),

    ("principe", split(
        "Le principe",
        "Une intention d'achat, une page — et une seule.",
        "<p>« Chaussures de running », « chaussures de running femme », « chaussures de running trail » : trois intentions différentes, donc trois pages distinctes. À l'inverse, une même intention couverte par une catégorie, un filtre et une page de contenu crée trois concurrents internes qui s'annulent.</p><p>La première étape d'une mission e-commerce est presque toujours un travail de tri : quelles pages garder, lesquelles fusionner, lesquelles rediriger.</p>",
        [("Cartographie du catalogue", "Chaque intention commerciale est rattachée à une seule page canonique. Le reste est fusionné ou redirigé."),
         ("Filtres maîtrisés", "Certaines combinaisons méritent d'être indexées, la plupart non. Sans arbitrage, un catalogue génère des milliers d'URL inutiles."),
         ("Fiches produit utiles", "Description propre, attributs structurés, avis, disponibilité. Elles convertissent plus qu'elles n'attirent — et c'est normal.")],
        surface="paper")),

    ("comparaison", compare(
        "Où investir en premier",
        "Commencez par les catégories : elles rapportent plus vite.",
        "La réponse dépend de la taille du catalogue et de la notoriété de vos marques.",
        "Pages de catégorie", "Fiches produit",
        [("Volume de recherche capté", "Élevé", "Faible sauf marques connues"),
         ("Effort de production", "Concentré sur peu de pages", "Multiplié par le catalogue"),
         ("Durée de vie", "Longue", "Limitée à la vie du produit"),
         ("Risque de duplication", "Faible si l'arbitrage est fait", "Élevé — descriptions fournisseur"),
         ("Rôle dans le parcours", "Attirer et orienter", "Rassurer et déclencher"),
         ("À traiter en priorité si", "Catalogue large, marques peu recherchées", "Vous vendez des références nominatives")],
        "Dans la majorité des boutiques que nous reprenons, l'effort part sur les fiches alors que les catégories captent la demande. Nous inversons cet ordre.",
        surface="dark")),

    ("perimetre", grid(
        "Périmètre",
        "Ce que couvre la mission.",
        "",
        [("layers", "Architecture du catalogue", "Arborescence, canoniques, gestion des filtres et de la pagination, plan de redirections."),
         ("signal", "Recherche d'intentions", "Requêtes réelles de votre marché, classées par niveau de maturité d'achat."),
         ("check", "Contenus de catégorie", "Textes qui aident à choisir, pas des paragraphes ajoutés en bas de page pour remplir."),
         ("cart", "Fiches produit", "Structure, attributs, données structurées produit, avis et disponibilité."),
         ("gauge", "Performance", "Vitesse mobile, images, scripts. Sur une boutique, la lenteur coûte deux fois : classement et conversion."),
         ("target", "Suivi commercial", "Positions rapprochées du chiffre d'affaires par catégorie, pas seulement du trafic.")],
        surface="paper", density="dense")),

    ("position", quote(
        "Ce que nous ne ferons pas",
        "Nous ne produirons pas de texte de catégorie destiné aux moteurs et illisible pour vos clients. Si un paragraphe n'aide pas à choisir un produit, il n'a rien à faire sur la page — quel que soit son intérêt supposé pour le référencement.",
        "Clickscreation")),

    ("faq", faq(
        "Questions fréquentes sur le SEO e-commerce.",
        "",
        [("Que faire des descriptions fournisseur ?",
          "<p>Les réécrire sur les produits qui comptent, et assumer de les laisser telles quelles sur la longue traîne. Réécrire dix mille fiches n'est ni finançable ni utile : mieux vaut traiter les deux cents références qui font l'essentiel du chiffre et structurer correctement le reste.</p>"),
         ("Faut-il indexer les pages de filtres ?",
          "<p>Seulement celles qui correspondent à une vraie demande — une couleur ou une taille recherchées explicitement, par exemple. Les autres combinaisons doivent rester non indexées, sinon le catalogue génère des milliers d'URL quasi identiques qui diluent l'exploration.</p>"),
         ("Comment gérer les produits épuisés ou supprimés ?",
          "<p>Jamais par une suppression sèche renvoyant une erreur. Selon le cas : maintien de la page avec proposition d'alternatives si le produit revient, ou redirection vers la catégorie parente s'il disparaît définitivement. Un catalogue qui bouge sans plan de redirections perd du classement chaque saison.</p>"),
         ("Travaillez-vous uniquement sur Shopify ?",
          "<p>Non, mais c'est notre terrain principal et celui où nous intervenons directement dans le thème. Sur d'autres plateformes, nous produisons les recommandations et travaillons avec votre équipe technique pour la mise en œuvre.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Regardons ce que capte réellement votre catalogue.",
        "Communiquez-nous l'adresse de votre boutique et un accès en lecture à vos données de recherche. Nous identifions les pages qui se font concurrence et les intentions non couvertes.",
        "Auditer ma boutique",
        link="Voir l'audit e-commerce", link_url="/pages/audit-ecommerce",
        points=("Analyse du catalogue", "Plan de redirections chiffré"))),
]

# ==========================================================================
# AUDIT SEO — angle : un audit se juge à ce qu'on en fait
# Trame : hero → étapes → livrables → position → FAQ → CTA
# ==========================================================================
PAGES["audit-seo"] = [
    ("hero", hero(
        "Audit de référencement",
        "Repartez avec trois priorités chiffrées et un ordre d'exécution.",
        "Nous analysons la technique, la structure sémantique et la concurrence de votre site, puis nous vous remettons trois priorités argumentées et chiffrées. Pas une liste de deux cents points classés par couleur.",
        "Demander l'audit", "Voir la prestation SEO", "/pages/agence-seo",
        "Audits", "/pages/audit-ecommerce",
        proofs=[("", "3", " priorités", "au lieu d'une liste"),
                ("", "10", " jours", "de délai"),
                ("", "1", " restitution", "commentée en direct")])),

    ("deroule", steps(
        "Déroulé",
        "Ce que nous faisons pendant ces dix jours.",
        "",
        [("Exploration technique", "Indexation, exploration, redirections, vitesse, balisage, données structurées, versions mobiles.", "Jours 1-3"),
         ("Analyse sémantique", "Couverture des intentions de votre marché, pages en concurrence interne, contenus orphelins.", "Jours 3-6"),
         ("Étude concurrentielle", "Qui occupe vos requêtes, avec quel type de page, et pourquoi ces pages gagnent.", "Jours 6-8"),
         ("Restitution", "Document écrit puis échange d'une heure. Vous posez vos questions, nous justifions chaque priorité.", "Jour 10")],
        surface="dark")),

    ("livrables", grid(
        "Ce que vous recevez",
        "Quatre livrables exploitables.",
        "Tout est rédigé pour être compris par un dirigeant, avec les détails techniques en annexe pour votre développeur.",
        [("target", "Les trois priorités", "Classées par rapport entre effort et gain attendu, avec le raisonnement qui mène à ce classement."),
         ("signal", "Carte des intentions", "Ce que cherche votre marché, ce que vous couvrez déjà, et les manques qui valent le coût de production."),
         ("layers", "Correctifs techniques", "Liste actionnable, formulée pour un développeur, avec le niveau d'urgence réel de chaque point."),
         ("check", "Trajectoire", "Ce qui est atteignable à trois, six et douze mois compte tenu de votre point de départ et de la concurrence.")],
        surface="paper")),

    ("position", quote(
        "Notre engagement",
        "Si l'audit conclut que le référencement n'est pas votre levier prioritaire, nous vous le disons et nous vous orientons ailleurs. Un audit dont la conclusion est connue d'avance n'est pas un audit, c'est une plaquette commerciale.",
        link="Voir nos autres leviers", link_url="/pages/optimisation-cro")),

    ("faq", faq(
        "Questions fréquentes sur l'audit SEO.",
        "",
        [("L'audit est-il payant ?",
          "<p>Le pré-diagnostic est gratuit : quelques questions, un premier relevé, et notre avis sur l'existence d'un enjeu réel. L'audit complet, qui mobilise plusieurs jours de travail, est facturé. Nous vous annonçons le montant avant de commencer, et il est déduit si vous poursuivez avec un accompagnement.</p>"),
         ("De quels accès avez-vous besoin ?",
          "<p>Un accès en lecture à vos statistiques d'audience et à votre console de recherche, l'adresse du site, et si possible un accès en consultation à l'administration. Nous ne modifions rien pendant l'audit — la phase d'analyse est strictement passive.</p>"),
         ("En quoi diffère-t-il d'un audit automatique gratuit ?",
          "<p>Un outil automatique liste des anomalies sans les hiérarchiser. Il signale au même niveau une balise manquante sans effet et un blocage d'indexation qui vous coûte la moitié de votre trafic. Le travail que nous facturons, c'est précisément cet arbitrage.</p>"),
         ("Que se passe-t-il après ?",
          "<p>Vous appliquez vous-même, vous faites appliquer par votre prestataire, ou vous nous confiez la mise en œuvre. Les trois options sont légitimes et le document est écrit pour rester exploitable sans nous.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Commençons par le pré-diagnostic gratuit.",
        "Quelques questions suffisent pour savoir si un audit complet se justifie chez vous — ou si le problème est ailleurs.",
        "Demander le pré-diagnostic",
        points=("Gratuit et sans engagement", "Réponse argumentée"))),
]

# ==========================================================================
# AUDIT META ADS — angle : lire le compte avant de juger les créations
# Trame : hero → périmètre → étapes → comparatif → FAQ → CTA
# ==========================================================================
PAGES["audit-meta-ads"] = [
    ("hero", hero(
        "Audit publicitaire Meta",
        "Savoir où part votre budget avant d'en dépenser plus.",
        "Nous reprenons l'historique complet de votre compte : structure, audiences, créations, suivi des conversions et rentabilité réelle par campagne. Vous saurez ce qui produit, ce qui coûte, et ce qui devrait être arrêté aujourd'hui.",
        "Demander l'audit", "Voir la prestation Meta Ads", "/pages/expert-meta-ads",
        "Audits", "/pages/audit-seo")),

    ("perimetre", grid(
        "Ce que nous examinons",
        "Six angles d'analyse.",
        "L'ordre n'est pas neutre : un problème de suivi rend l'analyse des créations inexploitable, on commence donc par là.",
        [("signal", "Fiabilité du suivi", "Pixel, conversions serveur, doublons d'événements, correspondance avec vos ventes réelles. Le point de départ obligatoire."),
         ("layers", "Structure du compte", "Chevauchement d'audiences, campagnes qui s'enchérissent entre elles, budgets fragmentés."),
         ("megaphone", "Angles créatifs", "Combien d'idées réellement différentes sont testées, et depuis combien de temps elles tournent."),
         ("target", "Audiences", "Pertinence, taille, degré de recoupement, dépendance excessive au reciblage."),
         ("gauge", "Pages de destination", "Cohérence entre la promesse publicitaire et ce que trouve le visiteur après le clic."),
         ("check", "Rentabilité réelle", "Coût par acquisition rapporté à votre marge, pas au chiffre d'affaires affiché dans l'interface.")],
        surface="dark")),

    ("deroule", steps(
        "Déroulé",
        "Une semaine, trois temps.",
        "",
        [("Accès et cadrage", "Vous nous donnez un accès en lecture. Nous cadrons vos objectifs et votre marge réelle par produit ou prestation.", "Jour 1"),
         ("Analyse", "Reprise de l'historique disponible, croisement avec vos données de vente, identification des écarts.", "Jours 2-5"),
         ("Restitution", "Document commenté et échange. Vous repartez avec ce qu'il faut arrêter, garder et tester en priorité.", "Jour 7")],
        surface="paper")),

    ("comparaison", compare(
        "Deux suites possibles",
        "Après l'audit, vous choisissez qui reprend la main.",
        "L'audit ne vous engage à rien. Voici les deux suites que nous proposons.",
        "Nous pilotons", "Vous ou votre équipe pilotez",
        [("Qui exécute", "Nous, sur votre compte", "Votre équipe ou votre prestataire"),
         ("Rythme", "Arbitrages hebdomadaires", "À votre main"),
         ("Créations", "Produites par nous", "À votre charge"),
         ("Coût", "Honoraires mensuels", "Aucun coût supplémentaire"),
         ("Pertinent si", "Personne en interne n'a le temps ni l'habitude", "Vous avez déjà quelqu'un de compétent"),
         ("Notre avis", "Recommandé au-delà d'un certain budget média", "Suffisant sur des budgets modestes")],
        "Sur un budget média limité, des honoraires de pilotage peuvent représenter une part disproportionnée de la dépense. Nous vous le dirons plutôt que de vous vendre un accompagnement.",
        surface="dark")),

    ("faq", faq(
        "Questions fréquentes sur l'audit Meta Ads.",
        "",
        [("Faut-il un historique long pour que l'audit soit utile ?",
          "<p>Trois mois de diffusion continue constituent une base confortable. En dessous, l'analyse porte surtout sur la structure, le suivi et les angles créatifs. Elle reste utile, et nous vous le disons avant de commencer.</p>"),
         ("Allez-vous modifier mes campagnes pendant l'audit ?",
          "<p>Non. Nous demandons un accès en lecture seule et nous ne touchons à rien. Toute modification serait faite après restitution, avec votre accord explicite, et seulement si vous nous confiez le pilotage.</p>"),
         ("L'audit couvre-t-il Instagram ?",
          "<p>Oui : Facebook et Instagram partagent le même gestionnaire et les mêmes campagnes. Nous analysons la répartition des placements, qui est souvent laissée en automatique alors qu'elle mérite un arbitrage selon votre offre.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Donnez-nous un accès en lecture.",
        "Une semaine plus tard, vous savez précisément ce que produit chaque euro dépensé — et ce qu'il faudrait arrêter dès demain.",
        "Demander l'audit Meta Ads",
        link="Analyser mes concurrents", link_url="/pages/analyse-concurrentielle-meta-ads",
        points=("Lecture seule", "Restitution commentée"))),
]

# ==========================================================================
# ANALYSE CONCURRENTIELLE META ADS — angle : la bibliothèque publicitaire
# Trame : hero → étapes → démonstration → livrables → FAQ → CTA
# ==========================================================================
PAGES["analyse-concurrentielle-meta-ads"] = [
    ("hero", hero(
        "Analyse concurrentielle publicitaire",
        "Sachez ce qui fonctionne chez vos concurrents avant de dépenser.",
        "Toutes les publicités actives sur Facebook et Instagram sont consultables publiquement. Nous en tirons ce qui est réellement exploitable : les angles qu'ils tiennent dans la durée, ceux qu'ils abandonnent, et l'espace qu'ils vous laissent.",
        "Demander l'analyse", "Voir l'audit de mon compte", "/pages/audit-meta-ads",
        "Audits", "/pages/audit-seo")),

    ("deroule", steps(
        "Déroulé",
        "Ce que nous faisons de ces données publiques.",
        "",
        [("Cadrage concurrentiel", "Nous définissons ensemble qui sont vos vrais concurrents publicitaires — rarement la même liste que vos concurrents commerciaux.", "Jour 1"),
         ("Relevé", "Collecte des créations actives, de leur durée de diffusion et de leurs déclinaisons.", "Jours 2-3"),
         ("Lecture des angles", "Classement par promesse, par objection traitée et par format. C'est là que se trouve l'information utile.", "Jours 4-5"),
         ("Recommandations", "Angles à tester chez vous, terrains saturés à éviter, espaces laissés libres.", "Jour 7")],
        surface="paper")),

    ("lecture", split(
        "Comment nous lisons",
        "Une publicité qui tourne depuis six mois vous dit quelque chose.",
        "<p>La durée de diffusion est le signal le plus fiable accessible publiquement : personne ne laisse tourner une création qui ne rapporte pas. Une annonce en ligne depuis plusieurs mois a fait ses preuves chez son annonceur.</p><p>À l'inverse, une profusion de créations lancées puis retirées en quelques jours signale une recherche encore infructueuse — et donc un angle disponible.</p>",
        [("Les angles qui durent", "Ce qui tourne longtemps identifie les promesses qui fonctionnent sur votre marché."),
         ("Les angles abandonnés", "Ce qui disparaît vite vous évite de payer pour apprendre la même leçon."),
         ("Les zones vides", "Les objections que personne ne traite constituent souvent l'espace le plus rentable.")],
        surface="dark", reverse=True)),

    ("livrables", grid(
        "Ce que vous recevez",
        "Trois livrables.",
        "",
        [("layers", "Panorama des angles", "Les promesses tenues par chaque concurrent, classées par ancienneté de diffusion."),
         ("target", "Espaces disponibles", "Les terrains que personne n'occupe sérieusement, avec notre estimation de leur potentiel."),
         ("megaphone", "Pistes à tester", "Cinq angles à confronter chez vous, formulés et priorisés, prêts à être produits.")],
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes sur l'analyse concurrentielle.",
        "",
        [("Est-ce légal de regarder les publicités des concurrents ?",
          "<p>Oui, entièrement. Ces publicités sont rendues publiques par la plateforme elle-même dans un objectif de transparence. Nous n'accédons à aucune donnée privée : ni leurs budgets, ni leurs audiences, ni leurs résultats — seulement ce que tout le monde peut consulter.</p>"),
         ("Allez-vous copier leurs publicités ?",
          "<p>Non. Copier une création revient à arriver second sur un terrain déjà occupé, avec moins de notoriété. Nous cherchons les angles qui fonctionnent sur le marché pour identifier ce qui reste disponible, puis nous construisons votre propre proposition.</p>"),
         ("Combien de concurrents analysez-vous ?",
          "<p>Entre cinq et huit, ce qui couvre généralement l'essentiel des angles d'un marché. Au-delà, l'analyse se répète sans rien apprendre de neuf.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Dites-nous qui vous affrontez.",
        "Donnez-nous trois noms de concurrents. Nous vous montrons ce qu'ils diffusent en ce moment et depuis combien de temps.",
        "Demander l'analyse",
        points=("Données publiques uniquement", "Cinq angles à tester"))),
]

# ==========================================================================
# AUDIT E-COMMERCE — angle : le tunnel, marche par marche
# Trame : hero → démonstration → livrables → étapes → FAQ → CTA
# ==========================================================================
PAGES["audit-ecommerce"] = [
    ("hero", hero(
        "Audit de boutique en ligne",
        "Retrouver les commandes que votre tunnel perd en route.",
        "Nous suivons le trajet complet de vos visiteurs, de l'arrivée au paiement, et nous chiffrons chaque marche perdue. L'objectif n'est pas de lister des anomalies mais de dire où se trouve l'argent laissé sur la table.",
        "Demander l'audit", "Voir l'agence Shopify", "/pages/agence-shopify",
        "Audits", "/pages/audit-seo",
        proofs=[("", "5", " étapes", "du tunnel analysées"),
                ("", "10", " jours", "de délai")])),

    ("approche", split(
        "L'approche",
        "Un taux de conversion global ne dit rien d'exploitable.",
        "<p>Savoir que votre boutique convertit à 1,4 % ne permet aucune décision. Ce qui compte, c'est de savoir que 60 % des visiteurs quittent la fiche produit sans faire défiler. Ou que la moitié des paniers se perdent à l'étape de livraison.</p><p>Nous découpons donc le parcours en marches et nous mesurons chacune séparément. Sur mobile et sur ordinateur : les points de rupture n'y sont jamais les mêmes.</p>",
        [("Arrivée", "Adéquation entre la source de trafic et la page d'atterrissage. Beaucoup de pertes se jouent avant le premier clic."),
         ("Catégorie et fiche", "Lisibilité de l'offre, réassurance, éléments manquants au moment précis du doute."),
         ("Panier et paiement", "Frais découverts tardivement, création de compte imposée, moyens de paiement absents.")],
        surface="paper")),

    ("livrables", grid(
        "Ce que vous recevez",
        "Cinq livrables chiffrés.",
        "",
        [("gauge", "Entonnoir chiffré", "Le taux de passage entre chaque marche, comparé mobile et ordinateur."),
         ("target", "Points de rupture", "Les trois marches les plus coûteuses, avec une estimation du manque à gagner mensuel."),
         ("cart", "Analyse de la fiche produit", "Ce qui manque au moment de la décision : preuve, délai, garantie, alternative."),
         ("signal", "Performance technique", "Vitesse réelle sur mobile, poids des applications installées, scripts bloquants."),
         ("check", "Plan d'action", "Les correctifs classés en trois vagues : immédiat, à programmer, à arbitrer.")],
        surface="dark")),

    ("deroule", steps(
        "Déroulé",
        "Trois temps.",
        "",
        [("Instrumentation", "Vérification de votre suivi. Si les données sont fausses, l'audit commence par les fiabiliser.", "Jours 1-2"),
         ("Observation", "Analyse quantitative croisée avec l'examen manuel du parcours sur plusieurs appareils.", "Jours 3-7"),
         ("Restitution", "Document chiffré et échange d'une heure pour prioriser ensemble.", "Jour 10")],
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes sur l'audit e-commerce.",
        "",
        [("Faut-il beaucoup de commandes pour que ce soit pertinent ?",
          "<p>Une centaine de commandes mensuelles permet une lecture statistique confortable. En dessous, l'audit s'appuie sur l'examen manuel du parcours et sur les enregistrements de sessions. C'est très instructif : les blocages graves se voient à l'œil nu.</p>"),
         ("Est-ce réservé à Shopify ?",
          "<p>Non. La méthode s'applique à toute boutique en ligne. Sur Shopify, nous allons plus loin parce que nous pouvons examiner le thème et les applications installées directement.</p>"),
         ("Appliquez-vous les correctifs ?",
          "<p>C'est une prestation distincte, que vous êtes libre de nous confier ou non. Le plan d'action est rédigé pour être exécutable par votre équipe ou par un autre prestataire, sans dépendance à nous.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Chiffrons ce que perd votre tunnel.",
        "Donnez-nous l'adresse de votre boutique et un accès en lecture à vos statistiques. Nous vous montrons où partent les commandes.",
        "Demander l'audit e-commerce",
        link="Voir le SEO e-commerce", link_url="/pages/seo-ecommerce",
        points=("Manque à gagner estimé", "Plan en trois vagues"))),
]

# ==========================================================================
# AUDIT MERCHANT CENTER — angle : le flux produit, plomberie invisible
# Trame : hero → périmètre → démonstration inversée → étapes → FAQ → CTA
# ==========================================================================
PAGES["audit-merchant-center"] = [
    ("hero", hero(
        "Audit Merchant Center",
        "Un flux produit refusé, c'est un catalogue invisible.",
        "Google Merchant Center conditionne l'affichage de vos produits dans les résultats et les comparateurs. Refus silencieux, attributs manquants, prix désynchronisés : nous reprenons le flux ligne par ligne pour rouvrir la diffusion.",
        "Demander l'audit", "Voir le SEO e-commerce", "/pages/seo-ecommerce",
        "Audits", "/pages/audit-seo")),

    ("perimetre", grid(
        "Ce que nous vérifions",
        "Six familles de problèmes.",
        "Les refus les plus coûteux sont rarement les plus visibles : un produit désactivé ne déclenche aucune alerte commerciale.",
        [("target", "Refus et avertissements", "Produits bloqués, en attente, ou diffusés en capacité réduite. Avec la cause exacte de chaque refus."),
         ("layers", "Qualité des attributs", "Identifiants produit, marque, état, catégorie, taille, couleur. Chaque manque restreint la diffusion."),
         ("signal", "Synchronisation des prix", "Écart entre le prix du flux et celui de la page : première cause de suspension de compte."),
         ("cart", "Disponibilité", "Stock réel contre stock déclaré. Un produit épuisé mais annoncé disponible dégrade tout le compte."),
         ("check", "Conformité", "Mentions de livraison, retours, coordonnées et sécurité du site exigées par la plateforme."),
         ("gauge", "Titres et visuels", "Structure des titres et conformité des images : ce sur quoi se joue le taux de clic.")],
        surface="paper")),

    ("enjeu", split(
        "Pourquoi c'est urgent",
        "Une suspension de compte se répare beaucoup plus lentement qu'elle ne survient.",
        "<p>Les écarts de prix répétés ou les manquements de conformité mènent à une suspension. Le rétablissement suppose une correction complète puis un réexamen, avec un délai que vous ne maîtrisez pas — pendant que votre catalogue reste invisible.</p><p>La plupart des comptes que nous auditons présentent des avertissements ignorés depuis des mois, simplement parce que personne ne consulte l'interface.</p>",
        [("Détection des dérives", "Les écarts s'installent progressivement à chaque mise à jour de catalogue ou de promotion."),
         ("Correction à la source", "Nous corrigeons dans le flux et dans la boutique, pas seulement dans l'interface — sinon le problème revient."),
         ("Surveillance", "Mise en place d'un contrôle régulier pour que le compte ne redérive pas silencieusement.")],
        surface="dark", reverse=True)),

    ("deroule", steps(
        "Déroulé",
        "Une semaine.",
        "",
        [("Diagnostic du flux", "Analyse complète du fichier produit et de tous les refus en cours.", "Jours 1-2"),
         ("Correctifs", "Reprise des attributs, alignement des prix et de la disponibilité, mise en conformité.", "Jours 3-5"),
         ("Contrôle", "Vérification après réindexation et mise en place du suivi périodique.", "Jour 7")],
        surface="paper")),

    ("faq", faq(
        "Questions fréquentes sur Merchant Center.",
        "",
        [("Mon compte est suspendu, pouvez-vous le débloquer ?",
          "<p>Nous corrigeons les causes et préparons la demande de réexamen. La décision appartient à Google et le délai lui appartient également — méfiez-vous de quiconque garantit un rétablissement sous un nombre de jours donné. Ce que nous garantissons, c'est que les motifs invoqués auront été traités.</p>"),
         ("Faut-il une application pour gérer le flux ?",
          "<p>Pas nécessairement. Sur Shopify, le canal natif suffit dans la majorité des cas. Nous ne recommandons une application payante que si votre catalogue exige des règles de transformation que le canal standard ne sait pas produire.</p>"),
         ("Est-ce utile si je ne fais pas de publicité ?",
          "<p>Oui. Les fiches produit apparaissent aussi dans les résultats gratuits de l'onglet Shopping. Un flux propre vous rend visible sans budget média — c'est même l'un des rares gains de visibilité qui ne coûte que du travail de mise en ordre.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Regardons l'état réel de votre flux.",
        "Un accès en lecture à votre compte Merchant Center suffit. Nous revenons avec le nombre exact de produits diffusés, restreints et refusés.",
        "Demander l'audit du flux",
        points=("Lecture seule", "Causes de refus détaillées"))),
]

if __name__ == "__main__":
    for suffix, sections in PAGES.items():
        print("écrit :", write(suffix, sections))
