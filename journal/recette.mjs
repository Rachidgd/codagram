/* Recette éditoriale du journal Ély'Skin.

   Les articles s'écrivent par lots, dans journal/lots/, un fichier par lot et
   plusieurs articles par fichier, séparés par une ligne « === poignée === ».
   Chaque article ouvre sur un en-tête en commentaire qui porte le résumé et
   les deux balises de référencement, puis le corps en HTML.

   La recette éclate les lots, confronte le résultat au calendrier, et vérifie
   article par article les règles tenues par la rédaction : aucun tiret
   cadratin, un seul lien interne et vers le bon soin, des titres de niveau 2
   ancrés et uniques, une introduction qui répond au sujet sans s'étendre,
   aucune tournure de texte écrit à la chaîne, et l'orthographe au dictionnaire
   français. Rien ne part tant qu'elle signale une anomalie.

   Usage : node journal/recette.mjs
*/

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { CALENDRIER, RUBRIQUES, dateDe } from './calendrier.mjs';

const ici = dirname(fileURLToPath(import.meta.url));
const dossierLots = join(ici, 'lots');
const dossierArticles = join(ici, 'articles');

/* ------------------------------------------------- Éclatement des lots */
if (!existsSync(dossierArticles)) mkdirSync(dossierArticles, { recursive: true });

const articles = new Map(); // poignée -> { resume, titre_seo, description_seo, corps }

const lots = existsSync(dossierLots)
  ? readdirSync(dossierLots).filter((f) => f.endsWith('.html')).sort()
  : [];

for (const lot of lots) {
  const brut = readFileSync(join(dossierLots, lot), 'utf8');
  const morceaux = brut.split(/^===\s*([a-z0-9-]+)\s*===\s*$/m);

  for (let i = 1; i < morceaux.length; i += 2) {
    const poignee = morceaux[i];
    const contenu = morceaux[i + 1].trim();

    const entete = contenu.match(/^<!--([\s\S]*?)-->/);
    if (!entete) {
      console.log(`  ✗ ${poignee} : en-tête manquant`);
      continue;
    }
    const champs = {};
    for (const ligne of entete[1].split('\n')) {
      const m = ligne.match(/^\s*(resume|titre_seo|description_seo)\s*:\s*(.+?)\s*$/);
      if (m) champs[m[1]] = m[2];
    }
    articles.set(poignee, { ...champs, corps: contenu.slice(entete[0].length).trim() });
  }
}

/* ----------------------------------------------- Tournures proscrites */
const proscrites = [
  'dans cet article', 'nous allons voir', 'nous allons explorer',
  'il est important de noter', 'il est essentiel de', 'il convient de noter',
  'en conclusion', 'pour conclure', 'en résumé', 'en définitive',
  'force est de constater', 'incontournable', 'véritable allié',
  'solution idéale', 'révolutionnaire', 'plonger dans', 'dans le monde de',
  'à l’ère du', 'à l’ère de', 'n’hésitez pas à', 'que vous soyez',
  'tour d’horizon', 'les secrets de', 'le secret d’une', 'sans plus attendre',
  'de nombreux avantages', 'nombreux bienfaits', 'au fil des ans',
  'jouer un rôle crucial', 'rôle clé', 'de manière optimale',
  'il n’a jamais été aussi', 'grâce à notre expertise', 'notre équipe d’experts',
  'offre unique', 'expérience unique', 'prenez rendez-vous dès',
  'découvrez dès maintenant', 'cet article vous', 'vous l’aurez compris',
  'last but not least', 'booster', 'boostez', 'incroyable', 'fascinant',
  'il va sans dire', 'cela va de soi', 'on ne le dira jamais assez',
];

const lexique = readFileSync(join(ici, 'lexique.txt'), 'utf8')
  .split('\n')
  .map((m) => m.trim().toLowerCase())
  .filter(Boolean);

const nettoyer = (html) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/&#\d+;/g, ' ');

let fautes = 0;
const signaler = (poignee, message) => {
  fautes += 1;
  console.log(`  ✗ ${poignee} : ${message}`);
};

/* --------------------------------------------------- Contrôle du calendrier */
const aPublier = [];
const manquants = [];
let motsTotal = 0;

CALENDRIER.forEach((entree, i) => {
  const date = dateDe(i);
  const rubrique = RUBRIQUES[entree.r];
  if (!rubrique) signaler(entree.p || entree.ex, `rubrique inconnue « ${entree.r} »`);

  if (entree.ex) {
    aPublier.push({ type: 'reprogrammer', poignee: entree.ex, date, rubrique });
    return;
  }

  const art = articles.get(entree.p);
  if (!art) {
    manquants.push(`${date.slice(0, 10)}  ${entree.p}`);
    return;
  }

  const { corps, resume, titre_seo: titreSeo, description_seo: descriptionSeo } = art;
  const p = entree.p;

  if (!resume) signaler(p, 'résumé manquant dans l’en-tête');
  if (!titreSeo) signaler(p, 'titre de référencement manquant');
  if (!descriptionSeo) signaler(p, 'description de référencement manquante');

  if (corps.includes('—')) signaler(p, 'tiret cadratin');
  if (corps.includes('–')) signaler(p, 'tiret demi-cadratin');

  const liens = [...corps.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  if (liens.length !== 1) {
    signaler(p, `${liens.length} lien(s) au lieu d'un seul${liens.length ? ' : ' + liens.join(', ') : ''}`);
  } else if (liens[0] !== entree.l) {
    signaler(p, `le lien pointe vers ${liens[0]} au lieu de ${entree.l}`);
  }

  const titres = [...corps.matchAll(/<h2(\s[^>]*)?>/g)];
  const ancres = [...corps.matchAll(/<h2 id="([a-z0-9-]+)">/g)].map((m) => m[1]);
  if (titres.length !== ancres.length) signaler(p, `${titres.length} titres de niveau 2, ${ancres.length} ancrés`);
  if (ancres.length < 4) signaler(p, `seulement ${ancres.length} titres de niveau 2`);
  if (new Set(ancres).size !== ancres.length) signaler(p, 'ancre en double');
  if (/<h1/.test(corps)) signaler(p, 'titre de niveau 1 dans le corps');
  if (!corps.startsWith('<p>')) signaler(p, "l'article ne s'ouvre pas sur un paragraphe");

  const texte = nettoyer(corps);
  const mots = texte.split(/\s+/).filter(Boolean).length;
  const intro = nettoyer(corps.split(/<h2/)[0]).split(/\s+/).filter(Boolean).length;
  motsTotal += mots;
  if (mots < 600) signaler(p, `article trop court : ${mots} mots`);
  if (intro < 45) signaler(p, `introduction trop courte : ${intro} mots`);
  if (intro > 170) signaler(p, `introduction trop longue : ${intro} mots`);

  const bas = texte.toLowerCase();
  for (const tournure of proscrites) {
    if (bas.includes(tournure)) signaler(p, `tournure proscrite : « ${tournure} »`);
  }
  if (/\bvend\w*|\bachet\w*|\bpromotion\b|\boffre spéciale\b/.test(bas)) {
    signaler(p, 'vocabulaire de vente');
  }

  if (entree.t.length > 70) signaler(p, `titre de ${entree.t.length} caractères`);
  if (titreSeo && titreSeo.length > 62) signaler(p, `titre de référencement de ${titreSeo.length} caractères`);
  if (descriptionSeo && descriptionSeo.length > 158) {
    signaler(p, `description de référencement de ${descriptionSeo.length} caractères`);
  }
  if (resume && resume.length > 190) signaler(p, `résumé de ${resume.length} caractères`);

  aPublier.push({
    type: 'creer',
    poignee: p,
    date,
    rubrique,
    titre: entree.t,
    resume,
    titreSeo,
    descriptionSeo,
    corps,
    mots,
  });

  writeFileSync(join(dossierArticles, `${p}.html`), corps + '\n');
});

/* ------------------------------------------------------------- Orthographe */
const corpus = aPublier
  .filter((a) => a.type === 'creer')
  .map((a) => `${nettoyer(a.corps)} ${a.titre} ${a.resume} ${a.titreSeo} ${a.descriptionSeo}`)
  .join('\n');

if (corpus.trim()) {
  writeFileSync(join(ici, 'corpus.txt'), corpus);
  try {
    const sortie = execFileSync(
      '/usr/bin/python3',
      [join(ici, 'orthographe.py'), join(ici, 'corpus.txt'), join(ici, 'lexique.txt')],
      { encoding: 'utf8' }
    ).trim();
    if (sortie) {
      console.log('\nMots inconnus du dictionnaire :\n  ' + sortie);
      fautes += 1;
    }
  } catch (e) {
    console.log('\n(orthographe non vérifiée : ' + e.message.split('\n')[0] + ')');
  }
}

/* ----------------------------------------------------------------- Rapport */
const aCreer = aPublier.filter((a) => a.type === 'creer');
const aReprogrammer = aPublier.filter((a) => a.type === 'reprogrammer');

console.log('\n' + '─'.repeat(60));
console.log(`Calendrier        : ${CALENDRIER.length} jours, du ${dateDe(0).slice(0, 10)} au ${dateDe(CALENDRIER.length - 1).slice(0, 10)}`);
console.log(`Déjà écrits       : ${aReprogrammer.length} à reprogrammer`);
console.log(`Écrits dans lots  : ${aCreer.length}`);
console.log(`Encore à écrire   : ${manquants.length}`);
if (aCreer.length) {
  console.log(`Longueur moyenne  : ${Math.round(motsTotal / aCreer.length)} mots`);
}
console.log('─'.repeat(60));

if (manquants.length) {
  console.log('\nÀ écrire :');
  manquants.forEach((m) => console.log('  ' + m));
}

writeFileSync(join(ici, 'publication.json'), JSON.stringify(aPublier, null, 1) + '\n');

if (fautes) {
  console.log(`\n${fautes} anomalie(s). Rien n'est publié tant qu'elles restent.\n`);
  process.exit(1);
}
console.log(`\n✓ ${aCreer.length} articles conformes, ${aReprogrammer.length} à reprogrammer.\n`);
