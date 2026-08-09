#!/usr/bin/env node
/**
 * Recette automatisée du thème Ély'Skin.
 *
 * Vérifie ce qui casse réellement un thème Shopify en production et que
 * l'œil ne rattrape pas :
 *   1. chaque {% schema %} contient du JSON valide ;
 *   2. chaque type de section référencé dans un template JSON existe ;
 *   3. chaque snippet appelé par {% render %} existe ;
 *   4. chaque clé de traduction utilisée existe dans fr et en ;
 *   5. les gabarits obligatoires de Shopify sont tous présents ;
 *   6. aucun {% include %} (déprécié) ;
 *   7. les blocs déclarés dans les templates existent dans le schéma de la section.
 *
 * Sortie : liste des anomalies, code de sortie 1 si au moins une est bloquante.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const anomalies = [];
const avertissements = [];

const err = (m) => anomalies.push(m);
const avert = (m) => avertissements.push(m);

function lister(dossier, ext) {
  const chemin = join(racine, dossier);
  if (!existsSync(chemin)) return [];
  return readdirSync(chemin)
    .filter((f) => extname(f) === ext)
    .map((f) => join(chemin, f));
}

function lire(f) {
  return readFileSync(f, 'utf8');
}

/* ---------------------------------------------------------------- 1. Schémas */
const schemas = new Map(); // type de section -> { blocs: Set, presets: bool }

for (const fichier of lister('sections', '.liquid')) {
  const contenu = lire(fichier);
  const type = basename(fichier, '.liquid');
  const m = contenu.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);

  if (!m) {
    avert(`sections/${type}.liquid — aucun bloc schema (section non configurable)`);
    continue;
  }

  try {
    const schema = JSON.parse(m[1]);
    schemas.set(type, {
      blocs: new Set((schema.blocks || []).map((b) => b.type)),
      reglages: new Set((schema.settings || []).map((s) => s.id).filter(Boolean)),
    });

    // Shopify rejette une valeur par défaut vide sur les champs de saisie
    // libre. L'API de thème avale l'erreur en silence : le fichier n'est
    // simplement jamais écrit. Il faut donc l'attraper ici.
    const saisieLibre = new Set(['text', 'textarea', 'richtext', 'html', 'liquid']);
    const parcourir = (reglages, ou) => {
      for (const r of reglages || []) {
        if (saisieLibre.has(r.type) && r.default === '') {
          err(`sections/${type}.liquid — ${ou} « ${r.id} » : "default" vide, refusé par Shopify (retirer la clé)`);
        }

        // Un curseur doit tomber juste : Shopify exige que l'amplitude soit
        // un multiple du pas, et que la valeur par défaut soit atteignable.
        // Là encore, l'API écrit… rien, sans rien dire.
        if (r.type === 'range') {
          const { min, max, step } = r;
          if ([min, max, step].some((v) => typeof v !== 'number') || step <= 0) {
            err(`sections/${type}.liquid — ${ou} « ${r.id} » : min, max et step doivent être des nombres, step > 0`);
          } else {
            if ((max - min) % step !== 0) {
              err(
                `sections/${type}.liquid — ${ou} « ${r.id} » : (max ${max} − min ${min}) n'est pas un multiple du pas ${step}, refusé par Shopify`
              );
            }
            if (typeof r.default === 'number' && (r.default < min || r.default > max || (r.default - min) % step !== 0)) {
              err(`sections/${type}.liquid — ${ou} « ${r.id} » : la valeur par défaut ${r.default} n'est pas atteignable`);
            }
          }
        }
      }
    };
    parcourir(schema.settings, 'réglage');
    for (const b of schema.blocks || []) parcourir(b.settings, `réglage du bloc « ${b.type} »`);
  } catch (e) {
    err(`sections/${type}.liquid — schema JSON invalide : ${e.message}`);
  }
}

/* ------------------------------------------- 2 & 7. Templates JSON cohérents */
function verifierTemplate(fichier) {
  let data;
  try {
    data = JSON.parse(lire(fichier));
  } catch (e) {
    err(`${fichier.replace(racine + '/', '')} — JSON invalide : ${e.message}`);
    return;
  }

  const nom = fichier.replace(racine + '/', '');
  const sections = data.sections || {};

  for (const [cle, section] of Object.entries(sections)) {
    const type = section.type;
    if (!schemas.has(type)) {
      err(`${nom} — section « ${cle} » référence le type inexistant « ${type} »`);
      continue;
    }
    for (const [cleBloc, bloc] of Object.entries(section.blocks || {})) {
      if (!schemas.get(type).blocs.has(bloc.type)) {
        err(`${nom} — bloc « ${cleBloc} » de type « ${bloc.type} » absent du schéma de « ${type} »`);
      }
    }
    for (const id of section.block_order || []) {
      if (!(section.blocks || {})[id]) {
        err(`${nom} — block_order cite « ${id} » qui n'existe pas dans blocks`);
      }
    }
  }

  for (const id of data.order || []) {
    if (!sections[id]) err(`${nom} — order cite la section « ${id} » qui n'existe pas`);
  }
}

for (const f of lister('templates', '.json')) verifierTemplate(f);
for (const f of lister('sections', '.json')) verifierTemplate(f);

/* ------------------------------------------------------------- 3. Snippets */
const snippets = new Set(lister('snippets', '.liquid').map((f) => basename(f, '.liquid')));
const sourcesLiquid = [
  ...lister('sections', '.liquid'),
  ...lister('snippets', '.liquid'),
  ...lister('layout', '.liquid'),
  ...lister('templates', '.liquid'),
  ...lister('templates/customers', '.liquid'),
];

for (const fichier of sourcesLiquid) {
  const contenu = lire(fichier);
  const nom = fichier.replace(racine + '/', '');

  for (const m of contenu.matchAll(/\{%-?\s*render\s+'([^']+)'/g)) {
    if (!snippets.has(m[1])) err(`${nom} — {% render '${m[1]}' %} : snippet introuvable`);
  }
  if (/\{%-?\s*include\s/.test(contenu)) {
    err(`${nom} — utilise {% include %}, déprécié par Shopify au profit de {% render %}`);
  }
}

/* ------------------------------------------- 3 bis. Équilibre des balises */
const OUVRANTES = ['if', 'unless', 'for', 'case', 'form', 'paginate', 'capture', 'comment', 'schema', 'tablerow', 'style', 'javascript', 'raw', 'liquid'];

for (const fichier of sourcesLiquid) {
  const contenu = lire(fichier);
  const nom = fichier.replace(racine + '/', '');
  const pile = [];
  let ligneCourante = 1;
  let position = 0;

  for (const m of contenu.matchAll(/\{%-?\s*(end)?([a-z]+)/g)) {
    const [, fin, mot] = m;
    if (!OUVRANTES.includes(mot)) continue;

    ligneCourante += (contenu.slice(position, m.index).match(/\n/g) || []).length;
    position = m.index;

    if (fin) {
      const attendu = pile.pop();
      if (attendu !== mot) {
        err(`${nom}:${ligneCourante} — {% end${mot} %} inattendu (ouverture en cours : ${attendu || 'aucune'})`);
        pile.length = 0;
        break;
      }
    } else if (mot === 'liquid') {
      // La balise {% liquid %} est autonome : ses instructions internes ne
      // suivent pas la syntaxe {% %} et ne doivent pas entrer dans la pile.
      continue;
    } else {
      pile.push(mot);
    }
  }

  if (pile.length) {
    err(`${nom} — balise(s) non refermée(s) : ${pile.join(', ')}`);
  }
}

/* --------------------------------------------------------- 4. Traductions */
function aplatir(objet, prefixe = '') {
  const sortie = new Set();
  for (const [k, v] of Object.entries(objet)) {
    const cle = prefixe ? `${prefixe}.${k}` : k;
    if (v && typeof v === 'object') for (const s of aplatir(v, cle)) sortie.add(s);
    else sortie.add(cle);
  }
  return sortie;
}

const locales = {};
for (const f of lister('locales', '.json')) {
  const nom = basename(f, '.json').replace('.default', '');
  if (nom.endsWith('.schema')) continue;
  try {
    locales[nom] = aplatir(JSON.parse(lire(f)));
  } catch (e) {
    err(`locales/${basename(f)} — JSON invalide : ${e.message}`);
  }
}

const clesUtilisees = new Set();
for (const fichier of sourcesLiquid) {
  for (const m of lire(fichier).matchAll(/'([a-z_]+(?:\.[a-z_]+)+)'\s*\|\s*t\b/g)) {
    clesUtilisees.add(m[1]);
  }
}

for (const [langue, disponibles] of Object.entries(locales)) {
  for (const cle of clesUtilisees) {
    if (!disponibles.has(cle)) err(`locales/${langue} — clé de traduction manquante : ${cle}`);
  }
}

/* --------------------------------------------- 5. Gabarits obligatoires */
const requis = [
  '404', 'article', 'blog', 'cart', 'collection', 'index',
  'list-collections', 'page', 'password', 'product', 'search', 'gift_card',
];
for (const nom of requis) {
  const existe = ['json', 'liquid'].some((e) => existsSync(join(racine, 'templates', `${nom}.${e}`)));
  if (!existe) err(`templates/${nom}.(json|liquid) — gabarit obligatoire manquant`);
}

const clients = [
  'account', 'activate_account', 'addresses', 'login', 'order', 'register', 'reset_password',
];
for (const nom of clients) {
  const existe = ['json', 'liquid'].some((e) =>
    existsSync(join(racine, 'templates', 'customers', `${nom}.${e}`))
  );
  if (!existe) err(`templates/customers/${nom} — gabarit client obligatoire manquant`);
}

for (const nom of ['theme.liquid', 'password.liquid']) {
  if (!existsSync(join(racine, 'layout', nom))) err(`layout/${nom} — manquant`);
}

/* -------------------------------------------------- 6. Budget des ressources */
const budgets = [
  ['assets/ely.css', 90_000],
  ['assets/ely.js', 40_000],
  ['assets/diagnostic.js', 20_000],
];
for (const [chemin, max] of budgets) {
  const complet = join(racine, chemin);
  if (!existsSync(complet)) {
    err(`${chemin} — absent (lancer « npm run build »)`);
    continue;
  }
  const taille = statSync(complet).size;
  if (taille > max) avert(`${chemin} — ${taille} octets, au-delà du budget de ${max}`);
}

/* ------------------------------------------------------------------ Rapport */
console.log('\nRECETTE DU THÈME — Ély’Skin Paris');
console.log('─'.repeat(56));
console.log(`Sections analysées   : ${schemas.size}`);
console.log(`Snippets disponibles : ${snippets.size}`);
console.log(`Clés de traduction   : ${clesUtilisees.size} utilisées`);
console.log('─'.repeat(56));

if (avertissements.length) {
  console.log(`\nAvertissements (${avertissements.length}) :`);
  avertissements.forEach((a) => console.log(`  · ${a}`));
}

if (anomalies.length) {
  console.log(`\nAnomalies bloquantes (${anomalies.length}) :`);
  anomalies.forEach((a) => console.log(`  ✗ ${a}`));
  console.log('');
  process.exit(1);
}

console.log('\n✓ Aucune anomalie bloquante.\n');
