/* Calendrier éditorial du journal Ély'Skin.

   Quatre-vingt-douze jours, du 1er novembre au 31 janvier, un article par
   jour. L'ordre du tableau est l'ordre de parution : la date se calcule depuis
   l'indice, à huit heures heure de Paris.

   Les sujets alternent volontairement de rubrique d'un jour sur l'autre. Un
   lecteur qui revient ne tombe pas trois matins de suite sur la même famille,
   et la grappe de liens internes se répartit sur les sept soins au lieu de se
   concentrer sur un seul.

   Chaque entrée porte :
     t   le titre, et donc le H1
     p   la poignée d'URL
     r   la rubrique, qui devient l'étiquette de l'article
     l   le seul lien interne de l'article
     ex  la poignée d'un article déjà publié, à reprogrammer sans le réécrire
*/

export const DEBUT = '2026-11-01';
export const HEURE = '07:00:00Z'; // huit heures à Paris en hiver

export const RUBRIQUES = {
  peau: 'La peau',
  cicatrices: 'Cicatrices et marques',
  taches: 'Taches et teint',
  fermete: 'Fermeté et contours',
  cabinet: 'Au cabinet',
  circulation: 'Circulation et gonflement',
};

const H = '/pages/hydrofacial';
const M = '/pages/microneedling';
const P = '/pages/peeling';
const D = '/pages/diagnostic-infirmier';
const F = '/pages/hifu-radiofrequence';
const L = '/pages/luminotherapie-led';
const G = '/pages/drainage-lymphatique';
const C = '/pages/casablanca';
const T = '/pages/tarifs';

export const CALENDRIER = [
  // ---------------------------------------------------------------- novembre

  { ex: 'pores-dilates-les-rendre-moins-visibles', r: 'peau', l: H },
  { ex: 'cicatrices-acne-en-creux-collagene', r: 'cicatrices', l: M },
  { ex: 'reconnaitre-une-tache-avant-de-la-traiter', r: 'taches', l: P },
  { ex: 'infirmiere-ou-estheticienne-ce-que-change-la-formation', r: 'cabinet', l: D },
  { ex: 'acne-adulte-pourquoi-elle-revient', r: 'peau', l: L },
  { ex: 'relachement-ovale-apres-35-ans', r: 'fermete', l: F },
  { ex: 'visage-gonfle-au-reveil-la-lymphe', r: 'circulation', l: G },
  { ex: 'teint-terne-quatre-causes', r: 'taches', l: H },
  { ex: 'peeling-en-hiver-la-saison-change-tout', r: 'taches', l: P },
  { ex: 'routine-a-cinq-produits', r: 'peau', l: D },
  { ex: 'rougeurs-peau-reactive-apaiser', r: 'peau', l: L },
  { ex: 'cou-et-decollete-la-zone-oubliee', r: 'fermete', l: F },
  { ex: 'vergetures-cicatrices-chirurgie-ce-qui-sameliore', r: 'cicatrices', l: M },

  { t: "Barrière cutanée abîmée : les six signes qui ne trompent pas", p: 'barriere-cutanee-abimee-les-signes', r: 'peau', l: D },
  { t: "Points noirs : pourquoi ils reviennent trois semaines après", p: 'points-noirs-pourquoi-ils-reviennent', r: 'peau', l: H },
  { t: "Peau grasse : la traiter comme une ennemie l'aggrave", p: 'peau-grasse-ne-pas-la-decaper', r: 'peau', l: H },
  { t: "Cicatrices d'acné : le bon moment pour s'en occuper", p: 'cicatrices-acne-quand-commencer', r: 'cicatrices', l: M },
  { t: "Taches brunes après la grossesse : ce qui part et ce qui reste", p: 'taches-brunes-apres-grossesse', r: 'taches', l: P },
  { t: "Premier rendez-vous : ce qui se passe pendant quarante minutes", p: 'premier-rendez-vous-le-deroule', r: 'cabinet', l: D },
  { t: "Rides du front et de la patte d'oie : ce qui se joue dessous", p: 'rides-front-patte-oie-ce-qui-se-joue', r: 'fermete', l: F },

  { t: "Cernes bleutés : la circulation, pas la fatigue", p: 'cernes-bleutes-la-circulation', r: 'circulation', l: G },
  { t: "Peau déshydratée ou peau sèche : deux problèmes, deux réponses", p: 'peau-deshydratee-ou-peau-seche', r: 'peau', l: D },
  { t: "Grain de peau irrégulier : ce qui le lisse vraiment", p: 'grain-de-peau-irregulier', r: 'taches', l: P },
  { t: "Masque de grossesse : pourquoi il revient chaque été", p: 'masque-de-grossesse-melasma', r: 'taches', l: P },
  { t: "Pores dilatés du nez : la zone la plus difficile du visage", p: 'pores-dilates-du-nez', r: 'peau', l: H },
  { t: "Rosacée : ce qu'un cabinet esthétique peut, et ne peut pas", p: 'rosacee-ce-qu-un-cabinet-peut-faire', r: 'peau', l: L },
  { t: "Double menton : ce qui relève de la peau, du gras et du muscle", p: 'double-menton-trois-causes', r: 'fermete', l: F },

  { t: "Combien de séances pour voir un résultat : les chiffres réels", p: 'combien-de-seances-pour-un-resultat', r: 'cabinet', l: T },
  { t: "Cicatrices de varicelle : les creux les plus résistants", p: 'cicatrices-de-varicelle', r: 'cicatrices', l: M },
  { t: "Soins esthétiques à Casablanca : ce qui change, ce qui ne change pas", p: 'soins-esthetiques-a-casablanca', r: 'cabinet', l: C },
  { t: "Acné hormonale : lire son cycle avant de changer de crème", p: 'acne-hormonale-lire-son-cycle', r: 'peau', l: L },
  { t: "Jambes lourdes et rétention : ce que le drainage change", p: 'jambes-lourdes-et-retention', r: 'circulation', l: G },
  { t: "Cou qui se détend : agir avant que les cordes apparaissent", p: 'cou-qui-se-detend-agir-tot', r: 'fermete', l: F },

  { t: "Rétinoïdes : les introduire sans brûler sa peau", p: 'retinoides-les-introduire-sans-bruler', r: 'peau', l: D },
  { t: "Hyperpigmentation post-inflammatoire : attendre ou traiter", p: 'hyperpigmentation-post-inflammatoire', r: 'taches', l: P },

  // ---------------------------------------------------------------- décembre
  { t: "Peau du contour des yeux : pourquoi elle marque en premier", p: 'contour-des-yeux-pourquoi-il-marque', r: 'fermete', l: F },
  { t: "Nettoyage de peau : ce qu'une extraction manuelle abîme", p: 'nettoyage-de-peau-extraction-manuelle', r: 'peau', l: H },
  { t: "Cicatrices chéloïdes : le terrain qui interdit certains soins", p: 'cicatrices-cheloides-le-terrain', r: 'cicatrices', l: M },
  { t: "Protection solaire en décembre : l'erreur la plus répandue", p: 'protection-solaire-en-decembre', r: 'taches', l: P },
  { t: "Fêtes : le calendrier des soins à ne pas rater", p: 'fetes-le-calendrier-des-soins', r: 'cabinet', l: H },
  { t: "Peau qui tire après le nettoyage : ce que ça veut dire", p: 'peau-qui-tire-apres-le-nettoyage', r: 'peau', l: D },

  { t: "Collagène : ce que les compléments font, et ne font pas", p: 'collagene-ce-que-les-complements-font', r: 'fermete', l: F },
  { t: "Visage asymétrique au réveil : la position de sommeil", p: 'visage-asymetrique-au-reveil', r: 'circulation', l: G },
  { t: "Boutons sous la peau : les kystes qu'il ne faut pas percer", p: 'boutons-sous-la-peau-kystes', r: 'peau', l: L },
  { t: "Taches sur les mains : la zone qu'on traite dix ans trop tard", p: 'taches-sur-les-mains', r: 'taches', l: P },
  { t: "Microneedling ou peeling : comment on tranche", p: 'microneedling-ou-peeling-comment-trancher', r: 'cicatrices', l: M },
  { t: "Chauffage et peau sèche : ce que l'hiver change en intérieur", p: 'chauffage-et-peau-seche', r: 'peau', l: D },
  { t: "Ovale du visage après une perte de poids", p: 'ovale-apres-une-perte-de-poids', r: 'fermete', l: F },

  { t: "Pourquoi un cabinet refuse une séance", p: 'pourquoi-un-cabinet-refuse-une-seance', r: 'cabinet', l: D },
  { t: "Dermatite séborrhéique ou acné : les distinguer", p: 'dermatite-seborrheique-ou-acne', r: 'peau', l: L },
  { t: "Cicatrice récente : les six premiers mois décident de tout", p: 'cicatrice-recente-les-six-premiers-mois', r: 'cicatrices', l: M },
  { t: "Teint qui jaunit : tabac, sucre et sommeil", p: 'teint-qui-jaunit', r: 'taches', l: H },
  { t: "Peau mixte : traiter deux zones sans en abîmer une", p: 'peau-mixte-deux-zones', r: 'peau', l: H },
  { t: "Lymphe et sport : pourquoi bouger dégonfle le visage", p: 'lymphe-et-sport', r: 'circulation', l: G },
  { t: "Relâchement des joues : le creux qui précède la chute", p: 'relachement-des-joues', r: 'fermete', l: F },

  { t: "Acide hyaluronique en crème : ce qu'il fait réellement", p: 'acide-hyaluronique-en-creme', r: 'peau', l: D },
  { t: "Taches de soleil sur le décolleté : la zone oubliée", p: 'taches-de-soleil-decollete', r: 'taches', l: P },
  { t: "Pores obstrués du menton : la zone la plus sollicitée", p: 'pores-obstrues-du-menton', r: 'peau', l: H },
  { t: "Cicatrices d'acné sur peau mate : la prudence qui s'impose", p: 'cicatrices-acne-peau-mate', r: 'cicatrices', l: M },
  { t: "Première séance de LED : ce qu'on ressent, ce qu'on voit", p: 'premiere-seance-de-led', r: 'peau', l: L },
  { t: "Budget d'un protocole : comment il se construit", p: 'budget-d-un-protocole', r: 'cabinet', l: T },

  { t: "Rougeurs du nez : couperose ou irritation", p: 'rougeurs-du-nez-couperose', r: 'peau', l: L },
  { t: "Visage gonflé après les fêtes : trois jours pour revenir", p: 'visage-gonfle-apres-les-fetes', r: 'circulation', l: G },
  { t: "Taches et laser : ce qui relève du médecin", p: 'taches-et-laser-ce-qui-releve-du-medecin', r: 'taches', l: P },

  // ----------------------------------------------------------------- janvier
  { t: "Reprendre sa peau en janvier : l'ordre qui marche", p: 'reprendre-sa-peau-en-janvier', r: 'peau', l: D },
  { t: "Cicatrices de boutons grattés : ce qu'on peut rattraper", p: 'cicatrices-de-boutons-grattes', r: 'cicatrices', l: M },
  { t: "Peeling superficiel ou moyen : ce que la profondeur change", p: 'peeling-superficiel-ou-moyen', r: 'taches', l: P },
  { t: "Protocole combiné : quand deux soins valent mieux qu'un", p: 'protocole-combine-deux-soins', r: 'cabinet', l: D },
  { t: "Acné du dos et du décolleté : les zones qu'on cache", p: 'acne-du-dos-et-du-decollete', r: 'peau', l: L },
  { t: "Front qui se creuse : os, graisse et muscle", p: 'front-qui-se-creuse', r: 'fermete', l: F },

  { t: "Lymphe et alimentation : ce que le sel fait au visage", p: 'lymphe-et-alimentation-le-sel', r: 'circulation', l: G },
  { t: "Niacinamide : l'actif le plus facile à vivre", p: 'niacinamide-l-actif-facile', r: 'peau', l: D },
  { t: "Taches résistantes : quand un peeling ne suffit plus", p: 'taches-resistantes-quand-le-peeling-ne-suffit-plus', r: 'taches', l: P },
  { t: "Grossesse : les soins possibles, trimestre par trimestre", p: 'grossesse-les-soins-possibles', r: 'cabinet', l: D },
  { t: "HIFU ou radiofréquence : ce qui décide du choix", p: 'hifu-ou-radiofrequence-comment-choisir', r: 'fermete', l: F },

  { t: "Ménopause et peau : ce qui change en trois ans", p: 'menopause-et-peau', r: 'fermete', l: F },
  { t: "Nettoyant moussant ou laitier : ce qui compte vraiment", p: 'nettoyant-moussant-ou-laitier', r: 'peau', l: D },
  { t: "Vergetures récentes : la fenêtre à ne pas manquer", p: 'vergetures-recentes-la-fenetre', r: 'cicatrices', l: M },
  { t: "Casablanca ou Paris : les protocoles sont les mêmes", p: 'casablanca-ou-paris-memes-protocoles', r: 'cabinet', l: C },
  { t: "Peau sensibilisée par un actif : combien de temps pour revenir", p: 'peau-sensibilisee-par-un-actif', r: 'peau', l: L },
  { t: "Œdème sous les yeux : ce qui le crée, ce qui le vide", p: 'oedeme-sous-les-yeux', r: 'circulation', l: G },
  { t: "Taches post-inflammatoires sur peau noire", p: 'taches-post-inflammatoires-peau-noire', r: 'taches', l: P },

  { t: "Photos de suivi : comment les prendre pour qu'elles servent", p: 'photos-de-suivi-comment-les-prendre', r: 'cabinet', l: D },
  { t: "Pores et maquillage : les textures qui les soulignent", p: 'pores-et-maquillage', r: 'peau', l: H },
  { t: "Acné et alimentation : ce que la recherche établit", p: 'acne-et-alimentation', r: 'peau', l: L },
  { t: "Cicatrice de césarienne : assouplir avant d'effacer", p: 'cicatrice-de-cesarienne', r: 'cicatrices', l: M },
  { t: "Exfoliation : la fréquence juste selon la peau", p: 'exfoliation-la-frequence-juste', r: 'taches', l: P },
  { t: "Tarifs des soins esthétiques : ce qui explique les écarts", p: 'tarifs-ce-qui-explique-les-ecarts', r: 'cabinet', l: T },

  { t: "Drainage du visage : le faire soi-même sans l'abîmer", p: 'drainage-du-visage-soi-meme', r: 'circulation', l: G },

  // Les trois articles de fondation du journal ferment le trimestre : ils
  // répondent aux questions que tous les autres supposent réglées.

  // Trois sujets de saison, ajoutés pour boucler le trimestre.
  { t: "Soin du visage avant un mariage : le rétroplanning", p: 'soin-avant-un-mariage-retroplanning', r: 'cabinet', l: D },
  { t: "Appareils à domicile : ce qu'ils font, ce qu'ils abîment", p: 'appareils-a-domicile', r: 'peau', l: D },
  { t: "Peau d'homme : ce qui change dans un protocole", p: 'peau-d-homme-ce-qui-change', r: 'peau', l: H },
];

/* Date de parution de l'entrée d'indice i, à partir du 1er novembre. */
export function dateDe(i) {
  const depart = new Date(`${DEBUT}T${HEURE}`);
  depart.setUTCDate(depart.getUTCDate() + i);
  return `${depart.toISOString().slice(0, 10)}T${HEURE}`;
}
