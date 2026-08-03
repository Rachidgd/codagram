#!/usr/bin/env python3
"""
Pages de référencement local, une par ville.

Point de départ : neuf de ces pages partageaient le même gabarit « ville-seo »
sur l'ancien thème. C'est du duplicate content au sens strict — Google n'en
retient qu'une et ignore les autres.

Ici, chaque ville possède :
  — son propre fichier page.<suffixe>.json ;
  — un H1 formulé différemment (pas « Agence SEO à {ville} » décliné) ;
  — un contexte économique réel, propre au tissu local ;
  — un enchaînement de sections choisi parmi quatre trames ;
  — des questions de FAQ que l'on ne trouve sur aucune autre page.

Rien n'est produit par substitution de variable dans une phrase type.
"""
from pages_services import (hero, split, grid, steps, stats, faq, cta, write)

# --------------------------------------------------------------------------
# Données par ville. Le champ « struct » choisit la trame (A, B, C ou D).
# --------------------------------------------------------------------------
VILLES = [
    dict(
        suffix="seo-paris", struct="A",
        eyebrow="Référencement naturel — Paris",
        h1="Se rendre visible sur le marché le plus disputé de France.",
        lead="À Paris, presque toutes les requêtes commerciales sont déjà occupées par des acteurs installés depuis dix ans. Se positionner n'y est pas une question de volume de contenu mais de choix : quelles requêtes vous pouvez réellement gagner, et lesquelles coûteraient plus qu'elles ne rapportent.",
        cells=[("20", "arrondissements", "Une recherche de proximité ne donne pas le même classement depuis le 15e et depuis le 19e. Le suivi doit être fait par secteur."),
               ("B2B", "forte densité de services", "Conseil, finance, juridique, communication : des cycles longs où le site prépare la vente plus qu'il ne la conclut."),
               ("Élevée", "intensité concurrentielle", "Sur les requêtes génériques, les premières places appartiennent à des annuaires et à des acteurs nationaux.")],
        split_title="La bonne stratégie parisienne consiste souvent à renoncer.",
        split_html="<p>Viser « avocat Paris » quand on est un cabinet de trois personnes revient à dépenser un budget contre des sites installés depuis quinze ans. La requête est prestigieuse, elle n'est pas rentable.</p><p>Nous travaillons donc l'échelle en dessous : la spécialité, le quartier, le type de client. Moins de volume, beaucoup plus de conversions.</p>",
        points=[("Par arrondissement", "Une page de quartier bien faite se positionne là où la page générique n'a aucune chance."),
                ("Par spécialité", "La requête précise attire moins de monde mais un visiteur déjà décidé sur ce qu'il cherche."),
                ("Par typologie de client", "Startup, grand compte, particulier : trois vocabulaires, trois pages, trois intentions.")],
        faqs=[("Faut-il une page par arrondissement ?",
               "<p>Seulement pour ceux où vous intervenez réellement et où vous avez quelque chose à dire. Vingt pages d'arrondissement vides sont contre-productives. Trois ou quatre pages de quartier documentées, avec des références situées, produisent bien davantage.</p>"),
              ("Mon concurrent est premier depuis des années, est-ce jouable ?",
               "<p>Sur sa requête principale, rarement à court terme. Sur les requêtes secondaires qu'il n'a jamais travaillées, souvent oui — les gros sites parisiens négligent presque toujours la longue traîne. C'est précisément là que nous commençons.</p>"),
              ("Travaillez-vous avec des entreprises hors Paris intra-muros ?",
               "<p>Oui. La petite couronne pose une question spécifique : faut-il viser Paris, sa commune, ou les deux ? La réponse dépend de votre zone de chalandise réelle, et nous la tranchons pendant le diagnostic.</p>")],
    ),
    dict(
        suffix="seo-lyon", struct="B",
        eyebrow="Référencement naturel — Lyon",
        h1="Capter la demande lyonnaise sans se battre sur les requêtes nationales.",
        lead="Deuxième pôle économique français, Lyon concentre un tissu dense de services aux entreprises, de santé et de logistique. La concurrence y est réelle mais nettement moins verrouillée qu'à Paris : les positions se gagnent encore en quelques mois de travail sérieux.",
        cells=[("Santé", "pharmacie et biotechnologies", "Un secteur où les contenus doivent être irréprochables : les moteurs y appliquent des exigences de fiabilité renforcées."),
               ("Tertiaire", "services aux entreprises", "Part-Dieu et Confluence concentrent une demande B2B qui cherche par spécialité, pas par ville."),
               ("Logistique", "position de carrefour", "L'axe rhodanien génère des recherches qui débordent largement la métropole.")],
        split_title="Lyon se travaille par métropole, pas par ville.",
        split_html="<p>La plupart des entreprises lyonnaises ciblent « Lyon » alors que leurs clients se trouvent à Villeurbanne, Bron, Vénissieux ou Écully. Les recherches suivent cette géographie réelle, pas le nom de la ville-centre.</p><p>Nous construisons donc l'arborescence sur les communes de la métropole où vous intervenez effectivement, avec une page mère lyonnaise qui les fédère.</p>",
        points=[("Communes de la métropole", "Une page par commune où vous avez une activité réelle et des références à montrer."),
                ("Secteurs verticaux", "La demande B2B lyonnaise cherche un spécialiste de son industrie avant de chercher un prestataire local."),
                ("Contenus de fiabilité", "Sur la santé, l'exigence de sérieux est supérieure : auteurs identifiés, sources, mises à jour datées.")],
        faqs=[("Vaut-il mieux viser Lyon ou ma commune ?",
               "<p>Les deux, dans cet ordre : la commune d'abord, car elle est bien plus accessible et convertit mieux, puis Lyon une fois que le site a gagné en autorité. Attaquer directement la requête métropolitaine est le meilleur moyen de n'apparaître nulle part pendant un an.</p>"),
              ("Le secteur santé impose-t-il des contraintes particulières ?",
               "<p>Oui. Les contenus touchant à la santé sont évalués avec une exigence renforcée sur l'expertise et la fiabilité de l'auteur. Concrètement : signature identifiable, qualifications affichées, sources citées et dates de mise à jour visibles. Un contenu anonyme ne se positionne plus dans ce domaine.</p>")],
    ),
    dict(
        suffix="seo-local-marseille", struct="C",
        eyebrow="Référencement naturel — Marseille",
        h1="À Marseille, la recherche locale se joue au quartier.",
        lead="Peu de villes françaises ont une géographie commerciale aussi fragmentée. Entre le Vieux-Port, la Joliette, les quartiers sud et l'est marseillais, un client ne cherche presque jamais « à Marseille » : il cherche près de chez lui, et Google le suit.",
        cells=[("16", "arrondissements", "Un classement obtenu depuis le 8e ne dit rien de votre visibilité depuis le 13e. Le relevé doit être géolocalisé."),
               ("Port", "logistique et import-export", "Un tissu d'entreprises tourné vers l'international, qui cherche en français comme en anglais."),
               ("Tourisme", "forte saisonnalité", "Les volumes de recherche varient du simple au triple entre février et juillet sur certains métiers.")],
        grid_title="Ce que nous traitons en priorité à Marseille.",
        grid_items=[("target", "Fiche d'établissement", "Sur un marché où le bloc cartographique capte l'essentiel des clics de proximité, c'est le premier levier."),
                    ("signal", "Pages par secteur", "Quartiers sud, centre, est : des zones que les clients distinguent nettement et que Google traite séparément."),
                    ("gauge", "Saisonnalité", "Anticiper les pics plutôt que les subir : les contenus doivent être en place deux mois avant la saison."),
                    ("layers", "Avis clients", "Dans les métiers de service marseillais, le volume d'avis pèse lourd dans la décision finale.")],
        split_title="La saisonnalité s'anticipe, elle ne se rattrape pas.",
        split_html="<p>Sur les métiers liés au tourisme, à la restauration ou aux travaux extérieurs, la demande explose sur quelques mois. Publier un contenu en pleine saison revient à arriver quand tout est joué : une page a besoin de plusieurs semaines pour trouver sa position.</p><p>Nous calons donc le calendrier éditorial sur vos pics réels, avec une avance systématique.</p>",
        points=[("Calendrier décalé", "Les contenus saisonniers sont produits et publiés bien avant la montée en demande."),
                ("Pages permanentes", "Une base de pages non saisonnières maintient le site vivant hors période forte."),
                ("Relevés géolocalisés", "Les positions sont mesurées depuis plusieurs points de la ville, pas depuis un seul.")],
        faqs=[("Je suis dans les quartiers sud, dois-je viser tout Marseille ?",
               "<p>Rarement au début. Une page ancrée sur votre secteur réel se positionne beaucoup plus vite et attire des clients qui accepteront de se déplacer. La requête « Marseille » se travaille ensuite, une fois le site installé.</p>"),
              ("Le port et l'international changent-ils quelque chose ?",
               "<p>Oui, si vos clients sont des entreprises de transport, de négoce ou de logistique : une partie de leurs recherches se fait en anglais. Cela peut justifier une version anglaise de quelques pages clés, mais seulement après vérification des volumes réels — pas par principe.</p>")],
    ),
    dict(
        suffix="seo-local-bordeaux", struct="D",
        eyebrow="Référencement naturel — Bordeaux",
        h1="Un marché bordelais devenu nettement plus concurrentiel.",
        lead="L'arrivée de la ligne à grande vitesse a transformé l'économie bordelaise : afflux d'entreprises, de cadres et de nouveaux entrants sur presque tous les métiers de service. Les positions acquises il y a cinq ans ne tiennent plus toutes seules.",
        cells=[("Vin", "filière et œnotourisme", "Un écosystème entier — négoce, tourisme, événementiel — avec un vocabulaire de recherche très spécifique."),
               ("LGV", "nouveaux entrants", "Des concurrents parisiens qui s'installent avec un site déjà mature et une autorité existante."),
               ("Immobilier", "marché tendu", "Un secteur où la recherche locale est massive et la concurrence publicitaire coûteuse.")],
        steps_title="Reprendre l'avantage en quatre temps.",
        steps_items=[("Mesurer l'érosion", "Comparer vos positions actuelles à celles d'il y a deux ans. Beaucoup d'entreprises bordelaises ont reculé sans s'en apercevoir.", "Semaine 1"),
                     ("Identifier les entrants", "Repérer qui est arrivé sur vos requêtes et avec quel type de contenu. Le plus souvent, des pages plus complètes.", "Semaine 2"),
                     ("Renforcer l'existant", "Mettre à niveau les pages qui reculent plutôt que d'en créer de nouvelles. Plus rapide et plus rentable.", "Semaines 3-6"),
                     ("Ouvrir un terrain", "Trouver l'angle que les nouveaux entrants ne couvrent pas — souvent l'ancrage local réel et les références locales.", "Semaines 6-12")],
        split_title="Votre ancienneté locale est un actif, à condition de l'exposer.",
        split_html="<p>Un concurrent fraîchement installé peut avoir un meilleur site. Il ne peut pas avoir vos quinze ans de chantiers, de clients et d'avis dans la région. C'est le seul terrain où il ne vous rattrapera pas rapidement.</p><p>Encore faut-il que cet historique soit visible sur le site : trop d'entreprises installées le laissent implicite.</p>",
        points=[("Références datées et situées", "Des réalisations avec leur année et leur commune. Ce qu'un nouvel entrant ne peut pas produire."),
                ("Avis accumulés", "Un historique d'avis sur plusieurs années pèse plus qu'une dizaine d'avis récents."),
                ("Contenus d'expérience", "Ce que vous savez du marché local et que personne ne peut écrire sans l'avoir vécu.")],
        faqs=[("J'ai perdu des positions ces deux dernières années, est-ce récupérable ?",
               "<p>Le plus souvent oui, et plus vite qu'une création de zéro : votre domaine a de l'ancienneté et un historique. Un recul vient généralement de pages devenues moins complètes que celles des nouveaux entrants — les renforcer produit un effet en quelques semaines.</p>"),
              ("La filière viticole demande-t-elle une approche particulière ?",
               "<p>Oui, sur le vocabulaire : appellations, millésimes, types de prestations œnotouristiques ont leurs formulations propres, très éloignées du langage marketing général. Une page rédigée sans cette précision se repère immédiatement et ne convainc ni les moteurs ni les professionnels.</p>")],
    ),
    dict(
        suffix="seo-local-nantes", struct="A",
        eyebrow="Référencement naturel — Nantes",
        h1="Une métropole qui grandit vite, et une concurrence qui suit.",
        lead="Nantes gagne des habitants et des entreprises chaque année. Cette croissance crée de la demande, mais elle attire aussi de nouveaux prestataires : sur beaucoup de métiers, le nombre de concurrents a doublé en quelques années.",
        cells=[("Numérique", "un écosystème dense", "Des clients qui comparent, lisent et arbitrent. Un site approximatif se disqualifie immédiatement."),
               ("Industrie", "naval et aéronautique", "Une sous-traitance technique qui cherche des compétences précises, jamais des termes génériques."),
               ("Croissance", "arrivées régulières", "Un flux constant de nouveaux habitants qui cherchent tous les services de base sans référence préalable.")],
        split_title="Les nouveaux arrivants cherchent tout, et ne connaissent personne.",
        split_html="<p>Une métropole qui accueille chaque année des milliers de nouveaux habitants génère un flux permanent de recherches sans idée préconçue : médecin, artisan, garagiste, comptable. Ces personnes n'ont ni recommandation ni habitude — elles prennent le premier résultat crédible.</p><p>C'est une opportunité que peu d'entreprises locales exploitent explicitement.</p>",
        points=[("Contenus d'orientation", "Répondre aux questions de quelqu'un qui ne connaît pas encore la ville capte une demande à faible concurrence."),
                ("Preuves accessibles", "Sans bouche-à-oreille, le visiteur s'appuie entièrement sur ce que montre le site."),
                ("Fiche impeccable", "Pour un nouvel arrivant, la fiche d'établissement est souvent le seul point de comparaison.")],
        faqs=[("Le milieu numérique nantais est-il un frein ou un atout ?",
               "<p>Un atout, à condition d'assumer un niveau d'exigence supérieur. Ces clients détectent immédiatement un site bâclé ou un discours creux — mais ils reconnaissent aussi le travail sérieux et le recommandent volontiers.</p>"),
              ("Faut-il viser Saint-Herblain, Rezé ou Saint-Nazaire séparément ?",
               "<p>Oui, si vous y intervenez réellement. Ces communes ont leurs propres recherches et une concurrence bien moindre que sur Nantes. Saint-Nazaire relève d'ailleurs d'un bassin distinct, avec son propre tissu industriel — la traiter comme une banlieue nantaise serait une erreur.</p>")],
    ),
    dict(
        suffix="seo-lille", struct="B",
        eyebrow="Référencement naturel — Lille",
        h1="Un bassin transfrontalier que la plupart des sites ignorent.",
        lead="La métropole lilloise fonctionne avec la Belgique : clients, fournisseurs et salariés traversent la frontière quotidiennement. Cette réalité change ce que vos clients tapent dans Google — et presque personne ne l'exploite.",
        cells=[("Frontière", "un marché élargi", "Des recherches venues de Belgique francophone que la plupart des sites lillois ne captent pas."),
               ("Retail", "berceau de la distribution", "Un tissu de sièges et de sous-traitants qui cherche des prestataires habitués à ces exigences."),
               ("Densité", "communes imbriquées", "Roubaix, Tourcoing, Villeneuve-d'Ascq : des villes distinctes que les clients ne confondent jamais.")],
        split_title="La demande belge est accessible et peu disputée.",
        split_html="<p>Un client de Mouscron ou de Tournai qui cherche un prestataire accepte souvent de venir à Lille — c'est plus proche que Bruxelles. Mais il formule sa recherche autrement, et les sites lillois ne se positionnent quasiment jamais sur ces requêtes.</p><p>Traiter explicitement cette zone représente un gain rapide, sur un terrain que vos concurrents laissent vide.</p>",
        points=[("Une page transfrontalière", "Assumer la zone belge, avec ses communes et ses spécificités. Peu de sites le font."),
                ("Vocabulaire adapté", "Le français de Belgique a ses tournures. Les ignorer, c'est manquer la requête."),
                ("Praticité affichée", "Distance, temps de trajet, modalités de facturation. Ce qui lève le doute d'un client étranger.")],
        faqs=[("Puis-je vraiment attirer des clients belges ?",
               "<p>Oui, sur les métiers où le déplacement est acceptable. La frontière est une barrière administrative bien plus qu'une barrière commerciale : de nombreux habitants de la Wallonie occidentale font leurs achats et consultent leurs prestataires côté français. La concurrence sur ces requêtes est très faible.</p>"),
              ("Faut-il traiter Roubaix et Tourcoing à part ?",
               "<p>Oui. Ce sont des villes avec leur identité propre et leurs propres recherches. Les englober dans « Lille métropole » vous fait manquer des requêtes nettement plus faciles à gagner que celles portant sur Lille.</p>")],
    ),
    dict(
        suffix="seo-toulouse", struct="C",
        eyebrow="Référencement naturel — Toulouse",
        h1="Un tissu industriel qui cherche des compétences, pas des prestataires.",
        lead="L'aéronautique et le spatial structurent l'économie toulousaine et sa chaîne de sous-traitance. Sur ces marchés, personne ne tape « prestataire Toulouse » : on cherche une norme, une certification, un procédé précis.",
        cells=[("Aéronautique", "une chaîne de sous-traitance", "Des donneurs d'ordre exigeants qui vérifient les qualifications avant de consulter."),
               ("Recherche", "laboratoires et écoles", "Un public qui lit en détail et compare méthodiquement avant de prendre contact."),
               ("Étalement", "une métropole étendue", "Blagnac, Colomiers, Labège : des pôles éloignés avec des recherches distinctes.")],
        grid_title="Ce qui fonctionne sur le marché toulousain.",
        grid_items=[("target", "Pages par compétence", "Une page par procédé, norme ou qualification — c'est le niveau auquel la recherche se fait réellement."),
                    ("check", "Preuves de conformité", "Certifications, agréments, références de donneurs d'ordre. Le premier filtre du prospect industriel."),
                    ("layers", "Contenus techniques", "Des documents détaillés se positionnent durablement sur des requêtes très qualifiées et peu disputées."),
                    ("signal", "Pôles d'activité", "Blagnac et Labège ne sont pas des quartiers toulousains mais des bassins autonomes.")],
        split_title="Un contenu technique se positionne mieux qu'une page commerciale.",
        split_html="<p>Sur un marché industriel, un article détaillant un procédé, ses contraintes et ses tolérances attire exactement le lecteur qui cherche un fournisseur. Il attire peu de monde, mais il attire les bonnes personnes.</p><p>Ces pages sont aussi les plus faciles à défendre : quasiment personne ne les produit, parce qu'elles demandent une expertise réelle.</p>",
        points=[("Écrire à votre niveau", "Le vocabulaire technique n'est pas un obstacle : c'est ce que tape votre prospect."),
                ("Documenter les contraintes", "Ce que vous ne pouvez pas faire qualifie autant que ce que vous faites."),
                ("Assumer un faible volume", "Trente visiteurs par mois pertinents valent mieux que trois mille visiteurs hors cible.")],
        faqs=[("Mon activité est trop technique pour intéresser Google.",
               "<p>C'est presque toujours faux, et c'est même l'inverse : les requêtes techniques ont peu de volume mais une intention commerciale très forte et quasiment aucune concurrence éditoriale. Ce sont les positions les plus rentables et les plus stables du référencement B2B.</p>"),
              ("Les donneurs d'ordre passent-ils vraiment par Google ?",
               "<p>Pour identifier de nouveaux fournisseurs et vérifier ceux qu'on leur a recommandés, oui, systématiquement. Un site absent ou daté fait douter au moment précis où le prospect cherche à se rassurer avant de vous consulter.</p>")],
    ),
    dict(
        suffix="seo-nice", struct="D",
        eyebrow="Référencement naturel — Nice",
        h1="Une clientèle saisonnière, internationale, et exigeante.",
        lead="Sur la Côte d'Azur, une partie significative de la demande vient de personnes qui ne résident pas sur place : résidents secondaires, touristes, clientèle étrangère. Elles cherchent différemment, souvent en anglais, et avant même d'arriver.",
        cells=[("Saison", "des écarts considérables", "Les volumes de recherche varient fortement selon les mois sur la plupart des métiers de service."),
               ("International", "recherches en anglais", "Une part réelle de la demande formule ses requêtes dans une autre langue."),
               ("Prestige", "attentes élevées", "Sur l'immobilier et les services haut de gamme, un site approximatif disqualifie immédiatement.")],
        steps_title="Construire une visibilité qui tient hors saison.",
        steps_items=[("Cartographier la demande", "Séparer ce qui est saisonnier de ce qui est permanent. Les deux n'appellent pas le même contenu.", "Semaine 1"),
                     ("Préparer la haute saison", "Produire et publier les contenus saisonniers plusieurs mois en avance pour qu'ils soient positionnés au bon moment.", "Semaines 2-8"),
                     ("Traiter l'international", "Évaluer le volume réel des requêtes en anglais avant d'engager une traduction. Souvent quelques pages suffisent.", "Semaines 4-6"),
                     ("Tenir hors saison", "Des contenus permanents qui maintiennent l'activité du site quand la demande retombe.", "En continu")],
        split_title="Traduire tout le site est presque toujours une erreur.",
        split_html="<p>Le réflexe habituel consiste à traduire l'intégralité du site en anglais. Le résultat : un volume de pages à maintenir, souvent traduites approximativement, pour des requêtes dont personne n'a vérifié le volume.</p><p>Nous mesurons d'abord la demande réelle, puis nous traduisons uniquement les pages qui la captent — généralement trois à cinq.</p>",
        points=[("Vérifier avant de traduire", "Le volume de recherche en anglais se mesure. Il est parfois nul, parfois considérable selon le métier."),
                ("Traduire, pas transposer", "Une traduction automatique se voit et se retourne contre vous sur une clientèle exigeante."),
                ("Baliser correctement", "Les versions linguistiques doivent être déclarées proprement, sinon elles se concurrencent.")],
        faqs=[("Mon activité s'effondre hors saison, que faire du site ?",
               "<p>Le site doit précisément servir à lisser cette courbe : contenus permanents, offres hors saison, clientèle locale à l'année. C'est un travail de fond, mais c'est le seul moyen d'éviter de repartir de zéro chaque printemps en matière de visibilité.</p>"),
              ("Faut-il une version anglaise ?",
               "<p>Cela se vérifie plutôt que cela ne se suppose. Sur l'immobilier de prestige, la conciergerie ou le tourisme haut de gamme, la demande anglophone est bien réelle. Sur un métier de service local, elle est souvent négligeable. Nous mesurons avant de vous engager dans un chantier de traduction.</p>")],
    ),
    dict(
        suffix="seo-rennes", struct="A",
        eyebrow="Référencement naturel — Rennes",
        h1="Une ville jeune, connectée, qui vérifie tout avant d'appeler.",
        lead="Avec l'une des plus fortes proportions d'étudiants de France et un écosystème numérique installé, Rennes a un public qui compare en ligne systématiquement. Un site incomplet ou daté élimine avant même le premier contact.",
        cells=[("Étudiants", "une population très mobile", "Un renouvellement permanent qui cherche tous les services sans référence préalable."),
               ("Agroalimentaire", "la filière régionale", "Un tissu B2B important, avec un vocabulaire métier précis et peu de concurrence éditoriale."),
               ("Numérique", "un pôle installé", "Des clients habitués à évaluer un prestataire sur la qualité de son site.")],
        split_title="Un public qui lit vraiment les avis, et les réponses aux avis.",
        split_html="<p>Sur un marché jeune et connecté, la réputation en ligne pèse au moins autant que le classement. Un professionnel bien positionné mais mal noté ne reçoit pas d'appel : le visiteur passe au suivant.</p><p>Nous traitons donc la collecte d'avis et la réponse aux avis comme une partie intégrante du référencement local, pas comme un sujet annexe.</p>",
        points=[("Collecte régulière", "Quelques avis chaque mois valent mieux qu'une campagne ponctuelle suivie de deux ans de silence."),
                ("Réponses systématiques", "Répondre aux avis, y compris négatifs, est lu par les prospects et valorisé par les moteurs."),
                ("Cohérence des plateformes", "Un profil soigné d'un côté et abandonné de l'autre crée un doute immédiat.")],
        faqs=[("La population étudiante est-elle un marché intéressant ?",
               "<p>Cela dépend entièrement du métier, et il faut être honnête : sur beaucoup d'activités, le pouvoir d'achat étudiant est faible. En revanche, le renouvellement permanent crée un flux de recherches sans habitude installée — ce qui profite aux nouveaux entrants bien positionnés.</p>"),
              ("Comment se différencier sur un marché où tout le monde a un bon site ?",
               "<p>Par la profondeur plutôt que par l'apparence. Quand tous les concurrents ont un site correct, la différence se fait sur les contenus qui répondent réellement aux questions : tarification transparente, cas traités en détail, limites assumées. C'est plus difficile à copier qu'un design.</p>")],
    ),
    dict(
        suffix="seo-strasbourg", struct="B",
        eyebrow="Référencement naturel — Strasbourg",
        h1="Un marché bilingue que les sites français traitent rarement.",
        lead="Strasbourg vit avec l'Allemagne : clients, salariés et fournisseurs franchissent le Rhin quotidiennement. Une partie mesurable de la demande locale se formule en allemand, sur des requêtes que presque aucun site strasbourgeois ne couvre.",
        cells=[("Frontière", "le bassin rhénan", "Kehl, Offenbourg et la Ortenau relèvent de la même zone de chalandise pratique."),
               ("Institutions", "un tissu européen", "Organisations et prestataires associés, avec des exigences de sérieux élevées."),
               ("Bilinguisme", "deux langues de recherche", "Un même besoin exprimé de deux façons, avec une concurrence très inégale entre les deux.")],
        split_title="La demande allemande est mesurable, et presque libre.",
        split_html="<p>Un habitant de Kehl qui cherche un prestataire trouve d'abord des sites allemands. Les entreprises strasbourgeoises, à quelques kilomètres, sont invisibles pour lui — simplement parce qu'aucune page ne parle sa langue.</p><p>Quelques pages en allemand, correctement rédigées et balisées, ouvrent un marché de proximité que personne ne dispute.</p>",
        points=[("Mesurer d'abord", "Le volume de recherche allemand sur votre métier se vérifie. Il justifie ou non l'investissement."),
                ("Traduction professionnelle", "Une traduction automatique se repère instantanément et détruit la crédibilité sur ce public."),
                ("Balisage linguistique", "Les versions doivent être déclarées correctement pour ne pas se concurrencer entre elles.")],
        faqs=[("Faut-il vraiment une version allemande ?",
               "<p>Uniquement si le volume le justifie, et cela se mesure avant tout engagement. Sur les services aux particuliers proches de la frontière, c'est souvent rentable. Sur une activité tournée vers l'intérieur du territoire, non. Nous vérifions les volumes réels avant de recommander quoi que ce soit.</p>"),
              ("Les institutions européennes représentent-elles un marché ?",
               "<p>Indirectement, surtout : l'écosystème de prestataires, de cabinets et de services qui gravite autour est bien plus accessible que les institutions elles-mêmes, dont les achats passent par des marchés publics. C'est ce tissu périphérique que le référencement peut réellement atteindre.</p>")],
    ),
    dict(
        suffix="seo-montpellier", struct="C",
        eyebrow="Référencement naturel — Montpellier",
        h1="La ville grandit plus vite que la concurrence ne s'organise.",
        lead="Montpellier fait partie des métropoles françaises les plus dynamiques démographiquement. Cette croissance crée une demande nouvelle chaque année, et beaucoup d'entreprises locales n'ont pas encore adapté leur visibilité à ce rythme.",
        cells=[("Santé", "recherche et biotechnologies", "Un pôle installé, avec des exigences de fiabilité éditoriale renforcées."),
               ("Croissance", "arrivées continues", "Des habitants sans habitudes locales, qui cherchent tout en ligne."),
               ("Littoral", "communes périphériques", "Palavas, Lattes, Castelnau : des recherches distinctes et peu disputées.")],
        grid_title="Où se trouvent les gains rapides.",
        grid_items=[("signal", "Communes périphériques", "Beaucoup moins disputées que Montpellier et souvent ignorées par les concurrents."),
                    ("target", "Fiche d'établissement", "Le premier point de contact pour un nouvel arrivant sans recommandation."),
                    ("check", "Contenus d'installation", "Répondre aux questions de quelqu'un qui vient d'arriver capte une demande à faible concurrence."),
                    ("gauge", "Avis récents", "Sans bouche-à-oreille local, l'avis en ligne devient le seul repère disponible.")],
        split_title="Les communes voisines coûtent moins cher que la ville-centre.",
        split_html="<p>Se positionner sur « Montpellier » demande du temps et de l'autorité. Se positionner sur Lattes, Castelnau-le-Lez ou Saint-Jean-de-Védas demande une page correcte et quelques semaines.</p><p>Ces communes concentrent pourtant une population aisée et une demande réelle. C'est le raccourci le plus sous-exploité de la métropole.</p>",
        points=[("Une page par commune servie", "Avec un contenu propre : ce qu'on y fait, pour qui, avec quelles références."),
                ("Un maillage vers la page mère", "Les pages communales renforcent la page Montpellier au lieu de lui faire concurrence."),
                ("Des preuves locales", "Une réalisation située dans la commune vaut plus que dix arguments génériques.")],
        faqs=[("Dois-je commencer par Montpellier ou par ma commune ?",
               "<p>Par votre commune, presque toujours. Le résultat arrive en quelques semaines au lieu de plusieurs mois, il génère des demandes immédiates, et l'autorité gagnée profite ensuite à la page Montpellier. C'est l'ordre inverse de celui que choisissent la plupart des entreprises.</p>"),
              ("Le secteur santé impose-t-il des précautions ?",
               "<p>Oui, sur deux plans : l'exigence de fiabilité appliquée par les moteurs aux contenus de santé, et les règles déontologiques propres aux professions réglementées, qui encadrent strictement la communication. Nous travaillons dans ce cadre plutôt que de vous exposer.</p>")],
    ),
    dict(
        suffix="seo-grenoble", struct="D",
        eyebrow="Référencement naturel — Grenoble",
        h1="Un marché où l'expertise se démontre avant de se vendre.",
        lead="Microélectronique, énergie, instrumentation, montagne : le tissu grenoblois est probablement l'un des plus techniques de France. Les prospects y sont ingénieurs, ils lisent avant de contacter, et ils repèrent immédiatement l'argumentaire creux.",
        cells=[("R&D", "une densité rare", "Laboratoires, centres de recherche et sous-traitance de haute technicité."),
               ("Montagne", "un marché saisonnier propre", "Équipement, tourisme, services d'altitude : des recherches concentrées sur quelques mois."),
               ("Vallées", "une géographie contraignante", "Grenoble, Voiron, Grésivaudan : des bassins séparés par le relief autant que par la distance.")],
        steps_title="Se rendre crédible auprès d'un public technique.",
        steps_items=[("Identifier le vocabulaire réel", "Relever les termes exacts employés dans votre filière. L'approximation se voit immédiatement.", "Semaine 1"),
                     ("Produire de la documentation", "Notes techniques, cas d'application, contraintes et limites. Ce qui se lit et se partage entre pairs.", "Semaines 2-8"),
                     ("Afficher les qualifications", "Certifications, équipements, moyens de contrôle. Le filtre que le prospect applique en premier.", "Semaine 2"),
                     ("Couvrir les bassins", "Traiter séparément les vallées où vous intervenez : le relief structure les recherches.", "Semaines 4-10")],
        split_title="Un prospect ingénieur ne lit pas un argumentaire, il cherche des données.",
        split_html="<p>« Solutions innovantes » et « savoir-faire reconnu » n'ont aucun effet sur ce public — ils en ont même un négatif, en signalant l'absence de contenu réel. Ce qui convainc : des tolérances, des matériaux, des délais, des limites clairement énoncées.</p><p>C'est plus exigeant à produire, et c'est exactement pour cela que la concurrence y est faible.</p>",
        points=[("Des chiffres, pas des adjectifs", "Capacités, précisions, volumes traités. Ce qui permet de vous présélectionner."),
                ("Les limites annoncées", "Dire ce que vous ne faites pas installe la crédibilité sur tout le reste."),
                ("Des cas documentés", "Un problème, une contrainte, une solution. Le format qui circule entre professionnels.")],
        faqs=[("Mon marché est trop spécialisé pour le référencement.",
               "<p>Un marché spécialisé est le terrain le plus favorable au référencement, pas le moins : peu de volume, mais une intention d'achat presque systématique et quasiment aucun concurrent produisant du contenu sérieux. Dix visiteurs par mois qui cherchent exactement votre procédé valent mieux que mille visiteurs curieux.</p>"),
              ("Faut-il traiter Voiron et le Grésivaudan séparément ?",
               "<p>Oui, si vous y intervenez. Le relief structure les habitudes autant que l'administration : un client du Grésivaudan cherche rarement « Grenoble ». Ce sont des zones distinctes, avec une concurrence bien plus faible que sur la ville-centre.</p>")],
    ),
    dict(
        suffix="agence-seo-luxembourg", struct="B",
        eyebrow="Référencement naturel — Luxembourg",
        h1="Un marché petit, riche, et multilingue par nécessité.",
        lead="Le Grand-Duché concentre un pouvoir d'achat élevé sur un territoire réduit, avec une main-d'œuvre frontalière massive venue de France, de Belgique et d'Allemagne. Les volumes de recherche y sont faibles, mais la valeur de chaque demande est sans commune mesure.",
        cells=[("Frontaliers", "une population pendulaire", "Des personnes qui vivent d'un côté de la frontière et consomment de l'autre — leurs recherches mélangent les deux."),
               ("Multilingue", "français, allemand, anglais", "Trois langues de recherche réellement utilisées, selon le secteur et le public visé."),
               ("Faible volume", "forte valeur", "Peu de recherches mensuelles, mais un panier moyen et un pouvoir d'achat très supérieurs.")],
        split_title="Ici, cinquante recherches par mois peuvent suffire.",
        split_html="<p>Les outils de mesure affichent des volumes qui paraîtraient dérisoires en France. Rapportés au niveau de prix pratiqué et à la valeur d'un client au Luxembourg, ils changent complètement de sens.</p><p>Nous raisonnons donc en valeur de demande entrante, jamais en volume de trafic — le second indicateur est trompeur sur ce marché.</p>",
        points=[("Arbitrer par la valeur", "Une requête à cinquante recherches mensuelles peut être plus rentable qu'une requête à cinq mille en France."),
                ("Choisir les langues utilement", "Le français domine largement les services aux particuliers, l'anglais s'impose dans la finance."),
                ("Intégrer les frontaliers", "Ils cherchent depuis Thionville ou Arlon des prestataires situés au Luxembourg.")],
        faqs=[("Les volumes de recherche sont très faibles, est-ce rentable ?",
               "<p>Le volume est le mauvais indicateur ici. Ce qui compte, c'est la valeur d'un client et le taux de conversion d'une requête à forte intention. Sur beaucoup de métiers luxembourgeois, une poignée de demandes mensuelles bien qualifiées rentabilise largement le travail engagé.</p>"),
              ("Dans quelle langue faut-il publier ?",
               "<p>Le français couvre l'essentiel des services aux particuliers et une grande partie du B2B. L'anglais devient nécessaire dans la finance, le conseil international et les fonctions supports des grands groupes. L'allemand reste utile près de la frontière et sur certains publics résidents. La réponse dépend de votre clientèle réelle, pas d'un principe général.</p>"),
              ("Puis-je viser aussi les frontaliers français et belges ?",
               "<p>Oui, et c'est souvent négligé. Un habitant de Thionville ou d'Arlon qui travaille au Luxembourg y consomme aussi des services. Il cherche depuis chez lui, avec des formulations mêlant les deux pays — un terrain que peu de sites luxembourgeois couvrent explicitement.</p>")],
    ),
]


# --------------------------------------------------------------------------
# Trames : quatre enchaînements différents, attribués par ville.
# --------------------------------------------------------------------------
def build(v):
    h = ("hero", hero(v["eyebrow"], v["h1"], v["lead"],
                      "Évaluer ma visibilité", "Voir toutes les zones", "/pages/seo-par-ville",
                      "SEO local", "/pages/seo-local"))
    st = ("contexte", stats("Le marché local", v.get("stats_title", "Ce qui caractérise ce marché."),
                            v["cells"],
                            source="Lecture qualitative du tissu économique local. Les volumes réels sont mesurés pendant le diagnostic.",
                            surface="dark"))
    sp = ("analyse", split("Notre lecture", v["split_title"], v["split_html"], v["points"],
                           surface="paper", reverse=(v["struct"] in ("C", "D"))))
    f = ("faq", faq(v.get("faq_title", "Questions fréquentes sur cette zone."), "",
                    v["faqs"], surface="dark"))
    c = ("cta", cta("Étape suivante",
                    v.get("cta_title", "Regardons votre position réelle sur cette zone."),
                    v.get("cta_text", "Indiquez-nous votre activité et vos communes d'intervention. Nous relevons votre classement actuel depuis chacune d'elles et l'état de votre fiche d'établissement."),
                    "Demander un relevé de position",
                    link="Voir la prestation SEO", link_url="/pages/agence-seo",
                    points=("Relevé géolocalisé", "Sans engagement")))

    if v["struct"] == "A":
        return [h, st, sp,
                ("methode", grid("Notre intervention", v["grid_title"], "",
                                 v["grid_items"], surface="paper")),
                f, c]
    if v["struct"] == "B":
        return [h, sp, st,
                ("methode", steps("Déroulé", v["steps_title"], "",
                                  v["steps_items"], surface="paper")),
                f, c]
    if v["struct"] == "C":
        return [h,
                ("methode", grid("Priorités", v["grid_title"], "", v["grid_items"], surface="dark")),
                sp, st, f, c]
    return [h, st,
            ("methode", steps("Déroulé", v["steps_title"], "", v["steps_items"], surface="paper")),
            sp, f, c]





# --------------------------------------------------------------------------
# Compléments par ville : bloc « méthode » et appel à l'action.
# Ils étaient mutualisés dans une première version — un contrôle automatique a
# montré que treize pages partageaient alors les mêmes paragraphes. Corrigé.
# --------------------------------------------------------------------------
SUPPLEMENTS = {
 "seo-paris": dict(
   grid_title="Par où l'on commence sur un marché saturé.",
   grid_items=[("signal", "Requêtes de niche", "On cherche les formulations précises que les gros acteurs n'ont jamais rédigées. C'est là que les places sont libres."),
               ("target", "Quartier plutôt que ville", "Une page de secteur bien documentée bat une page « Paris » générique sur les recherches de proximité."),
               ("layers", "Profondeur éditoriale", "Face à des sites installés, seul un contenu plus complet que le leur permet de passer devant."),
               ("gauge", "Arbitrage permanent", "Chaque requête est évaluée en coût d'acquisition. Certaines sont abandonnées, et c'est une décision, pas un renoncement.")],
   cta_title="Voyons quelles requêtes parisiennes vous pouvez réellement gagner.",
   cta_text="Donnez-nous votre activité et votre secteur. Nous vous dirons lesquelles sont hors de portée aujourd'hui, et lesquelles sont accessibles en quelques mois."),

 "seo-local-nantes": dict(
   grid_title="Ce que nous mettons en place pour capter les nouveaux arrivants.",
   grid_items=[("check", "Contenus d'orientation", "Répondre aux questions de quelqu'un qui découvre la ville : une demande réelle, presque sans concurrence."),
               ("target", "Fiche irréprochable", "Pour un arrivant sans réseau, votre fiche d'établissement est souvent le seul élément de comparaison."),
               ("signal", "Communes de l'agglomération", "Saint-Herblain, Rezé, Orvault : des recherches distinctes et bien plus accessibles que Nantes."),
               ("gauge", "Exigence de finition", "Sur un marché habitué au numérique, un site approximatif élimine avant même l'appel.")],
   cta_title="Regardons si vous captez les Nantais qui viennent d'arriver.",
   cta_text="Indiquez-nous votre métier et vos communes. Nous mesurons votre visibilité auprès d'une clientèle qui ne vous connaît pas encore."),

 "seo-rennes": dict(
   grid_title="Nos priorités sur le marché rennais.",
   grid_items=[("gauge", "Réputation en ligne", "Collecte régulière d'avis et réponses systématiques : sur ce public, cela pèse autant que le classement."),
               ("signal", "Vocabulaire de filière", "Sur l'agroalimentaire, les termes métier ouvrent des requêtes précises et très peu disputées."),
               ("layers", "Transparence des offres", "Un public qui compare attend des informations concrètes : périmètre, délais, ordres de prix."),
               ("target", "Communes de la métropole", "Cesson-Sévigné, Saint-Grégoire, Bruz : des zones à concurrence faible souvent oubliées.")],
   cta_title="Mesurons ce que voit un Rennais qui vous compare.",
   cta_text="Nous relevons votre position, l'état de vos avis et ce que trouvent vos prospects quand ils vérifient votre nom avant de vous appeler."),

 "seo-lyon": dict(
   steps_title="Comment nous déployons sur la métropole lyonnaise.",
   steps_items=[("Cartographier vos communes", "Identifier où sont réellement vos clients dans la métropole, avant de décider quelles pages créer.", "Semaine 1"),
                ("Traiter la commune d'abord", "Publier la page communale la plus accessible pour obtenir un premier résultat rapidement.", "Semaines 2-4"),
                ("Étendre par bassin", "Ajouter progressivement les communes voisines, chacune avec ses références propres.", "Semaines 4-10"),
                ("Attaquer Lyon", "Une fois l'autorité constituée, viser la requête métropolitaine devient réaliste.", "Mois 3 et suivants")],
   cta_title="Situons votre visibilité dans la métropole, commune par commune.",
   cta_text="Dites-nous où sont vos clients. Nous relevons votre classement depuis chacune de ces communes, pas depuis un point unique."),

 "seo-lille": dict(
   steps_title="Ouvrir le marché transfrontalier en quatre temps.",
   steps_items=[("Mesurer la demande belge", "Vérifier les volumes réels côté wallon sur votre métier avant d'investir quoi que ce soit.", "Semaine 1"),
                ("Adapter le vocabulaire", "Relever les formulations propres au français de Belgique, qui diffèrent plus qu'on ne le croit.", "Semaine 2"),
                ("Publier la page frontalière", "Une page qui assume la zone belge, ses communes et les modalités pratiques de collaboration.", "Semaines 3-5"),
                ("Couvrir la métropole", "Roubaix, Tourcoing, Villeneuve-d'Ascq traités séparément, avec leurs recherches propres.", "Semaines 5-10")],
   cta_title="Vérifions ce que vous manquez côté belge.",
   cta_text="Nous mesurons les recherches wallonnes sur votre métier et votre position actuelle dessus. Le plus souvent, elle est inexistante."),

 "seo-strasbourg": dict(
   steps_title="Traiter le bilinguisme sans se disperser.",
   steps_items=[("Mesurer la demande allemande", "Volumes réels côté badois sur votre activité. C'est cette mesure qui décide, pas une intuition.", "Semaine 1"),
                ("Choisir les pages à traduire", "Trois à cinq pages suffisent presque toujours. Traduire l'intégralité du site est rarement justifié.", "Semaine 2"),
                ("Traduction et balisage", "Traduction professionnelle et déclaration correcte des versions, pour qu'elles ne se concurrencent pas.", "Semaines 3-5"),
                ("Suivre les deux marchés", "Positions relevées séparément en français et en allemand, avec des arbitrages distincts.", "En continu")],
   cta_title="Mesurons ce que cherchent vos voisins allemands.",
   cta_text="Nous relevons les volumes de recherche germanophones sur votre métier et estimons si une version allemande se rentabilise chez vous."),

 "agence-seo-luxembourg": dict(
   steps_title="Une méthode calibrée pour un marché à faible volume.",
   steps_items=[("Estimer la valeur d'une demande", "Point de départ obligatoire : ce que vaut un client luxembourgeois décide de tout le reste.", "Semaine 1"),
                ("Choisir les langues", "Français, anglais, allemand : on tranche à partir de votre clientèle réelle, pas d'un principe.", "Semaine 2"),
                ("Couvrir les requêtes à forte valeur", "Peu de pages, très travaillées, sur les intentions qui produisent des demandes qualifiées.", "Semaines 3-8"),
                ("Intégrer les frontaliers", "Ajouter les recherches venues de Thionville, Arlon ou Trèves, largement inexploitées.", "Semaines 8-12")],
   cta_title="Estimons ce que vaut réellement votre visibilité luxembourgeoise.",
   cta_text="Donnez-nous votre activité et votre panier moyen. Nous raisonnons en valeur de demande entrante, jamais en volume de trafic."),

 "seo-local-marseille": dict(
   cta_title="Relevons votre visibilité quartier par quartier.",
   cta_text="Nous mesurons votre classement depuis plusieurs points de Marseille : les écarts entre secteurs sont souvent considérables."),
 "seo-local-bordeaux": dict(
   cta_title="Comparons vos positions d'aujourd'hui à celles d'il y a deux ans.",
   cta_text="Nous identifions les pages qui ont reculé, les concurrents qui sont arrivés dessus, et ce qu'il faut renforcer en priorité."),
 "seo-toulouse": dict(
   cta_title="Voyons sur quelles requêtes techniques vous êtes absent.",
   cta_text="Donnez-nous vos procédés et vos qualifications. Nous relevons les recherches de votre filière et votre présence dessus."),
 "seo-nice": dict(
   cta_title="Regardons votre visibilité en saison et hors saison.",
   cta_text="Nous mesurons l'écart entre vos deux périodes et estimons le volume réel de la demande anglophone sur votre métier."),
 "seo-montpellier": dict(
   cta_title="Identifions les communes où vous pouvez gagner vite.",
   cta_text="Nous relevons votre position sur Montpellier et sur les communes voisines, où la concurrence est souvent bien plus faible."),
 "seo-grenoble": dict(
   cta_title="Vérifions si votre expertise est trouvable.",
   cta_text="Donnez-nous votre domaine technique. Nous cherchons ce que tapent vos prospects et regardons si vous apparaissez dessus."),
}

for _v in VILLES:
    _v.update(SUPPLEMENTS.get(_v["suffix"], {}))


if __name__ == "__main__":
    for v in VILLES:
        print("écrit :", write(v["suffix"], build(v)))
