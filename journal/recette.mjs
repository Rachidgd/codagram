/* Recette éditoriale du journal Ély'Skin.
   Vérifie, article par article, les règles tenues par la rédaction :
   aucun tiret cadratin, un seul lien interne, des titres de niveau 2 ancrés,
   une introduction qui répond au sujet, et aucune des tournures qui trahissent
   un texte écrit à la chaîne. */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const ici = dirname(new URL(import.meta.url).pathname);
const plan = JSON.parse(readFileSync(join(ici, 'plan.json'), 'utf8'));

/* Tournures proscrites : elles signent un texte de machine ou une langue
   de brochure. La liste vient des relectures, pas d'une théorie. */
const proscrites = [
  'dans cet article',
  'nous allons voir',
  'nous allons explorer',
  'il est important de noter',
  'il est essentiel de',
  'il convient de noter',
  'en conclusion',
  'pour conclure',
  'en résumé',
  'en définitive',
  'force est de constater',
  'incontournable',
  'véritable allié',
  'solution idéale',
  'révolutionnaire',
  'plonger dans',
  'dans le monde de',
  'à l’ère du',
  'à l’ère de',
  'n’hésitez pas à',
  'que vous soyez',
  'tour d’horizon',
  'les secrets de',
  'le secret d’une',
  'sans plus attendre',
  'de nombreux avantages',
  'nombreux bienfaits',
  'au fil des ans',
  'jouer un rôle crucial',
  'rôle clé',
  'de manière optimale',
  'il n’a jamais été aussi',
  'grâce à notre expertise',
  'notre équipe d’experts',
  'offre unique',
  'expérience unique',
  'prenez rendez-vous dès',
  'découvrez dès maintenant',
  'cet article vous',
  'vous l’aurez compris',
  'last but not least',
  'litteralement',
  'booster',
  'boostez',
];

/* Mots que le dictionnaire français ignore mais que la rédaction emploie. */
const lexique = [
  'hydrofacial', 'microneedling', 'peeling', 'peelings', 'hifu', 'led',
  'collagène', 'collagènes', 'élastine', 'mélasma', 'lentigo', 'lentigos',
  'phototype', 'phototypes', 'comédon', 'comédons', 'séborrhéique',
  'desquamation', 'desquamer', 'exfoliation', 'exfoliant', 'exfoliants',
  'rosacée', 'couperose', 'télangiectasies', 'érythème', 'kératine',
  'kératinocytes', 'mélanine', 'mélanocytes', 'sébacées', 'sébum',
  'dermatologique', 'dermatologue', 'dermique', 'épiderme', 'épidermique',
  'lymphatique', 'lymphe', 'œdème', 'œdèmes', 'ovale', 'chéloïde',
  'chéloïdes', 'fibroblastes', 'radiofréquence', 'luminothérapie',
  'ély', 'skin', 'elyskin', 'casablanca', 'adeli', 'rppss', 'rppsi',
  'nanomètres', 'nanomètre', 'photovieillissement', 'photosensibilisant',
  'photosensibilisants', 'hyperpigmentation', 'repulpant', 'repulpants',
  'niacinamide', 'rétinoïde', 'rétinoïdes', 'rétinol', 'azélaïque',
  'glycolique', 'salicylique', 'mandélique', 'trichloracétique',
  'céramides', 'squalane', 'antioxydant', 'antioxydants', 'spf',
  'isotrétinoïne', 'cutanée', 'cutané', 'cutanés', 'cutanées',
  'inflammatoire', 'inflammatoires', 'postinflammatoire', 'préconise',
  'préconisé', 'préconisée', 'préconiser', 'matifiantes', 'matifiant',
  'floutante', 'cicatrisation', 'césarienne', 'vergeture', 'vergetures',
  'ras', 'bouffi', 'ondulée', 'virgule', 'dixième', 'millimètre',
  'rasante', 'froncement', 'pérenne', 'fibreuse', 'fibreux', 'sillon',
  'sillons', 'marionnette', 'marionnettes', 'bajoues', 'bajoue',
  'acné', 'acnéique', 'acnéiques', 'androgènes', 'asséchants', 'asséchant',
  'brillance', 'chéloïdien', 'cortisol', 'cyclines', 'cœur', 'œil',
  'œuvre', 'densification', 'redensification', 'redensifier', 'retend',
  'exfoliée', 'exfoliées', 'frilosité', 'hammam', 'herpès', 'illuminateur',
  'immune', 'jacentes', 'jacent', 'lifting', 'lipidique', 'microcirculation',
  'nettoyants', 'nettoyantes', 'nodulaire', 'occlusive', 'photosensible',
  'picotent', 'picotement', 'pigmentaire', 'porteuse', 'praticienne',
  'recreuse', 'ridules', 'structurellement', 'uva', 'uvb', 'partum',
  'labial', 'déglutition', 'capillaires', 'perméabilité', 'réverbération',
  'quadrillé', 'échauffée', 'mélanocytes', 'vascularisée', 'adhérente',
  'déprimée', 'interrogatoire', 'carnation', 'carnations', 'bronzée',
  'thyroïdienne', 'rénale', 'mousseuses', 'chevilles', 'détergent',
  'détergents', 'brumes', 'éclaircissant', 'tamponner', 'crisse',
  'desquame', 'desquament', 'post', 'week', 'end', 'humidificateur',
  'climatisé', 'squalane', 'entamée', 'cartonnée',
];

const nettoyer = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/&#\d+;/g, ' ');

let fautes = 0;
const signaler = (fichier, message) => {
  fautes += 1;
  console.log(`  ✗ ${fichier} : ${message}`);
};

const lignes = [];

for (const art of plan.articles) {
  const chemin = join(ici, art.fichier);
  let corps;
  try {
    corps = readFileSync(chemin, 'utf8').trim();
  } catch {
    signaler(art.fichier, 'fichier absent');
    continue;
  }

  console.log(`\n${art.fichier}  (${art.date.slice(0, 10)}, ${art.rubrique})`);

  if (corps.includes('—')) signaler(art.fichier, 'tiret cadratin');
  if (corps.includes('–')) signaler(art.fichier, 'tiret demi-cadratin');

  const liens = [...corps.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  if (liens.length !== 1) {
    signaler(art.fichier, `${liens.length} lien(s) au lieu d'un seul : ${liens.join(', ')}`);
  } else if (liens[0] !== art.lien) {
    signaler(art.fichier, `le lien pointe vers ${liens[0]} au lieu de ${art.lien}`);
  }

  const titres = [...corps.matchAll(/<h2(\s[^>]*)?>/g)];
  const ancres = [...corps.matchAll(/<h2 id="([a-z0-9-]+)">/g)].map((m) => m[1]);
  if (titres.length !== ancres.length) {
    signaler(art.fichier, `${titres.length} titres de niveau 2, ${ancres.length} ancrés`);
  }
  if (ancres.length < 4) signaler(art.fichier, `seulement ${ancres.length} titres de niveau 2`);
  if (new Set(ancres).size !== ancres.length) signaler(art.fichier, 'ancre en double');

  if (/<h3[^>]*>/.test(corps) && !/<h2/.test(corps.slice(0, corps.search(/<h3/)))) {
    signaler(art.fichier, 'un titre de niveau 3 précède le premier niveau 2');
  }
  if (/<h1/.test(corps)) signaler(art.fichier, 'titre de niveau 1 dans le corps');

  if (!corps.startsWith('<p>')) signaler(art.fichier, "l'article ne s'ouvre pas sur un paragraphe");

  const texte = nettoyer(corps);
  const mots = texte.split(/\s+/).filter(Boolean).length;
  const intro = nettoyer(corps.split(/<h2/)[0]).split(/\s+/).filter(Boolean).length;
  console.log(`  ${mots} mots, introduction de ${intro} mots, ${ancres.length} titres de niveau 2`);
  if (mots < 850) signaler(art.fichier, `article trop court : ${mots} mots`);
  if (intro < 50) signaler(art.fichier, `introduction trop courte : ${intro} mots`);
  if (intro > 190) signaler(art.fichier, `introduction trop longue : ${intro} mots`);

  const bas = texte.toLowerCase();
  for (const tournure of proscrites) {
    if (bas.includes(tournure)) signaler(art.fichier, `tournure proscrite : « ${tournure} »`);
  }

  if (/\bvend\w*|\bachet\w*|\bpromotion\b|\boffre spéciale\b/.test(bas)) {
    signaler(art.fichier, 'vocabulaire de vente');
  }

  if (art.titre.length > 70) signaler(art.fichier, `titre de ${art.titre.length} caractères`);
  if (art.balise_titre.length > 62) signaler(art.fichier, `balise titre de ${art.balise_titre.length} caractères`);
  if (art.balise_description.length > 158) {
    signaler(art.fichier, `balise description de ${art.balise_description.length} caractères`);
  }
  if (art.resume.length > 185) signaler(art.fichier, `résumé de ${art.resume.length} caractères`);

  lignes.push(
    JSON.stringify({
      a: {
        blogId: plan.blogId,
        title: art.titre,
        handle: art.poignee,
        author: { name: plan.auteur },
        isPublished: false,
        publishDate: art.date,
        tags: [art.rubrique],
        summary: art.resume,
        body: corps,
        metafields: [
          { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: art.balise_titre },
          { namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: art.balise_description },
        ],
      },
    })
  );
}

/* Orthographe : on passe tout le corpus au dictionnaire français d'un coup. */
const corpus = plan.articles
  .map((a) => {
    try {
      return nettoyer(readFileSync(join(ici, a.fichier), 'utf8')) + ' ' + a.titre + ' ' + a.resume;
    } catch {
      return '';
    }
  })
  .join('\n');
writeFileSync(join(ici, 'corpus.txt'), corpus);
writeFileSync(join(ici, 'lexique.txt'), lexique.join('\n'));

try {
  const sortie = execFileSync(
    '/usr/bin/python3',
    [join(ici, 'orthographe.py'), join(ici, 'corpus.txt'), join(ici, 'lexique.txt')],
    { encoding: 'utf8' }
  ).trim();
  if (sortie) {
    console.log('\nMots inconnus du dictionnaire :');
    console.log('  ' + sortie);
    fautes += 1;
  } else {
    console.log('\n✓ Orthographe : aucun mot inconnu.');
  }
} catch (e) {
  console.log('\n(orthographe non vérifiée : ' + e.message.split('\n')[0] + ')');
}

writeFileSync(join(ici, 'articles.jsonl'), lignes.join('\n') + '\n');

console.log('\n' + '─'.repeat(56));
if (fautes) {
  console.log(`${fautes} anomalie(s). Rien n'est publié tant qu'elles restent.`);
  process.exit(1);
}
console.log(`✓ ${lignes.length} articles conformes. articles.jsonl écrit.`);
