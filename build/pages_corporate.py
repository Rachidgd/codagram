#!/usr/bin/env python3
"""
Pages institutionnelles, hub géographique et marchés frontaliers.

La Suisse et la Belgique ne sont pas des « villes de plus » : réglementation,
fiscalité et habitudes de recherche y diffèrent réellement du marché français.
Elles reçoivent donc un traitement distinct des pages de villes.
"""
import json
import pathlib
from pages_services import (hero, split, grid, steps, compare, stats, quote,
                            faq, cta, write)

PAGES = {}

# ==========================================================================
# À PROPOS — angle : qui fait le travail, et comment on facture
# ==========================================================================
PAGES["a-propos"] = [
    ("hero", hero(
        "L'agence",
        "Une petite structure qui assume de refuser des projets.",
        "Clickscreation est une agence d'acquisition à taille volontairement réduite. Les personnes qui vous répondent sont celles qui font le travail. Nous préférons décliner une mission plutôt que de la sous-traiter à quelqu'un que vous n'auriez jamais rencontré.",
        "Prendre contact", "Voir les résultats", "/pages/resultats")),

    ("principes", grid(
        "Comment nous travaillons",
        "Quatre principes qui nous coûtent des contrats.",
        "Ils ne sont pas là pour faire joli : chacun nous a déjà fait perdre une affaire, et nous les gardons.",
        [("check", "Nous disons quand ce n'est pas nous", "Si votre problème relève d'un autre métier, nous vous orientons ailleurs. Une mission mal ciblée ne finit jamais bien, pour personne."),
         ("target", "Nous chiffrons un périmètre écrit", "Pas de forfait vague. Le devis détaille ce qui est inclus, ce qui ne l'est pas, et ce qui déclencherait un avenant."),
         ("signal", "Vos accès restent les vôtres", "Domaine, hébergement, comptes publicitaires, données : tout est à votre nom. Nous retirons nos accès en fin de mission."),
         ("gauge", "Nous montrons les échecs", "Certaines missions ne produisent pas l'effet espéré. Nous en parlons pendant les échanges commerciaux, parce que c'est ce qui explique notre méthode.")],
        surface="dark")),

    ("equipe", split(
        "Notre fonctionnement",
        "Vous parlez directement à ceux qui font le travail.",
        "<p>Dans beaucoup d'agences, la personne qui vend n'est pas celle qui exécute, et l'information se dégrade à chaque transmission. Nous avons choisi l'inverse : vous parlez directement à ceux qui produisent.</p><p>Cela limite mécaniquement le nombre de projets que nous pouvons prendre. C'est une contrainte assumée, pas un argument marketing.</p>",
        [("Un interlocuteur du début à la fin", "La personne du premier appel est celle qui rédige, développe et vous forme."),
         ("Peu de projets en parallèle", "Nous refusons des missions quand le calendrier est plein plutôt que d'allonger les délais."),
         ("Aucune sous-traitance cachée", "Si nous faisons appel à un spécialiste externe, vous le savez et vous savez qui c'est.")],
        surface="paper")),

    ("position", quote(
        "Ce que nous ne vendons pas",
        "Nous ne vendons ni garantie de position, ni « pack visibilité » mensuel sans périmètre, ni audit dont la conclusion est écrite avant d'avoir regardé le site. Ces trois offres existent parce qu'elles se vendent bien, pas parce qu'elles fonctionnent.",
        "Clickscreation")),

    ("faq", faq(
        "Questions qu'on nous pose avant de travailler ensemble.",
        "",
        [("Combien de personnes travaillent sur mon projet ?",
          "<p>Une à deux, selon le périmètre, et toujours les mêmes du début à la fin. Vous gardez le même interlocuteur du début à la fin, sans réunion de passation. C'est aussi ce qui limite le nombre de clients que nous prenons en même temps.</p>"),
         ("Travaillez-vous avec des entreprises de ma taille ?",
          "<p>Nous accompagnons aussi bien des indépendants que des PME de cinquante personnes. Le critère est la clarté de l'objectif, pas la taille. Une entreprise qui sait ce qu'elle veut obtenir avance plus vite qu'un grand compte sans décision arrêtée.</p>"),
         ("Que se passe-t-il si les résultats ne viennent pas ?",
          "<p>Nous en parlons ouvertement lors des points de suivi, avec les données. Selon la cause, nous réorientons le travail, nous réduisons le périmètre, ou nous vous disons que le canal n'est pas le bon. Nous n'avons aucun intérêt à faire durer une mission qui ne produit rien.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Le plus simple reste de nous décrire votre situation.",
        "Nous vous dirons franchement si c'est un sujet pour nous, et sinon vers qui vous tourner.",
        "Prendre contact",
        points=("Réponse humaine", "Orientation même si ce n'est pas nous"))),
]

# ==========================================================================
# HUB SEO PAR VILLE — angle : page d'aiguillage, pas page de service
# ==========================================================================
PAGES["hub-villes"] = [
    ("hero", hero(
        "Référencement local par zone",
        "Trouvez votre ville et ce qui s'y gagne.",
        "Chaque territoire a son tissu économique, son intensité concurrentielle et ses habitudes de recherche. Vous trouverez ici ce qui se gagne sur votre marché, et par quoi commencer chez vous.",
        "Demander un relevé de position", "Voir la prestation SEO local", "/pages/seo-local")),

    ("methode", split(
        "Comment lire ces pages",
        "Une page par zone, écrite pour cette zone.",
        "<p>La pratique courante consiste à produire une page type et à y remplacer le nom de la ville. Nous ne le faisons pas, pour deux raisons : les moteurs identifient ces gabarits et n'en retiennent qu'un, et surtout cela ne rend aucun service au lecteur.</p><p>Chaque page ci-dessous décrit un marché différent : ce qui s'y vend, qui s'y bat, et par où commencer.</p>",
        [("Un contexte économique réel", "Secteurs dominants et dynamique locale, parce qu'ils changent la stratégie à appliquer."),
         ("Une intensité concurrentielle mesurée", "Paris et Grenoble ne demandent ni le même effort ni la même patience."),
         ("Des priorités différentes", "Sur certaines zones, la fiche d'établissement prime. Sur d'autres, c'est le contenu technique.")],
        surface="paper")),

    ("zones", grid(
        "Zones couvertes",
        "Quinze marchés que nous suivons régulièrement.",
        "Chaque zone a sa page, son contexte économique et ses priorités. Nous intervenons au-delà de cette liste : elle correspond aux marchés sur lesquels nous avons assez de recul pour publier une analyse.",
        [
         ("signal", "Paris", "Le marché le plus disputé de France, où la stratégie consiste souvent à choisir ses renoncements.", "/pages/consultant-seo-paris", "Voir cette zone"),
         ("layers", "Lyon", "Un marché qui se travaille par commune de la métropole avant de viser la ville-centre.", "/pages/consultant-seo-lyon", "Voir cette zone"),
         ("target", "Marseille", "Une géographie commerciale fragmentée où la recherche se joue au quartier.", "/pages/agence-seo-marseille", "Voir cette zone"),
         ("gauge", "Bordeaux", "Un marché devenu nettement plus concurrentiel depuis l'arrivée de nouveaux entrants.", "/pages/agence-seo-bordeaux", "Voir cette zone"),
         ("check", "Nantes", "Une métropole qui accueille des milliers d'habitants sans réseau local chaque année.", "/pages/agence-seo-nantes", "Voir cette zone"),
         ("check", "Rennes", "Un public jeune et connecté qui vérifie systématiquement les avis avant d'appeler.", "/pages/consultant-seo-rennes", "Voir cette zone"),
         ("megaphone", "Lille", "Un bassin transfrontalier dont la demande belge reste largement inexploitée.", "/pages/agence-seo-lille", "Voir cette zone"),
         ("cart", "Toulouse", "Un tissu industriel qui cherche une norme ou un procédé, jamais un terme générique.", "/pages/agence-seo-toulouse", "Voir cette zone"),
         ("cart", "Grenoble", "Des prospects ingénieurs qui lisent des données avant de prendre contact.", "/pages/agence-seo-grenoble", "Voir cette zone"),
         ("signal", "Nice", "Une clientèle en partie non résidente, saisonnière et souvent anglophone.", "/pages/agence-seo-nice", "Voir cette zone"),
         ("signal", "Montpellier", "Des communes voisines bien plus accessibles que la ville-centre.", "/pages/agence-seo-montpellier", "Voir cette zone"),
         ("layers", "Strasbourg", "Un marché bilingue dont la demande germanophone est presque libre.", "/pages/agence-seo-strasbourg", "Voir cette zone"),
         ("target", "Luxembourg", "Peu de volume, une valeur de client sans équivalent, trois langues de recherche.", "/pages/agence-seo-luxembourg", "Voir cette zone"),
         ("target", "Suisse romande", "Un marché cantonal et premium, où chaque canton se gagne séparément.", "/pages/consultant-seo-suisse", "Voir cette zone"),
         ("target", "Belgique francophone", "Bruxelles et la Wallonie, deux terrains qui n'ont ni la même concurrence ni le même vocabulaire.", "/pages/consultant-seo-belgique", "Voir cette zone")
        ],
        surface="dark", density="dense")),

    ("faq", faq(
        "Questions sur la couverture géographique.",
        "",
        [("Vous n'êtes pas dans ma ville, est-ce un problème ?",
          "<p>Non. Le travail de référencement se fait à distance et nous accompagnons des clients sur l'ensemble du territoire, ainsi qu'au Luxembourg, en Suisse et en Belgique. Ce qui compte, c'est de connaître le marché sur lequel vous vous battez — pas d'avoir un bureau à côté du vôtre.</p>"),
         ("Ma ville n'est pas dans la liste.",
          "<p>La liste correspond aux zones sur lesquelles nous avons assez d'observations pour publier une analyse sérieuse. Nous intervenons bien au-delà : dites-nous votre ville et nous vous ferons le même relevé de position, simplement sans page publique dédiée.</p>")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Un relevé de position sur votre zone, gratuitement.",
        "Indiquez votre activité et vos communes. Nous mesurons où vous apparaissez aujourd'hui depuis chacune d'elles.",
        "Demander le relevé",
        points=("Relevé géolocalisé", "Sans engagement"))),
]

# ==========================================================================
# SUISSE — angle : marché cantonal, exigences propres
# ==========================================================================
PAGES["seo-suisse"] = [
    ("hero", hero(
        "Référencement en Suisse romande",
        "Captez les clients de Suisse romande, canton par canton.",
        "La Suisse se travaille canton par canton : Genève, Vaud et le Valais n'ont ni le même tissu économique, ni la même concurrence, ni les mêmes attentes. S'adresser à « la Suisse » revient le plus souvent à ne s'adresser à personne.",
        "Évaluer ma visibilité", "Voir le SEO local", "/pages/seo-local")),

    ("marche", stats(
        "Le marché",
        "Trois particularités qui changent la stratégie.",
        [("Cantons", "des marchés autonomes", "Genève, Vaud, Neuchâtel, Valais : des bassins distincts avec leurs propres acteurs installés."),
         ("Pouvoir d'achat", "élevé", "Des paniers moyens supérieurs qui rendent rentables des requêtes à très faible volume."),
         ("Frontaliers", "une population importante", "Des dizaines de milliers de personnes qui vivent en France et travaillent en Suisse, avec des recherches à cheval.")],
        source="Lecture qualitative du marché. Les volumes précis sont mesurés pendant le diagnostic.",
        surface="dark")),

    ("specificites", split(
        "Ce qui diffère du marché français",
        "Le même métier, des attentes différentes.",
        "<p>Le rapport au prix, à la garantie et à la formulation commerciale n'est pas le même. Un argumentaire écrit pour la France passe souvent pour excessif en Suisse romande, où la sobriété inspire davantage confiance.</p><p>S'y ajoutent des exigences réglementaires propres à certaines professions et des mentions légales spécifiques.</p>",
        [("Un ton plus sobre", "Les superlatifs et l'urgence commerciale fonctionnent moins bien qu'en France."),
         ("Le prix assumé", "L'affichage tarifaire est mieux accepté et souvent attendu."),
         ("Des mentions propres", "Conditions générales, protection des données et obligations sectorielles suivent le droit suisse.")],
        surface="paper", reverse=True)),

    ("faq", faq(
        "Questions sur le marché suisse.",
        "",
        [("Faut-il un domaine en .ch ?",
          "<p>Ce n'est pas obligatoire mais cela aide, à la fois pour le signal géographique et pour la confiance des visiteurs. Un domaine en .fr ciblant la Suisse part avec un désavantage qu'il faut compenser par le contenu et les signaux locaux.</p>"),
         ("Devez-vous être établis en Suisse pour intervenir ?",
          "<p>Non, le travail se fait à distance. Vous restez responsable de vos obligations locales : facturation, TVA, conformité sectorielle. Nous ne sommes pas compétents sur ces sujets, consultez un professionnel du droit suisse.</p>"),
         ("Faut-il traiter l'allemand ?",
          "<p>Seulement si votre clientèle dépasse la Romandie. La Suisse alémanique représente un marché bien plus vaste mais aussi une concurrence linguistique différente, avec ses propres acteurs. C'est un projet distinct, pas une extension automatique.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Situons-vous sur votre canton.",
        "Indiquez votre activité et votre canton. Nous relevons votre position actuelle et celle des acteurs installés face à vous.",
        "Demander un relevé",
        points=("Relevé par canton", "Sans engagement"))),
]

# ==========================================================================
# BELGIQUE — angle : trois régions, deux langues, un marché fragmenté
# ==========================================================================
PAGES["seo-belgique"] = [
    ("hero", hero(
        "Référencement en Belgique francophone",
        "Un pays petit, un marché plus fragmenté qu'il n'y paraît.",
        "Bruxelles et la Wallonie ne se ressemblent pas. La capitale est bilingue, internationale et très disputée. Les provinces wallonnes offrent des positions nettement plus accessibles. La stratégie diffère fortement selon l'endroit où sont vos clients.",
        "Évaluer ma visibilité", "Voir le SEO local", "/pages/seo-local")),

    ("regions", grid(
        "Les zones",
        "Trois réalités distinctes.",
        "Traiter la Belgique comme un bloc unique est l'erreur la plus fréquente des sites qui s'y aventurent.",
        [("target", "Bruxelles", "Bilingue, internationale, fortement concurrentielle. Une part de la demande s'y formule en néerlandais et en anglais."),
         ("signal", "Wallonie", "Liège, Charleroi, Namur, Mons : des marchés provinciaux où les positions restent accessibles."),
         ("layers", "Zone frontalière", "Le Hainaut occidental et la région de Mouscron consomment aussi côté français — et réciproquement.")],
        surface="dark")),

    ("langue", split(
        "La langue, une question stratégique",
        "Vos clients belges emploient d'autres mots que vos clients français.",
        "<p>Certains termes courants diffèrent, et ces écarts portent parfois précisément sur les mots que vos clients tapent. Un site rédigé en France peut passer à côté de la requête réelle sans que personne ne s'en aperçoive.</p><p>À Bruxelles s'ajoute la question du néerlandais, qui double le marché potentiel mais aussi le travail éditorial.</p>",
        [("Vérifier les formulations", "Les variantes lexicales se mesurent dans les données de recherche, elles ne se devinent pas."),
         ("Arbitrer le néerlandais", "Utile à Bruxelles et en Flandre, sans objet en Wallonie. Cela se décide sur les volumes."),
         ("Assumer l'ancrage", "Un site clairement belge convertit mieux auprès d'un public belge qu'un site français générique.")],
        surface="paper")),

    ("faq", faq(
        "Questions sur le marché belge.",
        "",
        [("Un site en .fr peut-il se positionner en Belgique ?",
          "<p>Oui, mais avec un handicap. Une extension .be envoie un signal géographique fort et rassure le visiteur belge. À défaut, il faut compenser par des contenus explicitement belges, des coordonnées locales et des mentions adaptées.</p>"),
         ("Faut-il viser Bruxelles ou la Wallonie ?",
          "<p>Cela dépend de votre clientèle et de votre capacité à supporter la concurrence. Bruxelles concentre la valeur mais aussi les acteurs installés et internationaux. Les provinces wallonnes offrent des positions bien plus accessibles pour un volume moindre — souvent le meilleur point de départ.</p>"),
         ("Travaillez-vous avec des entreprises belges depuis la France ?",
          "<p>Oui, régulièrement, notamment sur la zone frontalière où les échanges sont quotidiens. Les aspects fiscaux et réglementaires de votre activité relèvent en revanche de votre comptable ou de votre conseil juridique, pas de nous.</p>")],
        surface="dark")),

    ("cta", cta(
        "Étape suivante",
        "Voyons ce que vous captez côté belge.",
        "Indiquez votre activité et vos zones. Nous mesurons votre position à Bruxelles et dans les provinces qui vous intéressent.",
        "Demander un relevé",
        points=("Relevé par région", "Sans engagement"))),
]

# ==========================================================================
# ÉTUDES DE CAS — angle : montrer la méthode par l'exemple
# ==========================================================================
PAGES["etudes-de-cas"] = [
    ("hero", hero(
        "Études de cas",
        "Ce que nous avons changé, et ce que ça a rapporté.",
        "Un résultat sans contexte n'apprend rien. Nous détaillons ici la situation initiale, ce que nous avons décidé de faire, ce que nous avons écarté et ce que cela a produit sur la période observée.",
        "Demander un diagnostic", "Voir tous les résultats", "/pages/resultats")),

    ("lecture", split(
        "Comment nous documentons",
        "Ce qu'une étude de cas honnête doit contenir.",
        "<p>La plupart des études de cas publiées se réduisent à un pourcentage et un logo. C'est invérifiable et cela ne permet à personne de juger si la méthode s'appliquerait à son cas.</p><p>Nous imposons donc quatre éléments à chacune de nos publications, et nous renonçons à publier quand l'un d'eux manque.</p>",
        [("Le point de départ", "L'état réel du site et des données avant intervention. Sans lui, aucun pourcentage n'a de sens."),
         ("Les arbitrages", "Ce que nous avons choisi de faire, et surtout ce que nous avons écarté et pourquoi."),
         ("La période", "Les dates exactes d'observation, pas une durée vague."),
         ("Les limites", "Ce que le cas ne démontre pas, et ce qui relevait de facteurs extérieurs.")],
        surface="paper")),

    ("cta", cta(
        "Étape suivante",
        "Retrouvez votre situation dans ces missions.",
        "Décrivez-la nous. Si nous avons déjà traité un cas comparable, nous vous en détaillerons le déroulé complet, résultats mitigés compris.",
        "Décrire ma situation",
        link="Voir les résultats chiffrés", link_url="/pages/resultats",
        points=("Cas comparables détaillés", "Y compris ceux qui ont moins bien marché"))),
]

# ==========================================================================
# Gabarit sobre pour les pages légales et utilitaires : le contenu vient de
# l'admin Shopify et il est unique par nature. Une seule structure suffit.
# ==========================================================================
SIMPLE = {
    "sections": {
        "hero": {"type": "page-hero", "settings": {
            "show_breadcrumb": True, "title": "", "lead": "",
            "cta_primary": "", "cta_secondary": "", "cta_secondary_url": ""}},
        "contenu": {"type": "page-body", "settings": {"surface": "paper"}},
    },
    "order": ["hero", "contenu"],
}

if __name__ == "__main__":
    for suffix, sections in PAGES.items():
        print("écrit :", write(suffix, sections))
    out = pathlib.Path(__file__).resolve().parent.parent / "theme" / "templates"
    for suffix in ("simple", "sitemap"):
        (out / f"page.{suffix}.json").write_text(
            json.dumps(SIMPLE, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"écrit : page.{suffix}.json (gabarit sobre)")
